import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makePlan} from '../planner.js';
const recipes=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url),'utf8'));
test('26 recipes and instructions available',()=>{assert.equal(recipes.length,26);assert.ok(recipes.every(r=>r.steps.length>=3&&r.flours.length))});
test('Laugen recipes warn about protective equipment',()=>{for(const r of recipes.filter(r=>/Laugen/.test(r.title)))assert.match(r.steps.join(' '),/Schutzbrille/)});
test('planner creates separate preheat and baking steps',()=>{const p=makePlan(recipes[0],new Date(Date.now()+5*86400000),'22:00','07:00',true);assert.ok(p);assert.ok(p.steps.some(s=>s.title==='Ofen vorheizen'));assert.ok(p.steps.some(s=>s.title==='Backphase starten'))});
test('planner never schedules active work during sleep',()=>{const p=makePlan(recipes[0],new Date(Date.now()+5*86400000),'22:00','07:00',true);assert.ok(p);for(const s of p.steps.filter(x=>x.active)){const h=new Date(s.at).getHours();assert.ok(h>=7&&h<22,s.title+' '+h)}});
test('planner marks uncalibrated estimates',()=>{const p=makePlan(recipes[0],new Date(Date.now()+5*86400000),'22:00','07:00',true);assert.match(p.assumptions,/Richtwerte/)});

test('planner respects a one-time absence window',()=>{const wanted=new Date(Date.now()+6*86400000);const awayStart=new Date(wanted.getTime()-12*3600000),awayEnd=new Date(wanted.getTime()+12*3600000);const p=makePlan(recipes[0],wanted,'22:00','07:00',true,45,awayStart,awayEnd);assert.ok(p);for(const step of p.steps.filter(s=>s.active))assert.ok(step.at<+awayStart||step.at>=+awayEnd,step.title) });
test('planner never schedules active tasks in the past',()=>{const p=makePlan(recipes[0],new Date(Date.now()+60000),'22:00','07:00',false);assert.ok(p);assert.ok(p.steps.filter(s=>s.active).every(s=>s.at>Date.now()))});

test('pretzel baking plan includes separate lye handling and protective warning',()=>{const r=recipes.find(x=>x.title==='Sauerteig-Laugenbrezeln');const p=makePlan(r,new Date(Date.now()+7*86400000),'22:00','07:00',true);assert.ok(p);const lye=p.steps.find(x=>x.title==='Mit Bäckerlauge behandeln');assert.ok(lye);assert.match(lye.detail,/Schutzbrille/);const bake=p.steps.find(x=>x.title==='Backphase starten');assert.ok(lye.at<bake.at)});
