import test from 'node:test';
import assert from 'node:assert/strict';
import {upcomingBakeTasks,bakingDaysView} from '../home.js';
const base=Date.now()+86400000;
test('upcoming parallel tasks are sorted by the actual schedule, with no invented duration',()=>{
 const active={title:'Landbrot',index:1,steps:[{title:'Füttern',at:base-1000,active:true},{title:'Stockgare',at:base+3600000,active:false},{title:'Formen',at:base+7200000,active:true}]};
 const parked=[{title:'Brezeln',index:0,steps:[{title:'Mischen',at:base+300000,active:true}]}];
 const tasks=upcomingBakeTasks(active,parked);
 assert.equal(tasks.length,2);
 assert.equal(tasks[0].title,'Brezeln');
 assert.equal(tasks[0].action,'switchBake:0');
 assert.equal(tasks[1].task,'Formen');
 assert.equal(tasks[1].action,'backtag');
 assert.equal(tasks[1].at,base+7200000);
});
test('no active work is invented from passive rest steps',()=>{
 const active={title:'Roggen',index:0,steps:[{title:'Kühlschrankgare',at:base,active:false}]};
 assert.deepEqual(upcomingBakeTasks(active,[]),[]);
});
test('baking day links preserve the exact stored parallel session index',()=>{
 const parked=[{title:'Brot A',steps:[{title:'Mischen',at:base,active:true}]},{title:'Brot B',steps:[{title:'Falten',at:base+10000,active:true}]}];
 const html=bakingDaysView({active:null,parked,escape:x=>String(x)});
 assert.match(html,/Nächste Arbeitsschritte/);
 assert.match(html,/data-act="switchBake:0"/);
 assert.match(html,/data-act="switchBake:1"/);
 assert.match(html,/2 laufende Backtage/);
});
test('no future baking times are shown for an empty account',()=>{
 const html=bakingDaysView({active:null,parked:[]});
 assert.doesNotMatch(html,/Nächste Arbeitsschritte/);
 assert.match(html,/kein Backtag/);
});
