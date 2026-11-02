import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView} from '../home.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const routes=['newPlan','own','import','bakingDays','stats','favorites','knowledge','shopping'];

test('the home uses large editorial watercolor rather than 4-up icon tiles',()=>{
 const css=read('theme-v4.css');
 assert.match(css,/\.home-feature-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/grid-template-columns:51% minmax\(0,1fr\)/);
 assert.match(css,/\.home-brand h1 em/);
 assert.match(css,/#f8efe7/);
 assert.match(css,/#4e302e/i);
 assert.doesNotMatch(css,/home-feature-grid\{grid-template-columns:repeat\(4/);
});
test('first paint and live homepage both use eight identical actions',()=>{
 const html=read('index.html'),live=homeView({signed:false,active:null,parked:[],history:[],favorites:[],recipes:[]});
 assert.equal((html.match(/class="home-feature"/g)||[]).length,8);
 assert.equal((live.match(/class="home-feature"/g)||[]).length,8);
 for(const action of routes){assert.match(html,new RegExp('data-act="'+action+'"'));assert.match(live,new RegExp('data-act="'+action+'"'))}
 assert.match(html,/theme-v4\.css/);
 assert.ok(html.indexOf('theme-v4.css')>html.indexOf('theme-v3.css'));
 assert.match(live,/Dein Begleiter für natürliches Brotbacken/);
});
test('all cards use original transparent SVG watercolor assets with texture',()=>{
 const svgNames=['art-hero.svg','art-calendar.svg','art-books.svg','art-tools.svg','art-loaf.svg','art-chart.svg','art-heart.svg','art-shopping.svg','art-buddy.svg','art-starter.svg'];
 const server=read('server.mjs'),sw=read('sw.js');
 for(const name of svgNames){
  const source=read(name);
  assert.match(source,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(source,/<linearGradient/);
  assert.match(source,/<feTurbulence/);
  assert.match(source,/<path/);
  assert.doesNotMatch(source,/<image\b|data:image\/(?:png|webp|jpeg)/i);
  assert.ok(server.includes("'/"+name+"'"),name+' is not served');
  assert.ok(sw.includes("'/"+name+"'"),name+' is not offline-cached');
 }
});
test('long card text breaks intentionally without creating overly narrow labels',()=>{
 const html=homeView({signed:false,active:null,parked:[],history:[]});
 assert.match(html,/Back-<wbr>statistik/);
 assert.match(html,/Wissens-<wbr>bibliothek/);
 assert.match(html,/Einkaufs-<wbr>liste/);
});
test('no payment or private data is implied by the design',()=>{
 const html=homeView({signed:false,active:null,parked:[],history:[]});
 assert.doesNotMatch(html,/Zuletzt gebacken/);
 assert.doesNotMatch(html,/Plus aktiv|99,/);
 assert.doesNotMatch(html,/home-buddy/);
});
