import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView,bakingDaysView} from '../home.js';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('start screen presents an editorial navigation instead of cramped feature tiles',()=>{
 const html=homeView({signed:false,active:null,parked:[],history:[]});
 assert.equal((html.match(/class="studio-directory-row"/g)||[]).length,9);
 for(const route of ['newPlan','recipes','own','import','bakingDays','stats','favorites','community','knowledge','shopping'])assert.ok(html.includes('data-act="'+route+'"'),route);
 assert.match(html,/design\/hero-aquarell\.png/);
 assert.doesNotMatch(html,/home-feature-grid|home-recent-card/);
 assert.doesNotMatch(html,/Zuletzt gebacken/);
});
test('completed bakes are displayed only for an actual signed-in history',()=>{
 const html=homeView({signed:true,active:null,parked:[],history:[{title:'Mein Brot',date:'02.11.2026',rating:5}]});
 assert.match(html,/Zuletzt gebacken/);
 assert.match(html,/Mein Brot/);
 assert.match(html,/★★★★★/);
 assert.match(html,/studio-history/);
 const signedOut=homeView({signed:false,active:null,parked:[],history:[{title:'Privatbrot'}]});
 assert.doesNotMatch(signedOut,/Privatbrot/);
});
test('saved parallel bakes offer actions without inventing a due time',()=>{
 const active={title:'Weizen-Landbrot',index:2,steps:Array.from({length:5},(_,i)=>({title:'Schritt '+i}))};
 const html=homeView({signed:true,active,parked:[{title:'Zweites Brot'}],history:[]});
 assert.match(html,/Weizen-Landbrot/);
 assert.match(html,/Zweites Brot/);
 assert.match(html,/data-act="backtag"/);
 assert.match(html,/switchBake:0/);
});
test('baking days page never invents planned bakes',()=>{
 const empty=bakingDaysView({active:null,parked:[]});
 assert.match(empty,/kein Backtag/);
 const withBakes=bakingDaysView({active:{title:'A',index:0,steps:[{}]},parked:[{title:'B',index:1,steps:[{},{}]}]});
 assert.match(withBakes,/switchBake:0/);
});
test('original vector motifs remain valid supplementary assets',()=>{
 for(const name of ['art-hero.svg','art-books.svg','art-scale.svg','art-calendar.svg','art-buddy.svg','art-loaf.svg','art-starter.svg','art-tools.svg','art-wheat.svg','art-basket.svg']){
  const src=read(name);
  assert.match(src,/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(src,/viewBox=/);
  assert.ok(src.endsWith('</svg>'));
  assert.doesNotMatch(src,/<script|<foreignObject|onload=/i);
 }
});
test('new editorial styling respects mobile safe areas',()=>{
 const css=read('theme-editorial.css');
 assert.match(css,/studio-directory-row/);
 assert.match(css,/studio-photo-rail/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.doesNotMatch(css,/home-feature-grid/);
});
test('the public shell is kept available offline',()=>{
 const server=read('server.mjs'),sw=read('sw.js');
 for(const asset of ['/index.html','/home.js','/hub.js','/theme-editorial.css','/design/hero-aquarell.png']){
  assert.ok(server.includes("'"+asset+"'"),asset+' missing public route');
  assert.ok(sw.includes("'"+asset+"'"),asset+' missing offline list');
 }
});
