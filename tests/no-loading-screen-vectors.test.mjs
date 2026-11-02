import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('homepage is visible immediately before JavaScript loads',()=>{
 const html=read('index.html');
 assert.match(html,/<body data-page="start">/);
 assert.match(html,/<main id="main"><section class="home-masthead">/);
 assert.match(html,/<section class="home-feature-grid"/);
 assert.doesNotMatch(html,/<p>Lädt|class="loading-screen"|id="splash"/i);
 assert.match(html,/<button data-tab="start" class="active" aria-current="page"/);
});
test('approved reference illustrations are served as local PNG files without a splash',()=>{
 const html=read('index.html'),home=read('home.js'),css=read('theme-reference.css');
 assert.match(html,/src="\/design\/hero-aquarell\.png"/);
 assert.match(home,/src="\/design\/hero-aquarell\.png"/);
 assert.match(html,/href="\/theme-reference\.css"/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 const server=read('server.mjs');
 assert.match(server,/\.png':'image\/png'/);
});
test('SVG navigation icons are present on first paint',()=>{
 const html=read('index.html');
 assert.equal((html.match(/<svg class="ui-icon"/g)||[]).length,4);
 for(const id of ['home','rolling-pin','sprout','user'])assert.match(html,new RegExp('data-icon="'+id+'"><svg'));
});
test('there is no in-app loading screen even after app startup fails',()=>{
 const js=read('app.js');
 assert.doesNotMatch(js,/textContent='App konnte nicht geladen werden/);
 assert.match(js,/main\.append\(warning\)/);
});
test('local SVG vectors have no raster data embedded',()=>{
 for(const name of ['art-hero.svg','art-buddy.svg','art-heart.svg','art-chart.svg','art-loaf.svg','art-starter.svg','art-pretzel.svg']){
  const svg=read(name);
  assert.match(svg,/^<svg/);
  assert.doesNotMatch(svg,/<image\b|data:image\/(?:png|webp|jpeg)|<foreignObject\b/i);
 }
});
