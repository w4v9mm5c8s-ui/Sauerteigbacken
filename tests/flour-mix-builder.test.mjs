import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {flourBlendSuggestion} from '../flour-mix.js';
import {bakeChoiceView,recipeBuilderView,readBlendRecipe} from '../recipe-builder.js';
import {planningView,planFlourRow} from '../planning-ui.js';
import {personalStartersPreview,starterListView} from '../starter-tracking.js';
import {parseOwnRecipe} from '../own-recipe-parser.js';

const table=JSON.parse(readFileSync(new URL('../flour-table.json',import.meta.url),'utf8'));
const rows=[{name:'Weizenmehl Type 550',grams:300},{name:'Roggenmehl Type 1150',grams:200}];
const find=name=>table.find(r=>r.name===name);
test('two flours calculate water and starter by the actual quantities, not their simple mean',()=>{
 const a=find(rows[0].name),b=find(rows[1].name);
 const result=flourBlendSuggestion(table,rows);
 assert.equal(result.flourTotal,500);
 assert.equal(result.water,Math.round((a.water500*300/500+b.water500*200/500)*10)/10);
 assert.equal(result.starter,Math.round((a.starter500*300/500+b.starter500*200/500)*10)/10);
 assert.equal(result.salt,10);
 assert.equal(result.total,500+result.water+result.starter+10);
 assert.equal(result.weightedHydration,Math.round(((a.hydration*300+b.hydration*200)/500)*10)/10);
 assert.equal(result.suggestedStarter,'weizen');
});
test('changing the flour proportions changes the suggestions while keeping the source table',()=>{
 const first=flourBlendSuggestion(table,rows);
 const second=flourBlendSuggestion(table,[{name:rows[0].name,grams:100},{name:rows[1].name,grams:400}]);
 assert.notEqual(first.water,second.water);
 assert.notEqual(first.starter,second.starter);
 assert.equal(second.flourTotal,500);
 assert.match(second.source,/Sauerteigbrot.pdf/);
});
test('reject unknown flours and negative, empty or impossible quantities',()=>{
 for(const invalid of [
  [{name:'Unbekanntes Mehl',grams:500}],
  [{name:'Weizenmehl Type 550',grams:-20}],
  [{name:'Weizenmehl Type 550',grams:0}],
  [{name:'Weizenmehl Type 550',grams:Infinity}]
 ])assert.throws(()=>flourBlendSuggestion(table,invalid));
 assert.throws(()=>flourBlendSuggestion(table,rows,{saltPercent:20}));
});
test('bake choice explicitly distinguishes a planned bake from an original recipe',()=>{
 const html=bakeChoiceView();
 assert.match(html,/data-act="planFromRecipe"/);
 assert.match(html,/Backtag planen/);
 assert.match(html,/data-act="newRecipe"/);
 assert.match(html,/Eigenes Rezept berechnen oder erstellen/);
});
test('recipe builder offers multiple selectable flour rows and automatic ingredient values',()=>{
 const html=recipeBuilderView(table,x=>String(x),[{name:'Wilma',type:'Weizen',hydration:100}]);
 for(const id of ['blendRows','blendAuto','blendWater','blendStarter','blendSalt','blendSaltPct','blendHydration','blendSavedStarter'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/data-act="blendAdd"/);
 assert.match(html,/data-act="blendSave"/);
 assert.match(html,/data-act="blendPlan"/);
 assert.match(html,/Wilma/);
 assert.match(html,/Weizenmehl Type 550/);
});
test('the existing recipe planner supports adding further flour rows and applying recalculated ingredients',()=>{
 const recipe=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url),'utf8'))[0];
 const html=planningView(recipe,x=>String(x),new Date('2026-11-03T06:00:00'),table);
 assert.match(html,/id="planFlours"/);
 assert.match(html,/id="planAutoIngredients"/);
 assert.match(html,/data-act="planFlourAdd"/);
 assert.match(html,/id="flourPreset0"/);
 const row=planFlourRow({name:'Roggenmehl Type 1150',grams:200},5,table);
 assert.match(row,/id="flourAmount5"/);
});
test('personal starters are prominently shown only in the personal section',()=>{
 const items=[{name:'Wilma',type:'Weizen',hydration:100,ratio:'1:2:2',flourName:'Weizenmehl Type 550',logs:[]}];
 const preview=personalStartersPreview(items,x=>String(x));
 const list=starterListView(items,x=>String(x));
 assert.match(preview,/Meine Starter/);
 assert.match(preview,/Wilma/);
 assert.match(preview,/data-act="starters"/);
 for(const id of ['starterEditName0','starterEditHydration0','starterEditType0','starterEditFlour0','starterLogRatio0'])assert.match(list,new RegExp('id="'+id+'"'));
});
test('own recipe parser recognizes grain names from the original flour table',()=>{
 const parsed=parseOwnRecipe({title:'Emmer Dinkel Mischung',ingredients:'200 g Emmer hell\n300 g Dinkelmehl Type 630\n335 g Wasser\n160 g reifer Weizenstarter\n10 g Salz',steps:'Teig mischen\nTeig führen\nBacken',bakeTemp:220,bakeMin:45,stockHours:4,proofHours:2});
 assert.equal(parsed.flours.length,2);
 assert.equal(parsed.flours[0].name,'Emmer hell');
});
test('the actual app sends its starter management under Ich and keeps the two flows separate',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/personalStartersPreview\(local\(\)\.starters/);
 assert.match(app,/recipeBuilder:\(\)=>recipeBuilderView/);
 assert.match(app,/bakeChoice:\(\)=>bakeChoiceView/);
 assert.match(app,/planFlourAdd/);
 assert.match(app,/refreshPlanBlendPreview/);
});
