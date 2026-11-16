import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recipeSteps,foldDefaults,ovenChoices} from '../beginner-baking.js';
import {makePlan} from '../planner.js';
const recipes=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url)));
const loaf=recipes[0];
const plan=(equipment,stockMinutes)=>makePlan(loaf,new Date(Date.now()+4*86400000),'00:00','00:00',true,45,null,null,{equipment,stockMinutes,mode:'warm'}).steps;
test('folds begin after mixing and stay inside the single first rise',()=>{
 const steps=plan('Backblech',150);
 const bulk=steps.find(s=>s.title==='Stockgare');
 const folds=steps.filter(s=>s.title.includes('Fold'));
 assert.deepEqual(folds.map(s=>(s.at-bulk.at)/60000),[30,60,90]);
 assert.equal(bulk.at,steps.find(s=>s.title==='Teig mischen').at+15*60000);
 assert.equal(bulk.at+150*60000,steps.find(s=>s.title==='Formen').at);
 assert.match(plan('Backblech',75).find(s=>s.title.includes('Fold')).title,/1\/1/);
 assert.equal(foldDefaults(recipes.find(r=>r.id==='starter-roggenmisch-60-40')).count,0);
});
test('the chosen equipment follows the loaf from recipe to baking instructions',()=>{
 assert.deepEqual(ovenChoices(loaf),['Backblech','Pizzastein auf dem Backblech','Gusseisentopf']);
 assert.doesNotMatch(recipeSteps(loaf,'Backblech').join(' '),/Deckel|Gärkörbchen|Topf/);
 assert.match(recipeSteps(loaf,'Gusseisentopf','round').join(' '),/Gärkörbchen/);
 assert.match(plan('Gusseisentopf',150).filter(s=>s.title==='Backphase starten')[1].detail,/Deckel abnehmen/);
 assert.match(plan('Backblech',150).find(s=>s.title==='Backphase starten').detail,/Backblech offen/);
 assert.deepEqual(ovenChoices(recipes.find(r=>r.id==='starter-roggenvollkorn-kasten')),['Backform']);
});
