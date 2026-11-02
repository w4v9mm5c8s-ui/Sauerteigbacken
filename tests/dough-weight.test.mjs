import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {doughWeight,excludedIngredients} from '../dough-weight.js';
const recipes=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url),'utf8'));
const recipe=id=>recipes.find(r=>r.id===id);
test('pretzel dough excludes optional topping salt (935 g as original test)',()=>{
 const r=recipe('starter-sauerteig-brezeln');
 assert.equal(doughWeight(r),935);
 assert.equal(excludedIngredients(r)[0].grams,8);
});
test('lye roll dough excludes pretzel salt topping (975 g)',()=>{
 assert.equal(doughWeight(recipe('starter-natronstangen')),975);
});
test('focaccia dough excludes tray oil and topping (1080 g)',()=>{
 assert.equal(doughWeight(recipe('starter-focaccia')),1080);
});
test('sweet-roll dough excludes cinnamon filling but includes milk and egg (1059 g)',()=>{
 assert.equal(doughWeight(recipe('starter-zimtschnecken')),1059);
});
test('standard loaf dough stays unchanged',()=>{
 assert.equal(doughWeight(recipe('starter-weizen-landbrot')),980);
});
test('invalid flour or water amounts fail closed instead of inventing quantities',()=>{
 assert.equal(doughWeight({...recipe('starter-weizen-landbrot'),water:NaN}),null);
});
