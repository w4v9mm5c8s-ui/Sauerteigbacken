import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDF_PEAK,estimateStarterPeak,estimateFermentation,checkBanneton,seedWaterRatio,calculateStarterFeed,waterBalance,standardBakePhases,PDF_LESSONS,PDF_BANNETON} from '../pdf-baking.js';
import {pdfToolsView,pdfToolCalculation} from '../pdf-tools-ui.js';
import {PDF_SOURCE_RECIPES,pdfRecipesView} from '../pdf-recipes.js';
import {makePlan} from '../planner.js';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const table=JSON.parse(get('flour-table.json'));
const recipes=JSON.parse(get('recipes.json'));
test('PDF starter peak grid contains 5 ratios × 7 measured temperatures',()=>{
 assert.equal(Object.keys(PDF_PEAK).length,5);
 for(const t of Object.values(PDF_PEAK)){assert.equal(t.hours.length,7);assert.equal(t.uncertainty.length,7)}
 assert.equal(estimateStarterPeak({ratio:'1:1:1',temperature:21}).hours,6.5);
 assert.equal(estimateStarterPeak({ratio:'1:2:2',temperature:21}).hours,10);
 assert.equal(estimateStarterPeak({ratio:'1:5:5',temperature:23}).hours,17);
 assert.equal(estimateStarterPeak({ratio:'1:1:1',temperature:25}).hours,null);
});
test('personal starter observations replace table values when 3 comparable measurements exist',()=>{
 const observations=[8,9,10].map(peakHours=>({ratio:'1:2:2',temperature:22,peakHours}));
 const r=estimateStarterPeak({ratio:'1:2:2',temperature:22,observations});
 assert.equal(r.hours,9);assert.equal(r.observations,3);
});
test('old starter hydration is carried through after feeding, never silently overwritten',()=>{
 const r=calculateStarterFeed({oldStarter:50,oldHydration:50,ratio:'1:1:1'});
 assert.equal(r.total,150);assert.equal(r.addedWater,50);assert.equal(r.addedFlour,50);
 assert.equal(r.newHydration,80);
 assert.throws(()=>calculateStarterFeed({oldStarter:100,oldHydration:0,ratio:'1:2:2'}));
});
test('PDF stock/proof times use actual flour factors and distinguish reference conditions',()=>{
 const args={temperature:20,flours:[{name:'Weizenmehl Type 550',grams:500}],flourTable:table};
 const stock=estimateFermentation({...args,kind:'stock',starterHydration:50,starterGrams:170,flourTotal:500});
 assert.equal(stock.hours,4.5);assert.equal(stock.valid,true);
 const invalid=estimateFermentation({...args,kind:'stock',starterHydration:100,starterGrams:170,flourTotal:500});
 assert.equal(invalid.valid,false);assert.match(invalid.warning,/50 %/);
 assert.equal(estimateFermentation({...args,kind:'proof'}).hours,2);
 assert.equal(estimateFermentation({...args,kind:'proof',temperature:25}).hours,null);
 const rye=estimateFermentation({...args,kind:'stock',flours:[{name:'Roggenmehl Type 1150',grams:500}],starterHydration:50,starterGrams:170,flourTotal:500});
 assert.equal(rye.hours,3.6);
});
test('Gärkörbchen size table has round/oval references for 500–1500 grams',()=>{
 assert.equal(PDF_BANNETON.length,5);
 assert.deepEqual(checkBanneton(900,'round').size,[20,22]);
 assert.deepEqual(checkBanneton(900,'oval').size,[22,24]);
 assert.equal(checkBanneton(1510,'round').size,null);
});
test('seed water absorption factors match each PDF category',()=>{
 assert.equal(seedWaterRatio('Sonnenblumenkerne'),.5);
 assert.equal(seedWaterRatio('Haferflocken'),1);
 assert.equal(seedWaterRatio('Leinsaat'),1.5);
 assert.equal(seedWaterRatio('geschrotete Leinsaat'),2);
 assert.equal(seedWaterRatio('unbekannte Saat'),null);
});
test('main dough water excludes altbrot, seed soaker and brew water exactly once',()=>{
 const r=waterBalance({flours:[{name:'Weizenmehl Type 550',grams:500}],totalWater:380,starter:170,starterHydration:100,
  altbrot:25,altbrotRatio:3,soakers:[{name:'Sonnenblumenkerne',grams:30}],brewFlour:50,brewWater:50});
 assert.equal(r.altbrotWater,75);assert.equal(r.soakerWater,15);assert.equal(r.brewWater,50);
 assert.equal(r.reserve,140);assert.equal(r.mainWater,240);
 assert.equal(r.totalRecipeWater,380);assert.equal(r.doughMass,1105);
 assert.equal(r.hydration,79.5);
});
test('insufficient recipe water and inconsistent brew ratios fail explicitly',()=>{
 const args={flours:[{name:'Weizenmehl Type 550',grams:500}],totalWater:100,starter:170,altbrot:25,brewFlour:50,brewWater:100};
 assert.throws(()=>waterBalance(args),/überschreitet/);
 assert.throws(()=>waterBalance({...args,totalWater:500,brewFlour:50,brewWater:10}),/100 und 200/);
 assert.throws(()=>waterBalance({...args,totalWater:500,soakers:[{name:'nicht bekannt',grams:20}],altbrot:0,brewWater:0,brewFlour:0}),/unbekannt/);
});
test('PDF standard bake program has separate steam, scoring, temperature-change and cooling phases',()=>{
 const phases=standardBakePhases({start:new Date('2026-12-02T18:00:00'),preheat:60});
 assert.ok(phases.some(p=>p.title.includes('vorheizen')&&p.offset===-60));
 assert.ok(phases.some(p=>p.title.includes('Nachschneiden')&&p.offset===4));
 assert.ok(phases.some(p=>p.title.includes('Dampf ablassen')&&p.offset===8&&p.temp===210));
 assert.ok(phases.some(p=>p.title.includes('Kerntemperatur')&&p.offset===48));
 assert.ok(phases.some(p=>p.title.includes('auskühlen')&&p.minutes===60));
});
test('planner accepts precise, user-selected PDF phases and overlaps autolyse with starter development',()=>{
 const r=recipes.find(r=>r.id==='starter-weizen-landbrot');
 const deadline=new Date();deadline.setDate(deadline.getDate()+8);deadline.setHours(20,0,0,0);
 const result=makePlan(r,deadline,'22:30','06:00',false,60,null,null,{mode:'warm',starterHours:7,stockMinutes:210,proofMinutes:96,foldCount:4,pdfStandardBake:true});
 assert.ok(result,'should yield a safe plan within the allowed horizon');
 assert.ok(result.steps.some(s=>s.title.includes('Nachschneiden')));
 assert.ok(result.steps.some(s=>s.title.includes('Coil Fold')));
 const feed=result.steps.find(s=>s.title==='Starter füttern');
 const mix=result.steps.find(s=>s.title==='Teig mischen');
 const auto=result.steps.find(s=>s.title==='Autolyse ansetzen');
 assert.ok(feed.at<mix.at);
 assert.ok(auto.at<mix.at);
 assert.ok(feed.at<=auto.at+3600000);
});
test('PDF standard bake program rejects unsuitable specialty recipes',()=>{
 const r=recipes.find(x=>x.id==='starter-pizza'),deadline=new Date(Date.now()+9*86400000);
 assert.throws(()=>makePlan(r,deadline,'23:00','06:00',true,60,null,null,{pdfStandardBake:true}),/Spezialrezept/);
});
test('all named PDF recipe variants are available without invented amounts',()=>{
 assert.equal(PDF_SOURCE_RECIPES.length,9);
 for(const r of PDF_SOURCE_RECIPES){assert.ok(r.page>=37&&r.page<=41);assert.ok(r.ingredients.length>=4)}
 const air=PDF_SOURCE_RECIPES.find(r=>r.id==='pdf-airfryer');
 assert.ok(air.ingredients.includes('6 g Salz'));
 const yogurt=PDF_SOURCE_RECIPES.find(r=>r.id==='pdf-joghurt');
 assert.ok(yogurt.ingredients.includes('1½ TL Salz'));
 const toast=PDF_SOURCE_RECIPES.find(r=>r.id==='pdf-toast');
 assert.ok(toast.ingredients.includes('270 g Milch (leicht warm)'));
});
test('PDF tools and recipes are accessible through the live public app and page views',()=>{
 const tools=pdfToolsView(table),cards=pdfRecipesView();
 for(const action of ['pdfFeed','pdfGare','pdfBasket','pdfWaterBalance','pdfStandardBake'])assert.match(tools,new RegExp('data-act="'+action+'"'));
 assert.match(tools,/viewBox="0 0 480 115"/);
 assert.match(cards,/Airfryer/);assert.match(cards,/Joghurtbrötchen/);
 const app=get('app.js'),hub=get('hub.js'),server=get('server.mjs'),sw=get('sw.js');
 assert.match(app,/pdfTools:\(\)=>pdfToolsView/);
 assert.match(app,/pdfRecipes:\(\)=>pdfRecipesView/);
 assert.match(hub,/pdfTools/);assert.match(hub,/pdfRecipes/);
 for(const asset of ['/pdf-baking.js','/pdf-tools-ui.js','/pdf-recipes.js']){assert.ok(server.includes("'"+asset+"'"));assert.ok(sw.includes("'"+asset+"'"))}
});
test('PDF tools compute a numeric response with source-preserving assumptions',()=>{
 const html=pdfToolCalculation('pdfFeed',{pdfOldMass:'50',pdfOldHyd:'50',pdfRatio:'1:1:1',pdfStarterTemp:'21',pdfStarterKind:'Weizen'},table);
 assert.match(html,/80 %/);assert.match(html,/6.5/);
 assert.equal(PDF_LESSONS.length,7);
});
test('back-planner maintains single-use total recipe water including soak and brew',()=>{
 const src=get('planning-ui.js');
 assert.match(src,/water:Math.round\(balance.mainWater\*factor/);
 assert.match(src,/waterBalance:\{\.\.\.balance/);
 assert.match(src,/PDF_SOAKER_RATIOS/);
 assert.match(src,/n\('brewWater'\)/);
});
