import test from 'node:test';
import assert from 'node:assert/strict';
import {communityView,renderCommunityRows} from '../community-ui.js';
import {unfinishedWork} from '../phase-checklist.js';
import {unavailableAt} from '../planner.js';
test('community submit fields exist and filters distinguish unknown durations from zero',()=>{
 const html=communityView(String);
 for(const id of ['ctitle','cingredients','cinstructions','cauthor','cflour','cdifficulty','cbreadType','cstarterType','chydration','ctotalHours'])assert.ok(html.includes('id="'+id+'"'),id);
 const row={id:'1',title:'Brot',total_hours:null,hydration:null};
 assert.match(renderCommunityRows([row],String,[],'','','','new',false,{maxHours:3}),/Keine passenden/);
 assert.match(renderCommunityRows([{...row,total_hours:2}],String,[],'','','','new',false,{maxHours:3}),/community-recipe/);
});
test('jumping to final step requires earlier active work, not passive timers',()=>{
 const b={index:2,steps:[{title:'Mischen',active:true},{title:'Warten',active:false},{title:'Abkühlen',active:false}]};
 assert.deepEqual(unfinishedWork(b).map(x=>x.title),['Mischen']);b.logs={0:{completedAt:'ok'}};assert.deepEqual(unfinishedWork(b),[]);
});
test('Monday overnight absence leaves Monday morning free',()=>{
 const cfg={recurringDays:[0],recurringFrom:'20:00',recurringTo:'04:00'};
 const blocked=(day,h)=>unavailableAt(new Date(2026,10,day,h),'00:00','00:00',null,null,cfg);
 assert.equal(blocked(16,2),false);assert.equal(blocked(16,23),true);assert.equal(blocked(17,2),true);assert.equal(blocked(17,4),false);
});
import {recordedBakeSpan,actualBakeDurations} from '../bake-metrics.js';
test('stats use documented span and recognize the PDF oven program',()=>{
 const steps=[{title:'Formen'},{title:'Einschießen und anfangs schwaden'},{title:'Abkühlen'}];
 const logs={0:{completedAt:'2030-01-01T10:00:00Z'},1:{completedAt:'2030-01-01T12:00:00Z'},2:{completedAt:'2030-01-01T13:00:00Z'}};
 assert.equal(actualBakeDurations(steps,logs).proofHours,2);assert.equal(recordedBakeSpan(logs).totalHours,3);assert.equal(recordedBakeSpan({}).totalHours,null);
});
