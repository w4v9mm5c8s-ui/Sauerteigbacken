import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('server startup proactively checks the actual redesigned homepage assets',()=>{
 const source=readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
 for(const path of ['/home.js','/recipe-gallery.js','/theme-v3.css','/art-hero.svg','/art-chart.svg','/art-heart.svg']){
  assert.ok(source.includes("'"+path+"'"),path+' missing from startup checks');
 }
 assert.match(source,/Startup route check/);
});
