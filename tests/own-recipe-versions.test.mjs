import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOwnRecipe,recipeToRaw} from '../own-recipe-parser.js';
import {versionHistory,restoreVersion} from '../own-recipes.js';
import {doughWeight} from '../dough-weight.js';
const input={title:'Saatenbrot',ingredients:'500 g Weizenmehl\n350 g Wasser\n100 g Starter',steps:'Mischen\nBacken',stockHours:4,proofHours:2,bakeTemp:230,bakeMin:40,soakerItems:'40 g Leinsamen',soakWater:80,soakHours:12,toppingItems:'10 g Sesam',fillingItems:'30 g Walnüsse'};
test('own recipe keeps soak water within total and preserves roles after reopening',()=>{
 const recipe=parseOwnRecipe(input);assert.equal(doughWeight(recipe),990);assert.equal(recipe.soaker.water,80);
 const reopened=parseOwnRecipe(recipeToRaw(recipe));assert.deepEqual(reopened.soaker,recipe.soaker);assert.deepEqual(reopened.extras,recipe.extras);
 assert.throws(()=>parseOwnRecipe({...input,soakWater:351}),/Quellwasser/);
});
test('selected version restores with current identity and can be undone',()=>{
 const item={...input,recipe:{id:'current'},versions:[{...input,soakHours:9,recipe:{id:'old'}},{...input,title:'Vorgänger'}]};
 const old=restoreVersion(item,0,'2026-11-16');assert.equal(old.soakHours,9);assert.equal(old.recipe.id,'current');assert.equal(restoreVersion(old,1,'now').soakHours,12);
 const html=versionHistory(item,2,String);assert.match(html,/Damals: 9<br>Jetzt: 12/);assert.match(html,/ownRestore:2:0/);
});
