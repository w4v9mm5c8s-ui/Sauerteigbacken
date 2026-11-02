import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recipeCards,recipePhotoPath} from '../recipe-gallery.js';
import {homeView} from '../home.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url));

test('recipe categories use dedicated AI example photography',()=>{
 const cases=[
  ['Sauerteig-Laugenbrezeln','photo-brezeln.png'],
  ['Sauerteig-Baguettes','photo-baguette.png'],
  ['Sauerteig-Bagels','photo-bagels.png'],
  ['Rosmarin-Sauerteig-Focaccia','photo-focaccia.png'],
  ['Sauerteig-Pizzateig','photo-pizza.png'],
  ['Sauerteig-Zimtschnecken','photo-zimtschnecken.png']
 ];
 for(const [title,asset] of cases){
  assert.equal(recipePhotoPath({title,category:'Brot'}),'/design/'+asset);
  const bytes=read('design/'+asset);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.ok(bytes.length>10000);
  for(const source of ['server.mjs','sw.js'])assert.match(read(source).toString(),new RegExp('design/'+asset.replaceAll('.','\\.')));
 }
});

test('favorites have a separate keyboard-accessible button and selected state',()=>{
 const recipe={id:'loaf-id',title:'Weizenbrot',category:'Brot',yieldLabel:'1 Laib'};
 const row=recipeCards([recipe],x=>String(x),'recipe',['loaf-id']);
 assert.match(row,/data-act="recipe:loaf-id"/);
 assert.match(row,/data-act="favorite:loaf-id"/);
 assert.match(row,/aria-pressed="true"/);
 assert.match(row,/KI-generiertes Beispielbild/);
 const picker=recipeCards([recipe],x=>String(x),'selectForPlan');
 assert.doesNotMatch(picker,/data-act="favorite:loaf-id"/);
});

test('homepage recipe shortcut opens all recipes, while actual baking history stays private',()=>{
 const html=homeView({signed:false,active:null,parked:[],history:[]});
 assert.match(html,/data-act="recipes"/);
 assert.doesNotMatch(html,/home-recent-grid/);
 assert.doesNotMatch(html,/history.*KI-generiert/);
});

test('reference watercolors do not contain status-bar text assets',()=>{
 for(const path of ['design/hero-aquarell.png','design/tile-einkauf.png']){
  const img=read(path);
  assert.equal(img.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.ok(img.length>3000);
 }
});
