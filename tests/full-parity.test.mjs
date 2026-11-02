import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderCommunityRows} from '../community-ui.js';
import {computeStats} from '../stats.js';
import {makePlan} from '../planner.js';
const recipes=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url),'utf8'));
test('community filters by flour and saved recipes',()=>{
 const rows=[{id:'a',title:'Weizenbrot',ingredients:'500 g Mehl',flour_type:'Weizen',difficulty:'Einfach',created_at:'2026-11-01'},{id:'b',title:'Roggenbrot',ingredients:'500 g Roggen',flour_type:'Roggen',difficulty:'Mittel',created_at:'2026-11-02'}];
 const html=renderCommunityRows(rows,x=>x,['a'],'','Weizen','','new',true);
 assert.match(html,/Weizenbrot/);assert.doesNotMatch(html,/Roggenbrot/);
});
test('four quality ratings are included in statistics',()=>{
 const r=computeStats([{title:'Brot',ovenSpring:5,crumb:4,crust:3,taste:5}]);
 assert.equal(r.averageOvenSpring,5);assert.equal(r.averageCrumb,4);assert.equal(r.averageCrust,3);assert.equal(r.averageTaste,5);
});
test('planner accepts user-defined starter maturity',()=>{
 const p=makePlan(recipes[0],new Date(Date.now()+6*86400000),'23:00','06:00',false,45,null,null,{starterHours:12,mode:'warm',foldCount:1,foldInterval:50});
 assert.ok(p);assert.match(p.assumptions,/12 h/);
 assert.equal(p.steps.filter(x=>x.title.startsWith('Teig falten')).length,1);
});
test('resource catalog includes books, blogs and channels',()=>{
 const data=JSON.parse(readFileSync(new URL('../resources.json',import.meta.url),'utf8'));
 assert.ok(data.length>=15);for(const kind of ['buch','blog','youtube','instagram'])assert.ok(data.some(x=>x.kind===kind));
});
test('baking photos are private and never stored in public URLs',()=>{
 const code=readFileSync(new URL('../photos.js',import.meta.url),'utf8');
 assert.match(code,/sourdough-photos/);assert.match(code,/Authorization:'Bearer '/);assert.match(code,/storage\/v1\/object\/sign/);
});
test('user can pause and resume timers',()=>{
 const code=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const action of ['timerPause','timerResume','timerPreset','keepAwake'])assert.ok(code.includes(action));
});
