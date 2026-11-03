import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pdfToolCalculation} from '../pdf-tools-ui.js';
import {planningView,readPlanningForm} from '../planning-ui.js';
import {makePlan} from '../planner.js';
import {doughWeight} from '../dough-weight.js';
const table=JSON.parse(readFileSync(new URL('../flour-table.json',import.meta.url)));
const recipe=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url)))[0];
test('Gärzeiten button calculates both phases through the public form adapter',()=>{
 const html=pdfToolCalculation('pdfGare',{pdfFlour:'Weizenmehl Type 550',pdfGareTemp:20},table);
 assert.match(html,/4.5 ± 0.9 h/);assert.match(html,/2 ± 0.4 h/);
 assert.doesNotMatch(html,/NaN|undefined/);
});
function readRenderedForm(overrides={},source=recipe){
 const html=planningView(source,String,new Date(),table),fields={};
 for(const match of html.matchAll(/<input\b[^>]*>/g)){const id=match[0].match(/id="([^"]+)"/)?.[1],value=match[0].match(/value="([^"]*)"/)?.[1]||'';if(id)fields[id]={value,checked:match[0].includes(' checked')};}
 for(const match of html.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){const options=[...match[2].matchAll(/<option([^>]*)>([^<]*)<\/option>/g)];const option=options.find(x=>x[1].includes('selected'))||options[0];fields[match[1]]={value:option?.[1].match(/value="([^"]*)"/)?.[1]??option?.[2]??''};}
 for(const [id,value] of Object.entries(overrides))fields[id]={value:String(value)};
 return readPlanningForm(source,id=>fields[id]);
}
test('rendered planner scales complete water balance and schedules brew preparation',()=>{
 const result=readRenderedForm({loaves:2,flourPerLoaf:500,waterAmount:400,brewFlour:50,brewWater:100,brewCoolMinutes:90,altbrot:25,altbrotRatio:3,stockHours:4,proofHours:2,finish:'2030-01-10T20:00'});
 const r=result.recipe;
 assert.equal(r.waterBalance.totalRecipeWater,800);
 assert.equal(r.waterBalance.mainWater,450);
 assert.equal(r.waterBalance.brewWater,200);
 assert.equal(r.waterBalance.altbrotWater,150);
 assert.equal(r.waterBalance.reserve,350);
 assert.ok(Math.abs(doughWeight(r)-r.waterBalance.doughMass)<1);
 const plan=makePlan(r,result.finish,'00:00','00:00',true,result.preheat,null,null,result.options);
 const brew=plan.steps.find(s=>s.title==='Brühstück ansetzen'),mix=plan.steps.find(s=>s.title==='Teig mischen');
 assert.equal((mix.at-brew.at)/60000,100);
 assert.ok(plan.steps.some(s=>s.title==='Brühstücktemperatur prüfen'));
});
test('cold proof is retained when its duration equals warm proof',()=>{
 const r={...recipe,proof:[2,2],cold:[2,2]};
 const plan=makePlan(r,new Date('2030-01-10T20:00'),'00:00','00:00',true,60,null,null,{mode:'cold'});
 assert.equal(plan.cold,true);assert.ok(plan.steps.some(s=>s.title==='Kühlschrankgare beginnen'));
 assert.throws(()=>makePlan({...r,cold:null},new Date('2030-01-10'),'00:00','00:00',true,60,null,null,{mode:'cold'}),/keine Kühlschrankgare/);
});
test('multiple PDF oven loads preheat once and keep later phases ordered',()=>{
 const plan=makePlan(recipe,new Date('2030-01-10T20:00'),'00:00','00:00',true,60,null,null,{pdfStandardBake:true,ovenLoads:2});
 assert.equal(plan.steps.filter(s=>/vorheizen/.test(s.title)).length,1);
 const starts=plan.steps.filter(s=>/Einschießen/.test(s.title));
 assert.equal(starts.length,2);assert.equal((starts[1].at-starts[0].at)/60000,50);
});

test('catalog flours resolve to the PDF table and original seed soakers survive scaling',()=>{
 const recipes=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url)));
 for(const r of recipes)for(const f of r.flours)assert.ok(table.some(x=>x.name===f.name),f.name);
 const source=recipes.find(r=>r.id==='starter-dinkel-saaten');
 const out=readRenderedForm({loaves:2,flourPerLoaf:500},source).recipe;
 assert.equal(out.water,600);
 assert.equal(out.waterBalance.soakerWater,180);
 assert.equal(out.soaker.items.reduce((sum,x)=>sum+x.grams,0),180);
 assert.equal(out.soaker.water,180);
 assert.equal(out.waterBalance.doughMass,2280);
 assert.equal(doughWeight(out),2280);
 const plan=makePlan(out,new Date('2030-01-10T20:00'),'00:00','00:00',true);
 assert.match(plan.steps.find(s=>s.title==='Quellstück ansetzen').detail,/120 g Sonnenblumenkerne/);
});
