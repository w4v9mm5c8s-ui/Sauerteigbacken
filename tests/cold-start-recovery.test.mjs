import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('static recipe UI renders before waiting for a sleeping backend',()=>{
 const point=source.indexOf("try{setKnowledgeCards(await(await fetch('/knowledge-data.json')).json())}catch{}render();cfg=await loadApiConfig();");
 assert.ok(point>=0,'app must render before fetching API config');
});
test('config is reattempted after cold-start responses, with no blocking splash',()=>{
 assert.match(source,/async function loadApiConfig\(\)/);
 assert.match(source,/for\(const delay of delays\)/);
 assert.match(source,/response\.ok/);
 assert.doesNotMatch(source,/document\.createElement\('dialog'\).*Lädt/);
});
test('the PWA caches only public, valid assets and never private API data',()=>{
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 assert.match(sw,/cache\.match\(key\)/);
 assert.match(sw,/if\(cached\)/);
 assert.match(sw,/isRealAsset/);
 assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)/);
});
