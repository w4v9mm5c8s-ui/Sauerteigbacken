import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=name=>readFileSync(new URL('../'+name,import.meta.url));
const watercolor=['hero-aquarell','tile-plan','tile-recipes','tile-import','tile-backtage','tile-statistik','tile-favoriten','tile-backbuecher','tile-wissen','tile-einkauf'];
test('all watercolor assets are transparent RGBA PNGs rather than solid paper rectangles',()=>{
 for(const name of watercolor){
  const file=src('design/'+name+'.png');
  assert.equal(file.subarray(0,8).toString('hex'),'89504e470d0a1a0a',name+' PNG');
  assert.equal(file.readUInt8(25),6,name+' expected PNG color type RGBA');
  assert.ok(file.readUInt32BE(16)>=300,name+' width must support retina phones');
  assert.ok(file.readUInt32BE(20)>=300,name+' height must support retina phones');
 }
});
test('the hero stays fully visible and watercolor icons have no colored backgrounds',()=>{
 const css=src('theme-editorial.css').toString();
 assert.match(css,/\.studio-hero-picture img\{[^}]*object-fit:contain/);
 assert.match(css,/\.studio-hero-picture img\{[^}]*transform:none!important/);
 assert.match(css,/\.studio-mini-art\{background:transparent!important/);
 const html=src('index.html').toString();
 assert.match(html,/src="\/design\/hero-aquarell.png"/);
});
test('a new cache version picks up the transparent replacement files on iOS',()=>{
 assert.match(src('sw.js').toString(),/sauerteig-public-v31/);
 assert.match(src('index.html').toString(),/app\.js\?v=31/);
});
