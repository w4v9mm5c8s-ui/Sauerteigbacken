import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView,bakingDaysView} from '../home.js';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('home screen has eight real navigation tiles with decorative watercolors',()=>{
 const html=homeView({signed:false,active:null,parked:[],history:[],favorites:[],escape:x=>String(x)});
 assert.equal((html.match(/class="home-feature"/g)||[]).length,8);
 for(const route of ['plan','own','import','bakingDays','stats','favorites','knowledge','calculator'])assert.ok(html.includes('data-act="'+route+'"'),route);
 assert.match(html,/art-hero\.svg/);
 assert.doesNotMatch(html,/Zuletzt gebacken/);
 assert.doesNotMatch(html,/home-buddy/);
});
test('home only shows actual completed bakes and signed-in buddy',()=>{
 const html=homeView({signed:true,active:null,parked:[],history:[{title:'Mein Brot',date:'02.11.2026',rating:5}],escape:x=>String(x)});
 assert.match(html,/Mein Brot/);
 assert.match(html,/★★★★★/);
 assert.match(html,/art-buddy\.svg/);
 assert.equal((html.match(/home-recent-card/g)||[]).length,1);
});
test('active bake is resumed from its actual saved step',()=>{
 const active={title:'Weizen-Landbrot',index:2,steps:Array.from({length:5},(_,i)=>({title:String(i)}))};
 const html=homeView({signed:true,active,parked:[{title:'B'}],history:[],escape:x=>String(x)});
 assert.match(html,/Schritt 3 von 5/);assert.match(html,/2 Backtage parallel/);
 assert.match(html,/data-act="backtag"/);
});
test('baking days page never invents planned bakes',()=>{
 const empty=bakingDaysView({active:null,parked:[]});
 assert.match(empty,/kein Backtag/);
 const withBakes=bakingDaysView({active:{title:'A',index:0,steps:[{}]},parked:[{title:'B',index:1,steps:[{},{}]}]});
 assert.match(withBakes,/switchBake:0/);
});
test('all visual assets are local, valid stand-alone SVGs',()=>{
 for(const name of ['art-hero.svg','art-books.svg','art-scale.svg','art-calendar.svg','art-buddy.svg','art-loaf.svg','art-starter.svg','art-tools.svg','art-wheat.svg','art-basket.svg']){
  const content=read(name);
  assert.match(content,/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(content,/viewBox=/);
  assert.ok(content.endsWith('</svg>'));
  assert.doesNotMatch(content,/<script|<foreignObject|onload=/i);
 }
});
test('mobile grid and safe area are responsive',()=>{
 const css=read('theme-v3.css');
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/--rose:/);
});
test('new home resources are explicitly available and offline cached',()=>{
 const server=read('server.mjs'),sw=read('sw.js');
 for(const asset of ['/home.js','/theme-v3.css','/art-hero.svg','/art-books.svg','/art-scale.svg','/art-calendar.svg','/art-buddy.svg']){
  assert.ok(server.includes("'"+asset+"'"),asset+' missing allowlist');
  assert.ok(sw.includes("'"+asset+"'"),asset+' missing offline list');
 }
});
