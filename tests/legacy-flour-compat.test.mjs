import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDF_FLOUR_ALIASES,canonicalFlourName,flourSuggestion} from '../flour-table.js';
import {flourBlendSuggestion} from '../flour-mix.js';
import {estimateFermentation,waterBalance} from '../pdf-baking.js';
import {planFlourRow,planningView} from '../planning-ui.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const table=JSON.parse(read('flour-table.json')),recipes=JSON.parse(read('recipes.json'));
test('all 26 built-in recipes map legacy ingredient codes to an actual PDF flour row',()=>{
 assert.equal(recipes.length,26);
 for(const r of recipes)for(const flour of r.flours){
  assert.ok(table.some(x=>x.name===canonicalFlourName(flour.name)),r.title+': '+flour.name);
 }
 assert.equal(Object.keys(PDF_FLOUR_ALIASES).length,10);
});
test('mixed flour calculation handles original catalog keys without changing stored recipe IDs',()=>{
 const mix=flourBlendSuggestion(table,[{name:'w550',grams:300},{name:'r1150',grams:200}]);
 assert.equal(mix.flourTotal,500);
 assert.equal(mix.water,368);
 assert.equal(mix.starter,190);
 assert.equal(mix.salt,10);
 assert.deepEqual(mix.flours.map(x=>x.name),['Weizenmehl Type 550','Roggenmehl Type 1150']);
 assert.equal(flourSuggestion(table,'w550',500).water,320);
});
test('PDF fermentation factors work for both shorthand catalog keys and full names',()=>{
 const short=estimateFermentation({kind:'proof',temperature:20,flours:[{name:'w550',grams:500}],flourTable:table});
 const full=estimateFermentation({kind:'proof',temperature:20,flours:[{name:'Weizenmehl Type 550',grams:500}],flourTable:table});
 assert.equal(short.hours,full.hours);
 assert.equal(short.hours,2);
});
test('planning UI selects readable full flour name for a legacy recipe',()=>{
 const r=recipes.find(x=>x.id==='starter-weizen-landbrot');
 const html=planningView(r,x=>String(x),new Date('2026-12-04T08:00:00'),table);
 assert.match(html,/Weizenmehl Type 550/);
 assert.match(html,/id="flourPreset0"/);
 assert.match(planFlourRow({name:'r1150',grams:200},2,table),/value="Roggenmehl Type 1150"/);
});
test('soaker input rejects an unsoaked selected seed instead of reporting a fake zero ratio',()=>{
 assert.throws(()=>waterBalance({
  flours:[{name:'w550',grams:500}],totalWater:340,starter:170,
  soakers:[{name:'Sonnenblumenkerne',grams:25,ratio:0}]
 }),/Wasseraufnahme/);
});
test('no infinite PWA update reload and PDF originals accessible from recipe library',()=>{
 const app=read('app.js');
 assert.match(app,/sauerteig-sw-upgrade-v41/);
 assert.doesNotMatch(app,/sessionStorage\.setItem\('sauerteig-sw-upgrade-v26'/);
 assert.match(app,/data-act="pdfRecipes"/);
 assert.match(read('sw.js'),/sauerteig-public-v41/);
});
