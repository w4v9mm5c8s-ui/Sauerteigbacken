import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeView} from '../home.js';
import {recipePhotoPath} from '../recipe-gallery.js';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const names=['hero-aquarell','tile-recipes','tile-import','tile-backtage','tile-statistik','tile-favoriten','tile-backbuecher','tile-wissen','tile-einkauf','photo-landbrot','photo-vollkorn','photo-bauernbrot','photo-helles','photo-saaten','photo-kasten','photo-krume','photo-rustikal','photo-brezeln','photo-baguette','photo-bagels','photo-focaccia','photo-pizza','photo-zimtschnecken'];

test('every design graphic is an actual local PNG with valid dimensions',()=>{
 const server=read('server.mjs'),sw=read('sw.js');
 for(const name of names){
  const path='/design/'+name+'.png',bytes=readFileSync(new URL('../design/'+name+'.png',import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],name+' PNG signature');
  assert.ok(bytes.readUInt32BE(16)>=100,name+' width');
  assert.ok(bytes.readUInt32BE(20)>=70,name+' height');
  assert.ok(server.includes("'"+path+"'"),name+' publicly served');
  assert.ok(sw.includes("'"+path+"'"),name+' offline cache');
 }
 assert.match(server,/\.png':'image\/png'/);
 assert.match(sw,/sauerteig-public-v40/);
});
test('the immediately visible and dynamic home display identical PNG illustrations',()=>{
 const html=read('index.html'),live=homeView({signed:false,history:[],parked:[],active:null,recipes:[]});
 assert.match(html,/href="\/theme-reference\.css"/);
 assert.match(html,/src="\/design\/hero-aquarell\.png"/);
 assert.match(live,/src="\/design\/hero-aquarell\.png"/);
 for(const name of ['tile-recipes','tile-import','tile-backtage','tile-statistik','tile-favoriten','tile-backbuecher','tile-wissen']){
  assert.ok(html.includes('/design/'+name+'.png'),name+' first paint');
  assert.ok(live.includes('/design/'+name+'.png'),name+' dynamic paint');
 }
 assert.equal((html.match(/class="studio-directory-row"/g)||[]).length,9);
 assert.equal((live.match(/class="studio-directory-row"/g)||[]).length,9);
 assert.doesNotMatch(live,/Zuletzt gebacken/);
});
test('recipe photography varies by bread style and never invents personal photos',()=>{
 assert.equal(recipePhotoPath({title:'Roggenvollkorn-Kastenbrot'}),'/design/photo-kasten.png');
 assert.equal(recipePhotoPath({title:'Weizen-Landbrot'}),'/design/photo-helles.png');
 assert.equal(recipePhotoPath({title:'Bauernmischbrot'}),'/design/photo-bauernbrot.png');
 assert.equal(recipePhotoPath({title:'Sonnenblumenkernbrot'}),'/design/photo-vollkorn.png');
 assert.equal(recipePhotoPath({title:'Sauerteig-Laugenbrezeln'}),'/design/photo-brezeln.png');
});
test('mobile app retains accessible buttons and manual ingredient grouping',()=>{
 const app=read('app.js'),css=read('theme-reference.css');
 assert.match(app,/recipeCat:/);
 assert.match(app,/shopping-category/);
 assert.match(app,/addShoppingManual/);
 assert.match(css,/home-feature-grid/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/safe-area-inset-bottom/);
});
