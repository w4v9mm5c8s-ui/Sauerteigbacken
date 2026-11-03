import test from 'node:test';import assert from 'node:assert/strict';
import {ingredientPhases,checklistState,checkIngredient,incompletePhase,pendingPreparations} from '../phase-checklist.js';
import {parseOwnRecipe,recipeToRaw,ownRecipeForm} from '../own-recipe-parser.js';
import {pdfPlanRecipes} from '../pdf-recipe-plans.js';import {makePlan} from '../planner.js';
test('ingredient checks are invalidated by changed quantities and are phase-specific',()=>{
 const ingredients=pdfPlanRecipes().find(r=>r.id==='pdf-toast'),b={ingredients};
 const p=ingredientPhases(ingredients);assert.ok(p['Autolyse ansetzen'].some(x=>x.name==='Milch'));assert.ok(!p['Autolyse ansetzen'].some(x=>x.name==='Butter'));
 for(let i=0;i<p['Teig mischen'].length;i++)checkIngredient(b,'Teig mischen:'+i);
 assert.equal(incompletePhase(b,'Teig mischen'),false);assert.equal(incompletePhase(b,'Autolyse ansetzen'),true);
 b.ingredients.salt=12;assert.deepEqual(checklistState(b).checked,{});
});
test('jumping ahead does not complete prerequisite phases',()=>{
 const b={steps:[{title:'Autolyse ansetzen'},{title:'Starter prüfen'},{title:'Teig mischen'}],index:2,logs:{0:{completedAt:'today'}}};
 assert.deepEqual(pendingPreparations(b),['Starter prüfen']);b.logs[1]={completedAt:'today'};assert.deepEqual(pendingPreparations(b),[]);
});
test('milk-only own recipe preserves hydration, starter selection and all oven phases',()=>{
 const raw={title:'Milchtoast',ingredients:'500 g Weizenmehl\n270 g Milch\n50 g Starter\n9 g Salz',steps:'Mischen\nBacken',bakeTemp:195,bakeMin:45,stockHours:4,proofHours:3,starterType:'Dinkel',starterHydration:80,bakePhases:'200; 10; Anbacken\n190; 35; Fertig backen'};
 const r=parseOwnRecipe(raw);assert.equal(r.water,0);assert.equal(r.starter.hydration,80);assert.equal(r.bake.length,2);
 const again=parseOwnRecipe(recipeToRaw(r));assert.deepEqual(again.bake,r.bake);assert.equal(again.water,0);
 assert.match(ownRecipeForm(raw),/<option selected>Dinkel/);
 assert.throws(()=>parseOwnRecipe({...raw,bakePhases:'NaN; 10'}),/Backphasen/);
});
test('cooked flour stage uses recipe flour once and appears before mixing',()=>{
 const r=pdfPlanRecipes()[0];r.brew={method:'cook',flour:50,water:100,coolMinutes:60};r.water=220;
 const phases=ingredientPhases(r);assert.equal(phases['Autolyse ansetzen'][0].grams,450);assert.equal(phases['Kochstück ansetzen'][0].grams,50);
 const p=makePlan(r,new Date('2030-01-10T20:00'),'00:00','00:00',true,60,null,null,{kneadMethod:'hand'});
 const cook=p.steps.find(s=>s.title==='Kochstück ansetzen'),mix=p.steps.find(s=>s.title==='Teig mischen');assert.ok(cook.at<mix.at);assert.match(cook.detail,/Rühren aufkochen/);assert.match(mix.detail,/8–12 Minuten/);
});
import {makeBackup,validateBackup} from '../backup.js';
import {starterListView} from '../starter-tracking.js';
test('backups retain chat, per-recipe defaults, recipe versions and ingredient checks',()=>{
 const data={history:[],shopping:[],starters:[],chatMessages:[{role:'user',content:'Test'}],recipeProfiles:{bread:{values:{stockHours:4}}},ownRecipes:[{versions:[{title:'Alt'}]}]};
 const result=validateBackup(makeBackup(data));assert.deepEqual(result.chatMessages,data.chatMessages);assert.deepEqual(result.recipeProfiles,data.recipeProfiles);assert.deepEqual(result.ownRecipes,data.ownRecipes);
});
test('starter log controls address original indices and expose the complete PDF ratios',()=>{
 const html=starterListView([{logs:Array.from({length:7},(_,i)=>({date:String(i),peakHours:3,ratio:'1:1:1',temperature:22}))}]);
 assert.match(html,/starterLogEdit:0:6/);assert.match(html,/starterLogDelete:0:2/);assert.doesNotMatch(html,/starterLogDelete:0:0/);assert.match(html,/1:10:10/);
});
