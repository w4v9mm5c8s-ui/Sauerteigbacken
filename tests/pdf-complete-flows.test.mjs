import test from 'node:test';import assert from 'node:assert/strict';
import {pdfPlanRecipes} from '../pdf-recipe-plans.js';import {planningView,readPlanningForm} from '../planning-ui.js';import {makePlan} from '../planner.js';import {overlaps} from '../planning-conflicts.js';import {lessonView} from '../interactive-lessons.js';
function prepare(r){const html=planningView(r,String,new Date());const fields={};for(const m of html.matchAll(/<input\b[^>]*>/g)){const id=m[0].match(/id="([^"]+)"/)?.[1];if(id)fields[id]=m[0].match(/value="([^"]*)"/)?.[1]||'';}for(const m of html.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){const options=[...m[2].matchAll(/<option([^>]*)>([^<]*)<\/option>/g)],o=options.find(x=>x[1].includes('selected'))||options[0];fields[m[1]]=o?.[1].match(/value="([^"]*)"/)?.[1]??o?.[2]??'';}Object.assign(fields,{finish:'2030-01-10T20:00',sleepFrom:'00:00',sleepTo:'00:00'});return readPlanningForm(r,id=>({value:String(fields[id]??''),checked:id==='starterReady'}));}
test('all nine PDF recipes pass their actual editable planning form',()=>{for(const r of pdfPlanRecipes()){const form=prepare(r);const plan=makePlan(form.recipe,form.finish,form.from,form.to,true,60,null,null,form.options);assert.ok(plan,r.id);const active=plan.steps.filter(s=>s.active);for(let i=1;i<active.length;i++)assert.equal(overlaps(active[i-1],active[i]),false,r.id+' overlapping steps');}});
test('yogurt cold bulk precedes shaping; airfryer preserves all five bake phases',()=>{const yogurt=prepare(pdfPlanRecipes().find(r=>r.id==='pdf-joghurt'));const p=makePlan(yogurt.recipe,yogurt.finish,'00:00','00:00',true,60,null,null,yogurt.options);assert.ok(p.steps.find(s=>s.title==='Kalte Stockgare beginnen').at<p.steps.find(s=>s.title==='Formen').at);const air=prepare(pdfPlanRecipes().find(r=>r.id==='pdf-airfryer'));const a=makePlan(air.recipe,air.finish,'00:00','00:00',true);assert.equal(a.steps.filter(s=>s.title==='Backphase starten').length,5);assert.ok(a.steps.some(s=>s.detail.includes('umdrehen')));});
test('interactive lesson changes its instruction and disables unavailable steps',()=>{assert.notEqual(lessonView('falten',0),lessonView('falten',1));assert.match(lessonView('falten',0),/disabled/);});
test('researched defaults carry sources, preserve PDF quantities and produce feeding plans',()=>{
 for(const r of pdfPlanRecipes()){
  assert.ok(r.research.sources.every(s=>s.url.startsWith('https://')));
  assert.equal(r.needsTiming,false);assert.ok(r.salt>0);assert.ok(r.starter.hydration>0);
  const form=prepare(r);
  assert.equal(form.recipe.salt,r.salt);
  assert.equal(form.recipe.starter.hydration,r.starter.hydration);
  assert.equal(form.recipe.waterBalance.totalRecipeWater,r.water);
  const p=makePlan(form.recipe,form.finish,'00:00','00:00',false,60,null,null,form.options);
  assert.ok(p.steps.some(s=>s.title==='Starter füttern'),r.id);
  assert.match(planningView(r,String,new Date()),/Quellen und ergänzte Richtwerte/);
  if(r.soaker){assert.equal(form.recipe.soaker.hours,12);assert.ok(p.steps.some(s=>s.detail.includes('6–8 °C')));}
  if(r.id==='pdf-roggen1150')assert.ok(!p.steps.some(s=>/Fold/.test(s.title)));
  if(r.id==='pdf-joghurt'){assert.equal(form.recipe.coldBulkHours,12);assert.equal(form.recipe.salt,9);}
 }
 assert.match(pdfPlanRecipes().find(r=>r.id==='pdf-proteinbrot').sourceNote,/Versuchsrezept/);
});
test('special recipe instructions survive form conversion and scheduling',()=>{
 for(const [id,expected] of [['pdf-toast',/Mehl, Milch und Honig/],['pdf-joghurt',/Mehle, Wasser und Joghurt/]]){
 const f=prepare(pdfPlanRecipes().find(r=>r.id===id));const p=makePlan(f.recipe,f.finish,'00:00','00:00',true,60,null,null,f.options);
 assert.match(p.steps.find(s=>s.title==='Autolyse ansetzen').detail,expected);
 }
 const f=prepare(pdfPlanRecipes().find(r=>r.id==='pdf-roggen1150'));const p=makePlan(f.recipe,f.finish,'00:00','00:00',true,60,null,null,f.options);
 assert.equal(p.steps.find(s=>s.title==='Auskühlen lassen').minutes,720);
 assert.match(p.steps.find(s=>s.title==='Auskühlen lassen').detail,/720/);
});
test('additional soaker has its actual ingredient and duration-independent cooling guidance',()=>{
 const r=pdfPlanRecipes().find(r=>r.id==='pdf-dinkel-koerner');r.soaker.hours=8;r.additionalSoaker={name:'Haferflocken',grams:30,water:30,hours:4};
 const p=makePlan(r,new Date('2030-01-10T20:00'),'00:00','00:00',true);
 assert.ok(p.steps.some(s=>/30 g Haferflocken mit 30 g/.test(s.detail)));
 assert.ok(!p.steps.some(s=>/12 Stunden/.test(s.detail)));
});
