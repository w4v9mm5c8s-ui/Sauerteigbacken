import {PDF_PEAK,PDF_STOCK,PDF_PROOF,PDF_COLD_PROOF,PDF_BANNETON,PDF_SOAKER_RATIOS,PDF_LESSONS,estimateStarterPeak,estimateFermentation,checkBanneton,calculateStarterFeed,waterBalance,standardBakePhases,seedWaterRatio} from './pdf-baking.js';
const escDefault=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const field=(id,label,value,type='number',other='')=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" '+other+' value="'+value+'">';
const select=(id,label,values)=>'<label for="'+id+'">'+label+'</label><select id="'+id+'">'+values.map(x=>{const value=Array.isArray(x)?x[0]:x,title=Array.isArray(x)?x[1]:x;return '<option value="'+escDefault(value)+'">'+escDefault(title)+'</option>'}).join('')+'</select>';
const button=(act,title)=>'<button type="button" data-act="'+act+'" class="pdf-tool-button">'+title+'</button>';
export function pdfToolsView(flourTable=[],esc=escDefault){
 const grains=flourTable.map(x=>[x.name,x.name]);
 const soakers=PDF_SOAKER_RATIOS.flatMap(g=>g.names.map(name=>[name,name+' ('+g.label+')']));
 const lessons=PDF_LESSONS.map(g=>'<details class="pdf-lesson"><summary>'+esc(g.name)+' <small>PDF S. '+g.pages+'</small></summary><p>'+esc(g.intro)+'</p><ol>'+g.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></details>').join('');
 const opts=['1:1:1','1:2:2','1:3:3','1:5:5','1:10:10'];
 return '<header class="pdf-tool-intro"><span class="studio-overline">DEIN SAUERTEIG-WERKZEUGKASTEN</span><h2>Backwissen & Rechner</h2><p>Originalwerte aus der Sauerteig-PDF, nachvollziehbar gerechnet. Reife und Temperaturen immer am Teig kontrollieren.</p></header>'+
 '<section class="card pdf-tool-card"><h3>Starter richtig füttern</h3><p>Ermittelt die neue Hydration und einen Reife-Richtwert aus dem PDF (S. 11–12).</p>'+
 field('pdfOldMass','Altes Anstellgut (g)',50)+field('pdfOldHyd','Bisherige Hydration (%)',100)+
 select('pdfRatio','Fütterungsverhältnis',opts)+select('pdfStarterKind','Starterart',['Weizen','Roggen'])+field('pdfStarterTemp','Reifetemperatur (18–24 °C)',21)+
 button('pdfFeed','Fütterung berechnen')+'<div id="pdfFeedResult" class="pdf-tool-result" aria-live="polite"></div></section>'+
 '<section class="card pdf-tool-card"><h3>Stock- und Stückgare</h3><p>Referenztabellen S. 16–17 und 20–21. Die Stockgare gilt genau nur bei 500 g Mehl, 170 g ASG und 50 % Starter-Hydration.</p>'+
 select('pdfFlour','Mehlart',grains)+field('pdfGareTemp','Raum-/Teigtemperatur (°C)',21)+
 button('pdfGare','Gärzeiten vergleichen')+'<div id="pdfGareResult" class="pdf-tool-result" aria-live="polite"></div></section>'+
 '<section class="card pdf-tool-card"><h3>Gärkörbchen auswählen</h3><p>Empfohlene Größen nach Rohteiggewicht (PDF S. 23).</p>'+
 field('pdfBasketGrams','Rohteiggewicht pro Brot (g)',900)+select('pdfBasketShape','Form',[['round','Rund'],['oval','Oval']])+
 button('pdfBasket','Korbgröße berechnen')+'<div id="pdfBasketResult" class="pdf-tool-result" aria-live="polite"></div></section>'+
 '<section class="card pdf-tool-card"><h3>Quellwasser und Brühstück</h3><p>Alle verwendeten Flüssigkeiten werden aus dem Gesamtwasser abgezogen, nicht hinzuaddiert.</p>'+
 select('pdfBalanceFlour','Mehl',grains)+field('pdfBalanceFlourGrams','Mehlmenge (g)',500)+field('pdfBalanceWater','Gesamtes Rezeptwasser (g)',380)+
 field('pdfBalanceStarter','Reifer Starter (g)',170)+field('pdfBalanceStarterHyd','Starter-Hydration (%)',100)+
 select('pdfSeedName','Saat oder Schrot', [['','Kein Quellstück'],...soakers])+field('pdfSeedGrams','Saat-/Schrotmenge (g)',0)+
 field('pdfAltGrams','Altbrot (g)',0)+select('pdfAltRatio','Altbrot-Wasser',[['3','3× (PDF-Haupttext S. 28)'],['2','2× (PDF-Tabelle S. 29)']])+
 field('pdfBrewFlour','Mehl im Brühstück (g; zählt zur Mehlmenge)',0)+field('pdfBrewWater','Brühwasser (g)',0)+
 button('pdfWaterBalance','Wasserbilanz berechnen')+'<div id="pdfWaterResult" class="pdf-tool-result" aria-live="polite"></div></section>'+
 '<section class="card pdf-tool-card"><h3>Backprogramm aus der PDF</h3><p>Strukturierter Standardablauf für geeignete Brote (S. 24), nicht automatisch für Laugengebäck, Pizza, Airfryer oder süße Teige.</p>'+
 button('pdfStandardBake','Standardphasen anzeigen')+'<div id="pdfBakeResult" class="pdf-tool-result" aria-live="polite"></div></section>'+
 '<section class="card pdf-figures"><h3>Lehrbilder: Teigentwicklung und Backphasen</h3>'+
 '<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 115" role="img" aria-label="Drei schematische Reifestufen"><g fill="#e9cdb2" stroke="#986e5f" stroke-width="3"><path d="M20 72 Q55 60 115 72 V95 H20Z"/><path d="M181 58 Q239 16 297 58 V95 H181Z"/><path d="M355 81 Q398 80 459 82 V95 H355Z"/></g><g fill="#66443a" font-family="sans-serif" font-size="14" text-anchor="middle"><text x="70" y="111">Untergare</text><text x="238" y="111">Gute Reife</text><text x="410" y="111">Übergare</text></g></svg><figcaption>Die Grafik ist schematisch. Auf Volumen, Gasblasen und Teigspannung achten, nicht nur auf Zeiten.</figcaption></figure>'+
 '<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 115" role="img" aria-label="Stretch and Fold und Coil Fold"><rect x="14" y="15" width="210" height="65" rx="17" fill="#efcfbe"/><rect x="256" y="15" width="210" height="65" rx="17" fill="#e5d4b8"/><g fill="none" stroke="#a56c68" stroke-width="6" stroke-linecap="round"><path d="M46 46 Q95 8 176 49 M154 31 L177 49 150 68"/><path d="M291 61 Q365 6 430 61 M290 60 l16 -26 M430 60 l-18 -26"/></g><g fill="#61443a" font-family="sans-serif" font-size="14" text-anchor="middle"><text x="118" y="101">Stretch &amp; Fold</text><text x="360" y="101">Coil Fold</text></g></svg><figcaption>Erst behutsam über die Mitte falten, später von unten anheben – bei geeigneten Weizenteigen.</figcaption></figure>'+
 '<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 100" role="img" aria-label="Backphasen 230 Grad mit Dampf und danach 210 Grad ohne Dampf"><path d="M25 23 H448" stroke="#d1b9a1" stroke-width="14"/><path d="M25 23 H104" stroke="#b4757c" stroke-width="14"/><g font-family="sans-serif" fill="#684c43" font-size="14" text-anchor="middle"><text x="35" y="54">0</text><text x="108" y="54">8 Min.</text><text x="270" y="54">28 Min.</text><text x="435" y="54">48 Min.</text><text x="64" y="82">230 °C</text><text x="310" y="82">210 °C</text></g></svg><figcaption>Das PDF-Standardprogramm gilt für geeignete Brote, nicht für alle Gebäckarten.</figcaption></figure></section>'+
 '<section class="card pdf-tool-card"><h3>Schritt-für-Schritt-Anleitungen</h3><div class="pdf-lesson-list">'+lessons+'</div></section>'+
 '<p class="pdf-source-note">PDF-Quellen sind als Seitenangaben hinterlegt. Die Tabelle ist eine Praxishilfe, kein Messgerät; fehlende Werte werden nicht erfunden. Abweichende Altbrot-Angaben bleiben wählbar.</p>';
}
export function pdfToolCalculation(action,form,flourTable=[],esc=escDefault){
 const num=id=>Number(form[id]??0),s=id=>String(form[id]??''),one=name=>({name,grams:500}),grams=id=>num(id);
 if(action==='pdfFeed'){const feed=calculateStarterFeed({oldStarter:num('pdfOldMass'),oldHydration:num('pdfOldHyd'),ratio:s('pdfRatio')});
  const peak=estimateStarterPeak({ratio:s('pdfRatio'),temperature:num('pdfStarterTemp'),type:s('pdfStarterKind')});
  return '<strong>Fütterung:</strong> '+feed.oldStarter+' g alter Starter + '+feed.addedFlour+' g Mehl + '+feed.addedWater+' g Wasser = '+feed.total+' g. Neue Hydration: <strong>'+feed.newHydration+' %</strong>.'+
   (peak.hours===null?'<p>'+esc(peak.warning)+'</p>':'<p>Peak-Richtwert: <strong>'+peak.hours+' ± '+peak.uncertainty+' Stunden</strong> bei '+peak.temperature+' °C. '+esc(peak.warning)+'</p>');}
 if(action==='pdfGare'){const name=s('pdfFlour'),temp=num('pdfGareTemp'),flours=one(name);
  const stock=estimateFermentation({kind:'stock',temperature:temp,flours,flourTable,starterHydration:50,starterGrams:170,flourTotal:500});
  const proof=estimateFermentation({kind:'proof',temperature:temp,flours,flourTable});
  return '<strong>Stockgare:</strong> '+(stock.hours===null?esc(stock.reason):stock.hours+' ± '+stock.uncertainty+' h')+'<p><strong>Stückgare:</strong> '+(proof.hours===null?esc(proof.reason):proof.hours+' ± '+proof.uncertainty+' h')+'</p><p>Referenzwerte nur für die angegebenen Bedingungen; Zustand des Teiges prüfen.</p>';}
 if(action==='pdfBasket'){const b=checkBanneton(num('pdfBasketGrams'),s('pdfBasketShape'));
  return b.size?'<strong>'+b.size[0]+'–'+b.size[1]+' cm '+(b.shape==='round'?'Durchmesser':'Länge')+'</strong><p>'+esc(b.warning)+'</p>':'<p>'+esc(b.warning)+'</p>';}
 if(action==='pdfWaterBalance'){
  const water=waterBalance({flours:[{name:s('pdfBalanceFlour'),grams:grams('pdfBalanceFlourGrams')}],totalWater:num('pdfBalanceWater'),starter:num('pdfBalanceStarter'),starterHydration:num('pdfBalanceStarterHyd'),soakers:s('pdfSeedName')&&num('pdfSeedGrams')>0?[{name:s('pdfSeedName'),grams:num('pdfSeedGrams')}]:[],altbrot:num('pdfAltGrams'),altbrotRatio:num('pdfAltRatio'),brewFlour:num('pdfBrewFlour'),brewWater:num('pdfBrewWater')});
  return '<strong>Wasser in den Hauptteig: '+water.mainWater+' g</strong><p>Für Altbrot: '+water.altbrotWater+' g · Für Saaten: '+water.soakerWater+' g · Für Brühstück: '+water.brewWater+' g.</p><p>Gesamtwasser: '+water.totalRecipeWater+' g; Hydration inklusive Starter: '+water.hydration+' %. Rohteiggewicht: '+water.doughMass+' g.</p><p>'+esc(water.note)+'</p>';}
 if(action==='pdfStandardBake'){const base=new Date();base.setSeconds(0,0);base.setHours(18,0);if(+base<Date.now())base.setDate(base.getDate()+1);
  const steps=standardBakePhases({start:base,preheat:60});
  return '<ol class="pdf-phases">'+steps.map(s=>'<li><strong>'+new Date(s.at).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' · '+esc(s.title)+'</strong>'+(s.temp?' · '+s.temp+' °C':'')+'</li>').join('')+'</ol><p>Beispiel: Einschießen 18 Uhr. Das Programm gilt nur für das PDF-Standardbrot.</p>';}
 throw Error('Unbekannter Rechner.');
}
