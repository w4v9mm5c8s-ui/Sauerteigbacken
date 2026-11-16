import test from 'node:test';import assert from 'node:assert/strict';
import {pdfPlanRecipes} from '../pdf-recipe-plans.js';import {planningView,readPlanningForm} from '../planning-ui.js';import {makePlan} from '../planner.js';import {overlaps} from '../planning-conflicts.js';import {lessonView} from '../interactive-lessons.js';
function prepare(r){const html=planningView(r,String,new Date());const fields={};for(const m of html.matchAll(/<input\b[^>]*>/g)){const id=m[0].match(/id="([^"]+)"/)?.[1];if(id)fields[id]=m[0].match(/value="([^"]*)"/)?.[1]||'';}for(const m of html.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){const options=[...m[2].matchAll(/<option([^>]*)>([^<]*)<\/option>/g)],o=options.find(x=>x[1].includes('selected'))||options[0];fields[m[1]]=o?.[1].match(/value="([^"]*)"/)?.[1]??o?.[2]??'';}Object.assign(fields,{planMode:'full',finish:'2030-01-10T20:00',sleepFrom:'00:00',sleepTo:'00:00'});return readPlanningForm(r,id=>({value:String(fields[id]??''),checked:id==='starterReady'}));}
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

test('catalog and PDF templates keep flour and water quantities from form through baking', async()=>{
 const {readFileSync}=await import('node:fs');
 const catalog=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url),'utf8'));
 for(const recipe of [...catalog,...pdfPlanRecipes()]){
  const form=prepare(recipe),plan=makePlan(form.recipe,form.finish,form.from,form.to,true,60,null,null,form.options);
  assert.ok(plan?.steps.length,recipe.id);
  assert.equal(form.recipe.waterBalance.totalRecipeWater,recipe.water,recipe.id);
  assert.equal(form.recipe.waterBalance.flourMass,recipe.flours.reduce((n,x)=>n+x.grams,0),recipe.id);
  assert.equal(plan.steps.at(-1).title,'Auskühlen lassen',recipe.id);
 }
});

test('saved cooked flour and water round-trip through editor, scaling and planning',async()=>{
 const {parseOwnRecipe,recipeToRaw}=await import('../own-recipe-parser.js');
 const input={title:'Kochstückbrot',ingredients:'500 g Weizenmehl\n350 g Wasser\n100 g Starter',steps:'Mischen\nBacken',stockHours:4,proofHours:2,bakeTemp:220,bakeMin:40,brewMethod:'cook',brewFlour:30,brewWater:150,brewCoolMinutes:90};
 const saved=parseOwnRecipe(input);
 assert.deepEqual(parseOwnRecipe(recipeToRaw(saved)).brew,saved.brew);
 const form=prepare(saved);
 assert.equal(form.recipe.water,200);
 assert.equal(form.recipe.brew.water,150);
 const plan=makePlan(form.recipe,form.finish,form.from,form.to,true);
 assert.ok(plan.steps.some(s=>s.title==='Kochstück ansetzen'));
 assert.throws(()=>parseOwnRecipe({...input,brewWater:355}));
});
test('temperature calibration reproduces the measured batch and responds to room temperature',async()=>{
 const {mixingFriction,waterTempSuggestion}=await import('../flour-table.js');
 const factor=mixingFriction(20,21,22,27,24);
 assert.equal(waterTempSuggestion(24,21,22,20,factor),27);
 assert.equal(waterTempSuggestion(24,21,22,21,factor),26);
 assert.equal(mixingFriction(20,21,null,27,24),null);
});
test('cloud resolution preserves separately chosen edits and deletions',async()=>{
 const {resolveCloudChoices}=await import('../workflow-tools.js');
 const result=resolveCloudChoices({pantry:[{id:'a',amount:1},{id:'b',amount:3}]},{pantry:[{id:'a',amount:2},{id:'c',amount:4}]},{'pantry:a':'cloud','pantry:b':'local','pantry:c':'local'});
 assert.deepEqual(result.pantry,[{id:'a',amount:2},{id:'b',amount:3}]);
});
