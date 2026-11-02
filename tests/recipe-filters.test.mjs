import test from 'node:test';
import assert from 'node:assert/strict';
import {filterRecipeLibrary,recipeCategoryOptions} from '../recipe-gallery.js';
const data=[
 {id:'a',title:'Landbrot',category:'Brote',flours:[{name:'Weizenmehl 550'}]},
 {id:'b',title:'Roggenbrötchen',category:'Brötchen',flours:[{name:'Roggenvollkornmehl'}]},
 {id:'c',title:'Dinkelbrot',category:'Brote',flours:[{name:'Dinkelmehl 630'}]}
];
test('searches names, flour types and categories case-insensitively',()=>{
 assert.deepEqual(filterRecipeLibrary(data,'rOgGeN').map(r=>r.id),['b']);
 assert.deepEqual(filterRecipeLibrary(data,'630').map(r=>r.id),['c']);
 assert.deepEqual(filterRecipeLibrary(data,'brot','Brote').map(r=>r.id),['a','c']);
});
test('category filter is independent of search query',()=>{
 assert.deepEqual(filterRecipeLibrary(data,'','Brötchen').map(r=>r.id),['b']);
 assert.equal(filterRecipeLibrary(data,'Zimt').length,0);
});
test('select includes unique categories and escapes untrusted labels',()=>{
 const html=recipeCategoryOptions([...data,{id:'x',title:'test',category:'A&B'}],s=>String(s).replace(/&/g,'&amp;'));
 assert.equal((html.match(/<option/g)||[]).length,4);
 assert.match(html,/A&amp;B/);
});
