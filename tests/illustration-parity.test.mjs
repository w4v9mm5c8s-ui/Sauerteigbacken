import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView} from '../home.js';
import {hubView} from '../hub.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const svgNames=['art-hero.svg','art-buddy.svg','art-books.svg','art-scale.svg','art-calendar.svg','art-chart.svg','art-heart.svg','art-pretzel.svg'];
test('supplementary illustrations remain self-contained vectors',()=>{
 for(const asset of svgNames){const svg=read(asset);assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);assert.match(svg,/<title\b/);assert.match(svg,/viewBox=/);assert.match(svg,/<\/svg>$/);assert.doesNotMatch(svg,/<script|<foreignObject|onload=/i)}
});
test('vector motifs are cached and served alongside the new PNG artwork',()=>{
 const server=read('server.mjs'),sw=read('sw.js');
 for(const asset of svgNames){assert.ok(server.includes("'/"+asset+"'"));assert.ok(sw.includes("'/"+asset+"'"))}
 for(const asset of ['/design/hero-aquarell.png','/design/photo-helles.png','/theme-editorial.css']){assert.ok(server.includes("'"+asset+"'"));assert.ok(sw.includes("'"+asset+"'"))}
});
test('the signed-out home provides grouped actions without displaying fake history',()=>{
 const html=homeView({signed:false,active:null,history:[],parked:[]});
 assert.equal((html.match(/class="studio-directory-row"/g)||[]).length,9);
 assert.match(html,/design\/tile-statistik\.png/);
 assert.match(html,/design\/tile-favoriten\.png/);
 assert.match(html,/design\/hero-aquarell\.png/);
 assert.doesNotMatch(html,/studio-history/);
});
test('baking navigation uses semantic rows with accessible action buttons',()=>{
 const html=hubView(()=>'',true,0,0);
 assert.equal((html.match(/class="studio-hub-row"/g)||[]).length,10);
 assert.equal((html.match(/<svg/g)||[]).length,10);
 assert.match(html,/data-act="newPlan"/);
});
test('illustrated data modules remain linked',()=>{
 assert.match(read('stats.js'),/art-chart\.svg/);
 assert.match(read('own-recipes.js'),/design\/tile-recipes\.png/);
 assert.match(read('community-ui.js'),/art-basket\.svg/);
 assert.match(read('app.js'),/art-heart\.svg/);
 assert.match(read('pantry.js'),/art-wheat\.svg/);
});
