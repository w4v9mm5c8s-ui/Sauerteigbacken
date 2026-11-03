import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView} from '../home.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('the latest reference has no eight-card grid',()=>{
 const css=read('theme-editorial.css'),html=read('index.html'),live=homeView();
 assert.match(css,/studio-hero/);
 assert.match(css,/studio-directory-list/);
 assert.match(css,/studio-photo-rail/);
 assert.doesNotMatch(html,/home-feature-grid/);
 assert.doesNotMatch(live,/home-feature-grid/);
 assert.match(html,/studio-primary/);
});
test('the first HTML and live render have identical editable navigation',()=>{
 const html=read('index.html'),live=homeView();
 for(const action of ['newPlan','recipes','own','import','bakingDays','favorites','stats','knowledge','community','shopping','buddy']){
  assert.match(html,new RegExp('data-act="'+action+'"'));
  assert.match(live,new RegExp('data-act="'+action+'"'));
 }
 assert.equal((html.match(/class="studio-directory-row"/g)||[]).length,9);
 assert.equal((live.match(/class="studio-directory-row"/g)||[]).length,9);
 assert.ok(html.indexOf('/theme-editorial.css')>html.indexOf('/theme-reference.css'));
});
test('all original standalone SVGs remain available for secondary modules',()=>{
 const names=['art-hero.svg','art-calendar.svg','art-books.svg','art-tools.svg','art-loaf.svg','art-chart.svg','art-heart.svg','art-shopping.svg','art-buddy.svg','art-starter.svg'];
 const server=read('server.mjs'),sw=read('sw.js');
 for(const name of names){
  const src=read(name);
  assert.match(src,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.doesNotMatch(src,/<script|<foreignObject/i);
  assert.ok(server.includes("'/"+name+"'"));
  assert.ok(sw.includes("'/"+name+"'"));
 }
});
test('the initial homepage makes no claims about a personal baking history or paid access',()=>{
 const html=homeView({signed:false,active:null,parked:[],history:[]});
 assert.doesNotMatch(html,/Zuletzt gebacken|Plus aktiv|99,/);
 assert.match(html,/Rezeptbibliothek/);
});
