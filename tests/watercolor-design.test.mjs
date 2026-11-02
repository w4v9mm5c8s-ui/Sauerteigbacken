import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('watercolor artwork files are self-contained vector illustrations',()=>{
 for(const name of ['art-loaf.svg','art-starter.svg','art-tools.svg','art-basket.svg','art-wheat.svg']){
  const svg=read(name);
  assert.ok(svg.length>1200,name+' is too small');
  assert.ok(svg.startsWith('<svg'),name+' missing root');
  assert.ok(svg.includes('</svg>'),name+' missing closing tag');
  assert.match(svg,/<title\b/);
  assert.match(svg,/<linearGradient|<radialGradient/);
  assert.doesNotMatch(svg,/https?:\/\/[^"']+\.(png|jpg|webp)/i);
 }
});
test('new visual assets are in public allowlist and offline cache',()=>{
 const server=read('server.mjs'),sw=read('sw.js');
 for(const asset of ['/theme.css','/art-loaf.svg','/art-starter.svg','/art-tools.svg','/art-basket.svg','/art-wheat.svg']){
  assert.ok(server.includes("'"+asset+"'"),'not public '+asset);
  assert.ok(sw.includes("'"+asset+"'"),'not cached '+asset);
 }
});
test('home and learning screens use the watercolor motifs matching the approved design',()=>{
 const home=read('home.js'),app=read('app.js'),knowledge=read('knowledge.js'),gallery=read('recipe-gallery.js');
 assert.ok(home.includes('src="/design/hero-aquarell.png"'));
 assert.ok(home.includes('src="/design/tile-recipes.png"'));
 assert.ok(knowledge.includes('src="/art-books.svg"'));
 assert.ok(app.includes('src="/art-starter.svg"'));
 assert.ok(app.includes('src="/art-buddy.svg"'));
 assert.ok(gallery.includes('/design/photo-brezeln.png'));
});

test('new theme is loaded after legacy stylesheet and supports iPhone safe area',()=>{
 const html=read('index.html'),css=read('theme.css');
 assert.ok(html.indexOf('/theme.css')>html.indexOf('/style.css'));
 assert.ok(css.includes('env(safe-area-inset-bottom'));
 assert.ok(css.includes('data-page="start"'));
 assert.ok(css.includes('.hero-watercolor'));
});
