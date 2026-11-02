import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView} from '../home.js';
import {hubView} from '../hub.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const expected=['art-hero.svg','art-buddy.svg','art-books.svg','art-scale.svg','art-calendar.svg','art-chart.svg','art-heart.svg','art-pretzel.svg'];

test('all primary watercolor illustrations exist as self-contained SVG assets',()=>{
 for(const asset of expected){
  const svg=read(asset);
  assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,asset);
  assert.match(svg,/<title\b[^>]*>/,asset);
  assert.match(svg,/viewBox=/,asset);
  assert.match(svg,/<\/svg>$/,asset);
  assert.doesNotMatch(svg,/<script|<foreignObject|onload=/i,asset);
 }
});
test('the illustration cache and public route list contain every new asset',()=>{
 const server=read('server.mjs'),sw=read('sw.js');
 for(const asset of expected){assert.ok(server.includes("'\/"+asset+"'"),asset+" route");assert.ok(sw.includes("'\/"+asset+"'"),asset+" cache")}
});
test('the signed-out home has eight illustrated functional shortcuts, no fake baking history',()=>{
 const html=homeView({signed:false,active:null,history:[],parked:[],recipes:[]});
 assert.equal((html.match(/class="home-feature"/g)||[]).length,8);
 assert.match(html,/design\/tile-statistik\.png/);
 assert.match(html,/design\/tile-favoriten\.png/);
 assert.match(html,/design\/hero-aquarell\.png/);
 assert.doesNotMatch(html,/home-recent-grid/);
});
test('the baking hub removes overlay line icons for watercolor tiles',()=>{
 const html=hubView(()=>'',true,0,0);
 assert.match(html,/class="hub-icon has-art"/);
 const style=read('theme-v3.css');
 assert.match(style,/\.hub-icon\.has-art \.hub-line-icon\{display:none\}/);
});
test('illustrations are integrated in stats, own recipes, shopping and community',()=>{
 assert.match(read('stats.js'),/art-chart\.svg/);
 assert.match(read('own-recipes.js'),/design\/tile-recipes\.png/);
 assert.match(read('community-ui.js'),/art-basket\.svg/);
 assert.match(read('app.js'),/art-heart\.svg/);
 assert.match(read('pantry.js'),/art-wheat\.svg/);
});
