import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {extractStructuredRecipe} from '../structured-recipe.mjs';
const fixture=`<html><head><script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":["Recipe","CreativeWork"],"name":"Mein Sauerteig-Landbrot",
"recipeIngredient":["500 g Weizenmehl Type 550","350 g Wasser","100 g Starter","10 g Salz"],
"recipeInstructions":[{"@type":"HowToStep","text":"Mehl und Wasser vermischen."},{"@type":"HowToSection","itemListElement":[{"@type":"HowToStep","text":"Starter hinzufügen."},{"@type":"HowToStep","text":"Backen."}]}]}]}</script></head><body><p>Rezept</p></body></html>`;
test('extracts valid JSON-LD Recipe title, quantities and nested steps',()=>{
 const r=extractStructuredRecipe(fixture);
 assert.equal(r.title,'Mein Sauerteig-Landbrot');
 assert.deepEqual(r.ingredients,['500 g Weizenmehl Type 550','350 g Wasser','100 g Starter','10 g Salz']);
 assert.deepEqual(r.steps,['Mehl und Wasser vermischen.','Starter hinzufügen.','Backen.']);
});
test('does not invent grams or convert cups',()=>{
 const html='<script type="application/ld+json">'+JSON.stringify({'@type':'Recipe',name:'Cup Bread',recipeIngredient:['1 cup flour'],recipeInstructions:'Bake'})+'</script>';
 assert.equal(extractStructuredRecipe(html).ingredients[0],'1 cup flour');
});
test('ignores executable scripts and malformed JSON-LD',()=>{
 const x='<script>alert(1)</script><script type="application/ld+json">{invalid}</script>';
 assert.equal(extractStructuredRecipe(x),null);
});
test('ignores unrelated schema types',()=>{
 const html='<script type="application/ld+json">'+JSON.stringify({'@type':'Product',name:'Brot',recipeIngredient:['500g flour'],recipeInstructions:'Bake'})+'</script>';
 assert.equal(extractStructuredRecipe(html),null);
});
test('recipe URL reader uses structured parsing before stripping script tags',()=>{
 const s=readFileSync(new URL('../url-import.mjs',import.meta.url),'utf8');
 assert.match(s,/extractStructuredRecipe\(raw\)/);
 assert.match(s,/structuredRecipe/);
});
