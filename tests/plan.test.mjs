import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makePlan} from '../planner.js';
const recipes=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url),'utf8'));
test('56 recipes and instructions available',()=>{assert.equal(recipes.length,56);assert.ok(recipes.every(r=>r.steps.length>=3&&r.flours.length))});
test('Laugen recipes warn about protective equipment',()=>{for(const r of recipes.filter(r=>/Laugen/.test(r.title)))assert.match(r.steps.join(' '),/Schutzbrille/)});
test('planner creates separate preheat and baking steps',()=>{const p=makePlan(recipes[0],new Date(Date.now()+5*86400000),'22:00','07:00',true);assert.ok(p);assert.ok(p.steps.some(s=>s.title==='Ofen vorheizen'));assert.ok(p.steps.some(s=>s.title==='Backphase starten'))});
test('planner never schedules active work during sleep',()=>{const p=makePlan(recipes[0],new Date(Date.now()+5*86400000),'22:00','07:00',true);assert.ok(p);for(const s of p.steps.filter(x=>x.active)){const h=new Date(s.at).getHours();assert.ok(h>=7&&h<22,s.title+' '+h)}});
test('planner marks uncalibrated estimates',()=>{const p=makePlan(recipes[0],new Date(Date.now()+5*86400000),'22:00','07:00',true);assert.match(p.assumptions,/Richtwerte/)});

test('planner respects a one-time absence window',()=>{const wanted=new Date(Date.now()+6*86400000);const awayStart=new Date(wanted.getTime()-12*3600000),awayEnd=new Date(wanted.getTime()+12*3600000);const p=makePlan(recipes[0],wanted,'22:00','07:00',true,45,awayStart,awayEnd);assert.ok(p);for(const step of p.steps.filter(s=>s.active))assert.ok(step.at<+awayStart||step.at>=+awayEnd,step.title) });
test('planner never schedules active tasks in the past',()=>{const p=makePlan(recipes[0],new Date(Date.now()+60000),'22:00','07:00',false,45,null,null,{starterHours:9});assert.ok(p);assert.ok(p.steps.filter(s=>s.active).every(s=>s.at>Date.now()))});

test('pretzel baking plan includes separate lye handling and protective warning',()=>{const r=recipes.find(x=>x.title==='Sauerteig-Laugenbrezeln');const p=makePlan(r,new Date(Date.now()+7*86400000),'22:00','07:00',true);assert.ok(p);const lye=p.steps.find(x=>x.title==='Mit Bäckerlauge behandeln');assert.ok(lye);assert.match(lye.detail,/Schutzbrille/);const bake=p.steps.find(x=>x.title==='Backphase starten');assert.ok(lye.at<bake.at)});

test('landbrot can use overnight refrigerator proof when warm plan cannot fit sleep schedule',()=>{const r=recipes.find(x=>x.id==='starter-weizen-landbrot');const p=makePlan(r,new Date(Date.now()+4*86400000),'22:00','07:00',false,45,null,null,{starterHours:9});assert.ok(p);assert.equal(p.cold,true);assert.ok(p.steps.some(x=>x.title==='Kühlschrankgare'))});

test('pizza has cold maturation followed by warm tempering before topping',()=>{
 const r=recipes.find(x=>x.id==='starter-pizza'),p=makePlan(r,new Date(Date.now()+7*86400000),'22:00','07:00',true);
 assert.ok(p?.cold);
 const cold=p.steps.find(s=>s.title==='Kühlschrankgare'),warm=p.steps.find(s=>s.title==='Pizzakugeln temperieren'),top=p.steps.find(s=>s.title==='Pizza ausziehen und belegen');
 assert.equal(cold.at+cold.minutes*60000,warm.at);
 assert.equal(warm.at+warm.minutes*60000,top.at);
});
import {weeklyBread} from '../planning-ui.js';
test('weekly bread can be divided without increasing the ingredients',()=>{
 assert.deepEqual(weeklyBread(2,100,2),{total:1400,perLoaf:700});
 assert.deepEqual(weeklyBread(2,100,4),{total:1400,perLoaf:350});
});
test('30 distinct source recipes have ingredients, starter and a reader rating',()=>{
 const added=recipes.filter(r=>r.originalUrl);
 assert.equal(new Set(added.map(r=>r.originalUrl)).size,30);
 assert.ok(added.every(r=>r.starter.grams>0&&r.readerVotes>0&&r.readerRating>0&&r.flours.every(f=>f.grams>0)));
});
test('finish picker accepts exact feasible slots and rejects occupied or too-early times',()=>{
 const wanted=new Date(Date.now()+2*86400000);wanted.setHours(17,0,0,0);
 const options={mode:'warm',exactFinish:true,starterHours:8};
 const run=(date,ready,extra={})=>makePlan(recipes[0],date,'00:00','00:00',ready,45,null,null,{...options,...extra});
 const plan=run(wanted,true);
 assert.equal(plan.finish,+wanted);assert.equal(plan.shift,0);
 assert.equal(run(wanted,true,{occupied:[{at:+wanted,minutes:5}]}),null);
 const mix=plan.steps.find(s=>s.title==='Teig mischen');
 const earliestStart=new Date(mix.at-2*3600000);
 assert.ok(run(wanted,true,{earliestStart}));assert.equal(run(wanted,false,{earliestStart}),null);
 assert.equal(makePlan(recipes[0],wanted,'16:00','18:00',true,45,null,null,options),null);
});
