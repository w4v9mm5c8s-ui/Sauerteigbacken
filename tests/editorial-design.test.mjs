import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView} from '../home.js';
import {hubView} from '../hub.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('a small viewport uses readable full-width rows, not eight narrow tiles',()=>{
 const html=read('index.html'),css=read('theme-editorial.css');
 assert.doesNotMatch(html,/home-feature-grid/);
 assert.match(css,/studio-directory-row/);
 assert.match(css,/grid-template-columns:49px minmax\(0,1fr\)/);
 assert.match(css,/studio-hero-picture/);
 assert.match(css,/studio-mini-art/);
});
test('the start and baking hub preserve every core destination',()=>{
 const home=homeView({signed:false}),hub=hubView(()=>'',false,0,0);
 for(const key of ['newPlan','newRecipe','recipes','own','bakingDays','favorites','import','stats','community','knowledge'])assert.match(home,new RegExp('data-act="'+key+'"'));
 for(const key of ['planFromRecipe','newRecipe','recipes','own','bakingDays','favorites','history','stats','calculator','community','historical'])assert.match(hub,new RegExp('data-act="'+key+'"'));
});
test('suggested images are example recipes, never fabricated user history',()=>{
 const html=homeView({signed:false,history:[]});
 assert.match(html,/starter-weizen-landbrot/);
 assert.match(html,/starter-bauernbrot-70-30/);
 assert.doesNotMatch(html,/Zuletzt gebacken/);
 assert.match(html,/KI-generiertes Beispielbild/);
});
test('the app loads before public-data requests and keeps a manual recipe reload',()=>{
 const app=read('app.js');
 assert.match(app,/render\(\);try\{const response=await fetch\('\/recipes\.json'/);
 assert.match(app,/reloadCatalog/);
 assert.match(app,/tab='recipes';render\(\)/);
});
test('the service worker version is atomically updated and prefers current HTML and modules',()=>{
 const sw=read('sw.js'),server=read('server.mjs');
 assert.match(sw,/sauerteig-public-v29/);
 assert.match(sw,/Promise\.race/);
 assert.match(sw,/isRealAsset/);
 assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)/);
 assert.match(sw,/cache\.match\(key\)/);
 assert.ok(server.includes("'/theme-editorial.css'"));
});
