import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pdfPlanRecipes} from '../pdf-recipe-plans.js';
import {recipeCards,recipePhotoPath} from '../recipe-gallery.js';
const read = path => readFileSync(new URL('..' + path, import.meta.url));
test('each illustrated catalog recipe has a distinct, high-resolution offline photo', () => {
 const recipes = [...JSON.parse(read('/recipes.json')), ...pdfPlanRecipes()];
 const hashes = new Set();
 const server = read('/server.mjs').toString();
 const worker = read('/sw.js').toString();
 for (const recipe of recipes) {
  if(recipe.originalUrl){assert.equal(recipePhotoPath(recipe),recipe.sourcePhoto);assert.ok(recipeCards([recipe]).includes(recipe.sourcePhoto));continue;}
  const path = recipePhotoPath(recipe);
  const image = read(path);
  assert.equal(image.toString('ascii', 8, 16), 'WEBPVP8 ', path);
  assert.ok((image.readUInt16LE(26) & 16383) >= 1000, path);
  assert.ok(server.includes("'" + path + "'") && worker.includes("'" + path + "'"), path);
  hashes.add(createHash('sha256').update(image).digest('hex'));
 }
 assert.equal(hashes.size, recipes.filter(r=>!r.originalUrl).length);
});
