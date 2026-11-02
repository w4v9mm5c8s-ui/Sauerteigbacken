import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseOwnRecipe} from '../own-recipe-parser.js';
import {starterForecast} from '../starter-tracking.js';
import {flourSuggestion} from '../flour-table.js';
import {planningView,readPlanningForm} from '../planning-ui.js';
import {rescheduleRemaining} from '../planner.js';
const recipes=JSON.parse(readFileSync(new URL('../recipes.json',import.meta.url),'utf8'));
const flours=JSON.parse(readFileSync(new URL('../flour-table.json',import.meta.url),'utf8'));
test('original PDF flour table contains 27 types',()=>{assert.equal(flours.length,27);assert.equal(flourSuggestion(flours,'Weizenmehl Type 550',500).water,320)});
test('personal recipe becomes plannable only with complete ingredients and bake times',()=>{const r=parseOwnRecipe({title:'Mein Brot',ingredients:'500 g Weizenmehl\n350 g Wasser\n100 g Starter\n10 g Salz',steps:'Mischen\nFalten\nBacken',bakeTemp:230,bakeMin:45,stockHours:4,proofHours:2});assert.equal(r.water,350);assert.equal(r.flours[0].grams,500);assert.equal(r.bake[0].min,45)});
test('missing amounts are rejected rather than invented',()=>assert.throws(()=>parseOwnRecipe({title:'Mein Brot',ingredients:'Weizenmehl\n350 g Wasser\n100 g Starter',steps:'Mischen\nBacken',bakeTemp:230,bakeMin:45,stockHours:4,proofHours:2})));
test('starter forecast requires three comparable observations',()=>{const logs=[{ratio:'1:2:2',temperature:22,peakHours:7},{ratio:'1:2:2',temperature:23,peakHours:9}];assert.equal(starterForecast(logs,'1:2:2',22),null);logs.push({ratio:'1:2:2',temperature:22,peakHours:8});assert.equal(starterForecast(logs,'1:2:2',22).hours,8)});
test('full planner has room, flour, starter temperature and mode fields',()=>{const html=planningView(recipes[0],x=>String(x),new Date('2026-11-03T12:00:00'),flours);for(const id of ['roomTemp','flourTemp','starterTemp','proofMode','flourPerLoaf','loaves','starterHydration','starterHours','foldCount'])assert.match(html,new RegExp('id="'+id+'"'))});
test('rescheduling shifts future steps without touching completed steps',()=>{const now=Date.now()+86400000;const steps=[{at:now,title:'Done',active:true},{at:now+3600000,title:'Later',active:true}];const p=rescheduleRemaining(steps,0,30,'23:00','06:00');assert.equal(p[0].at,now);assert.ok(p[1].at>=steps[1].at+1800000)});
test('original illustrations are self-contained SVGs',()=>{for(const name of ['art-loaf.svg','art-starter.svg','art-tools.svg']){const svg=readFileSync(new URL('../'+name,import.meta.url),'utf8');assert.match(svg,/<svg/);assert.match(svg,/<\/svg>/)}});

test('finished bread weight is treated as post-bake estimate and includes soaker water',()=>{
 const r=recipes[0];const fields={loaves:1,flourPerLoaf:500,finishedWeight:900,bakeLoss:10,waterAmount:r.water,saltAmount:r.salt,starterAmount:r.starter.grams,starterType:r.starter.type,starterHydration:100,stockHours:4,proofHours:2,altbrot:20,altbrotRatio:3,soakerAmount:0,soakerWater:0,soakerHours:12,ovenLoads:1,proofMode:'warm',starterHours:'',foldInterval:40,foldCount:2,preheat:45,roomTemp:22,flourTemp:22,starterTemp:'',targetTemp:24,fridgeTemp:'',finish:'2030-01-01T12:00',sleepFrom:'22:00',sleepTo:'07:00',awayFrom:'',awayTo:'',earliestStart:'',bakeName:'Testbrot'};
 r.flours.forEach((f,i)=>{fields['flourName'+i]=f.name;fields['flourAmount'+i]=f.grams});
 const get=id=>({value:String(fields[id]??''),checked:false});
 const out=readPlanningForm(r,get);
 const total=out.recipe.flours.reduce((a,x)=>a+x.grams,0)+out.recipe.water+out.recipe.salt+out.recipe.starter.grams+out.recipe.extras.reduce((a,x)=>a+x.grams,0);
 assert.ok(Math.abs(total-1000)<2,'Raw dough mass should reflect 900g target at 10% loss');
});
