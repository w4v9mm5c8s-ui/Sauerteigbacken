import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('the new editorial homepage is visible in the initial HTML before JavaScript',()=>{
 const html=read('index.html');
 assert.match(html,/<body data-page="start">/);
 assert.match(html,/<main id="main"><section class="studio-hero"/);
 assert.match(html,/class="studio-primary"/);
 assert.match(html,/class="studio-directory"/);
 assert.doesNotMatch(html,/<p>Lädt|class="loading-screen"|id="splash"/i);
 assert.match(html,/<button data-tab="start" class="active" aria-current="page"/);
});
test('watercolor PNGs and new responsive styles are served directly',()=>{
 const html=read('index.html'),home=read('home.js'),css=read('theme-editorial.css');
 assert.match(html,/src="\/design\/hero-aquarell\.png"/);
 assert.match(home,/src=\\"\/design\/hero-aquarell\.png\\"|src="\/design\/hero-aquarell\.png"/);
 assert.match(html,/href="\/theme-editorial\.css"/);
 assert.match(css,/studio-photo-rail/);
 assert.match(read('server.mjs'),/\.png':'image\/png'/);
});
test('initial navigation icons are SVG even before scripts load',()=>{
 const html=read('index.html');
 assert.equal((html.match(/<svg class="ui-icon"/g)||[]).length,4);
 for(const name of ['home','rolling-pin','sprout','user'])assert.match(html,new RegExp('data-icon="'+name+'"><svg'));
});
test('initialization failures do not replace the page with a full-screen message',()=>{
 const app=read('app.js');
 assert.doesNotMatch(app,/textContent='App konnte nicht geladen werden/);
 assert.doesNotMatch(app,/main\.append\(warning\)/);
 assert.match(app,/render\(\);try\{const response=await fetch\('\/recipes\.json'/);
});
test('legacy vector files do not embed raster images or executable scripts',()=>{
 for(const name of ['art-hero.svg','art-buddy.svg','art-heart.svg','art-chart.svg','art-loaf.svg','art-starter.svg','art-pretzel.svg']){
  const svg=read(name);
  assert.match(svg,/^<svg/);
  assert.doesNotMatch(svg,/<image\b|data:image\/(?:png|webp|jpeg)|<foreignObject\b/i);
 }
});
