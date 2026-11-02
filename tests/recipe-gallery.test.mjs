import test from 'node:test';
import assert from 'node:assert/strict';
import {recipeCards,recipePicker} from '../recipe-gallery.js';
import {homeView} from '../home.js';
import {readFileSync} from 'node:fs';

const recipes=[
 {id:'bread',title:'Weizen-Landbrot',category:'Brot',yieldLabel:'1 Laib'},
 {id:'pretzel',title:'Sauerteig-Laugenbrezeln',category:'Laugengebäck',yieldLabel:'8 Brezeln'},
 {id:'roll',title:'Dinkelsemmeln',category:'Brötchen',yieldLabel:'10 Stück'}
];

test('recipe cards include coherent watercolor art and real quantities',()=>{
 const html=recipeCards(recipes,x=>String(x));
 assert.equal((html.match(/recipe-gallery-item/g)||[]).length,3);
 assert.match(html,/art-pretzel\.svg/);
 assert.match(html,/art-basket\.svg/);
 assert.match(html,/art-loaf\.svg/);
 assert.match(html,/8 Brezeln/);
});
test('new plan first asks for an explicit recipe selection',()=>{
 const picker=recipePicker(recipes,x=>String(x));
 assert.match(picker,/Welches Gebäck|Was möchtest du backen/);
 assert.match(picker,/data-act="selectForPlan:bread"/);
 const home=homeView({signed:false,active:null,parked:[],history:[]});
 assert.match(home,/data-act="newPlan"/);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/recipeSelect:\(\)=>recipePicker/);
 assert.match(app,/selectForPlan:/);
});
test('recipe browse results preserve action prefix and escape visible names',()=>{
 const html=recipeCards([{id:'safe',title:'Test & Brote',category:'Brot'}],x=>String(x).replace(/&/g,'&amp;'),'selectForPlan');
 assert.match(html,/data-act="selectForPlan:safe"/);
 assert.match(html,/Test &amp; Brote/);
});

test('new bake chooser can include complete private recipes',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/recipesForPlanning=\(\)=>/);
 assert.match(app,/\.ownRecipes\|\|\[\]/);
 assert.match(app,/recipeSelect:\(\)=>recipePicker\(recipesForPlanning\(\),escape\)/);
});
