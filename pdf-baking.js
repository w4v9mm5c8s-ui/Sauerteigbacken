/** Numerische Nachschlagetabellen aus der vom Nutzer bereitgestellten Sauerteigbrot.pdf (41 S.).
 * Tabellen basieren auf definierten Beispielbedingungen, nicht auf klinisch/lebensmitteltechnisch
 * validierten universellen Kinetikmodellen. Entscheidungen treffen Menschen anhand des Teigzustands.
 * PDF S. 11–12, 16–17, 20–21, 23–24, 28–30. 
 */
export const PDF_PEAK={
  '1:1:1':{hours:[9,8,7,6.5,6,5.5,5],uncertainty:[2,1.5,1.5,1.5,1,1,1]},
  '1:2:2':{hours:[13,12,11,10,9,8,7],uncertainty:[2.5,2.5,2,2,2,1.5,1.5]},
  '1:3:3':{hours:[18,16,14,13,12,11,10],uncertainty:[3.5,3,3,2.5,2.5,2,2]},
  '1:5:5':{hours:[27,25,23,21,19,17,15],uncertainty:[5.5,5,4.5,4,4,3.5,3]},
  '1:10:10':{hours:[42,38,34,31,29,26,24],uncertainty:[8.5,7.5,7,6,6,5,5]}
};
export const PDF_STOCK={18:[5.5,1.1],19:[5,1],20:[4.5,.9],21:[4,.8],22:[3.5,.7],23:[3,.6],24:[2.5,.5]};
export const PDF_PROOF={18:[2.5,.5],19:[2.3,.45],20:[2,.4],21:[1.8,.35],22:[1.6,.3],23:[1.4,.3],24:[1.2,.25]};
export const PDF_COLD_PROOF={temperature:7,hours:12,uncertainty:2.5};
export const PDF_BANNETON=[
 {from:500,to:700,round:[16,18],oval:[18,20]},
 {from:700,to:900,round:[18,20],oval:[20,22]},
 {from:900,to:1100,round:[20,22],oval:[22,24]},
 {from:1100,to:1300,round:[22,24],oval:[24,26]},
 {from:1300,to:1500,round:[24,26],oval:[26,28]}
];
export const PDF_SOAKER_RATIOS=[
 {label:'50 %',ratio:.5,names:['Haselnüsse','Kürbiskerne','Mandeln','Sesam','Sonnenblumenkerne','Walnüsse']},
 {label:'100 %',ratio:1,names:['Buchweizen','Dinkelschrot','Haferflocken','Hartweizengrieß','Quinoa','Roggenschrot','Soja','Weizenschrot']},
 {label:'150 %',ratio:1.5,names:['Leinsaat','Maisgrieß']},
 {label:'200 %',ratio:2,names:['geschrotete Leinsaat','Altbrot (fein gemahlen)','Weizenkleie']}
];
const round=x=>Math.round(x*10)/10;
const isFiniteNum=v=>Number.isFinite(Number(v));
const required=(value,label,min=0,max=100000)=>{const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)throw Error('Bitte '+label+' prüfen.');return n;};
function atTemp(rows,temp){const low=Math.floor(temp),high=Math.ceil(temp);if(!rows[low]||!rows[high])return null;const k=temp-low;return [rows[low][0]*(1-k)+rows[high][0]*k,rows[low][1]*(1-k)+rows[high][1]*k];}
function listFlours(entries){
 if(!Array.isArray(entries)||!entries.length)throw Error('Mindestens ein Mehl ist notwendig.');
 let total=0;const items=entries.map(e=>{const grams=required(e.grams,'Mehlmenge',0.1,20000);total+=grams;return {name:String(e.name||'').trim(),grams}});
 if(!total||total>50000||items.some(x=>!x.name))throw Error('Mehlmengen oder Mehlnamen fehlen.');
 return {items,total};
}
function factorOf(entries,table,key){const byName=new Map(table.map(x=>[x.name,x]));let sum=0,total=0,unknown=[];
 for(const e of entries){const n=required(e.grams,'Mehlmenge',.1,20000),row=byName.get(e.name);if(!row||!Number.isFinite(Number(row[key]))){unknown.push(e.name);continue}sum+=n*Number(row[key]);total+=n}
 return {factor:unknown.length||!total?null:sum/total,unknown};
}
export function estimateStarterPeak({ratio='1:2:2',temperature=22,type='Weizen',observations=[]}={}){
 const temp=required(temperature,'Temperatur',-10,70),table=PDF_PEAK[ratio];if(!table)throw Error('Fütterungsverhältnis aus der PDF-Tabelle auswählen.');
 const values=(Array.isArray(observations)?observations:[]).filter(x=>String(x.ratio)===ratio&&Math.abs(Number(x.temperature)-temp)<=2&&Number(x.peakHours)>0&&Number.isFinite(Number(x.peakHours))).map(x=>Number(x.peakHours)).sort((a,b)=>a-b);
 const personal=values.length>=3?(values.length%2?values[(values.length-1)/2]:(values[values.length/2-1]+values[values.length/2])/2):null;
 const ref=temp>=18&&temp<=24?{hours:round(table.hours[Math.floor(temp)-18]*(1-(temp%1))+table.hours[Math.ceil(temp)-18]*(temp%1)),uncertainty:round(table.uncertainty[Math.floor(temp)-18]*(1-(temp%1))+table.uncertainty[Math.ceil(temp)-18]*(temp%1))}:null;
 return {type,ratio,temperature:temp,hours:personal===null?ref?.hours??null:round(personal),uncertainty:ref?.uncertainty??null,source:personal===null?'PDF, S. 12':'Eigene gemessene Fütterungen',observations:values.length,valid:personal!==null||!!ref,warning:ref?'Nur unter Referenzbedingungen; Reifezeichen haben Vorrang.':'PDF-Tabelle nur für 18–24 °C; außerhalb keine Zeit erfinden.'};
}
export function estimateFermentation({kind='stock',temperature=22,flours=[],flourTable=[],starterHydration=null,starterGrams=null,flourTotal=null,cold=false,recipeKind='standard'}={}){
 const t=required(temperature,'Temperatur',-5,60);
 if(cold){if(Math.abs(t-7)>0.01)return {hours:null,reason:'Kühlschranktabelle gilt für 7 °C; andere Temperatur separat messen.'};
  return {hours:12,uncertainty:2.5,kind:'cold',source:'PDF S. 20',warning:'Nur passende Standardbrot-Rezepte; kalte Gare ist bei Pizza/Focaccia/Bagels anders.'};}
 if(!['stock','proof'].includes(kind))throw Error('Unbekannte Garphase.');
 const temp=atTemp(kind==='stock'?PDF_STOCK:PDF_PROOF,t);if(!temp)return {hours:null,reason:'Gärtabelle umfasst nur 18–24 °C.'};
 const {factor,unknown}=factorOf(flours,flourTable,kind==='stock'?'stockFactor':'proofFactor');
 if(factor===null)return {hours:null,reason:'Mehl nicht in der PDF-Tabelle: '+unknown.join(', ')};
 const hours=round(temp[0]*factor);const uncertainty=round(temp[1]*factor);
 const baseline=kind==='stock';
 const valid=(recipeKind==='standard')&&(!baseline||(Math.abs(Number(starterHydration)-50)<.001&&Math.abs(Number(starterGrams)-170)<1&&Math.abs(Number(flourTotal)-500)<1));
 const warning=baseline&&!valid?'Die PDF-Stockgare beruht auf 500 g Mehl, 170 g Starter mit 50 % Hydration; bei anderer Rezeptur nur Vergleichswert.':'Nach Reifezeichen kontrollieren; kein verbindlicher Fertigtermin.';
 return {hours,uncertainty,valid,warning,kind,temperature:t,flourFactor:round(factor),source:baseline?'PDF S. 16–17':'PDF S. 20–21'};
}
export function checkBanneton(weight,shape='round'){
 const mass=required(weight,'Teiggewicht',100,20000);
 if(!['round','oval'].includes(shape))throw Error('Körbchenform nicht bekannt.');
 const row=PDF_BANNETON.find(x=>mass>=x.from&&(mass<x.to||mass===1500&&x.to===1500));
 if(!row)return {size:null,warning:'PDF-Tabelle nur für 500–1500 g Rohteig. Gärkörbchengröße separat prüfen.'};
 return {shape,weight:mass,size:row[shape],unit:'cm',source:'PDF S. 23',warning:'Richtwerte; die PDF nennt eine Füllung von 70–80 %.'};
}
export function seedWaterRatio(name){
 const norm=String(name||'').trim().toLocaleLowerCase('de-DE');if(!norm)return null;
 const found=PDF_SOAKER_RATIOS.find(group=>group.names.some(x=>x.toLocaleLowerCase('de-DE')===norm));
 return found?found.ratio:null;
}
export function calculateStarterFeed({oldStarter,oldHydration,ratio='1:2:2'}={}){
 const mass=required(oldStarter,'alte Startermenge',.1,5000),hydration=required(oldHydration,'alte Starter-Hydration',1,500);
 const parts=String(ratio).split(':').map(Number);
 if(parts.length!==3||parts.some(v=>!Number.isFinite(v)||v<=0))throw Error('Fütterungsverhältnis muss 1:2:2 o. Ä. sein.');
 const [a,b,c]=parts;const addedFlour=mass*b/a,addedWater=mass*c/a,oldFlour=mass*100/(100+hydration),oldWater=mass-oldFlour;
 return {oldStarter:mass,addedFlour:round(addedFlour),addedWater:round(addedWater),total:round(mass+addedFlour+addedWater),newHydration:round(100*(oldWater+addedWater)/(oldFlour+addedFlour)),note:'Werte setzen die tatsächliche alte Hydration voraus; unbekannte Hydration nicht raten.'};
}
export function waterBalance({flours=[],totalWater=0,starter=0,starterHydration=100,soakers=[],altbrot=0,altbrotRatio=3,brewFlour=0,brewWater=0,extras=[]}={}){
 const {total:flourMass}=listFlours(flours);
 const water=required(totalWater,'Gesamtwasser',0,30000),starterMass=required(starter,'Starter',0,10000),hyd=required(starterHydration,'Starter-Hydration',20,250),alt=required(altbrot,'Altbrot',0,10000);
 const altRatio=required(altbrotRatio,'Altbrot-Verhältnis',2,3);if(![2,3].includes(altRatio))throw Error('Altbrot-Verhältnis nur 2 oder 3 gemäß PDF-Konflikt.');
 const bw=required(brewWater,'Brühstückwasser',0,20000),bf=required(brewFlour,'Brühstückmehl',0,20000);
 if(bf>flourMass)throw Error('Brühstückmehl darf die vorhandene Mehlmenge nicht überschreiten.');
 if(bf>0&&(bf/flourMass<.05||bf/flourMass>.2))throw Error('Brühstück laut PDF mit 5–20 % des Mehlgewichts anlegen.');
 if(bf>0&&(bw/bf<1||bw/bf>2))throw Error('Brühstück-Wasser gemäß PDF zwischen 100 und 200 % wählen.');
 if(bf===0&&bw>0)throw Error('Brühstückwasser ohne Brühstückmehl nicht möglich.');
 let seeded=0,seedMass=0;
 for(const s of soakers){const mass=required(s.grams,'Quellstückmenge',0,10000);const ratio=s.ratio===undefined||s.ratio===null?seedWaterRatio(s.name):Number(s.ratio);
  if(ratio===null||!Number.isFinite(ratio)||ratio<0||ratio>4)throw Error('Wasseraufnahme für '+String(s.name||'diese Saat')+' unbekannt. Bitte ausdrücklich auswählen.');
  seeded+=mass*ratio;seedMass+=mass;
 }
 const altWater=alt*altRatio,reserved=altWater+seeded+bw,mainWater=water-reserved;
 if(mainWater<-.01)throw Error('Quell- und Brühwasser ('+round(reserved)+' g) überschreitet das gesamte Rezeptwasser ('+round(water)+' g). Hauptteigwasser darf nicht negativ werden.');
 const starterFlour=starterMass*100/(100+hyd),starterWater=starterMass-starterFlour;
 const doughExtras=extras.filter(x=>!['topping','bad','fuellung','füllung','belag','deko','blech'].includes(String(x.role||'teig').toLowerCase())).reduce((a,x)=>a+required(x.grams,'Zutat',0,20000),0);
 return {flourMass:round(flourMass),totalRecipeWater:round(water),mainWater:round(Math.max(0,mainWater)),soakerWater:round(seeded),altbrotWater:round(altWater),brewWater:round(bw),starterWater:round(starterWater),starterFlour:round(starterFlour),hydration:round((water+starterWater)/(flourMass+starterFlour)*100),doughMass:round(flourMass+water+starterMass+alt+seedMass+doughExtras),reserve:round(reserved),source:'PDF S. 28–30',note:'Wasser nur einmal erfassen: Brüh-/Quellwasser aus dem gesamten Rezeptwasser entnehmen. Brühstückmehl ist in den Mehlzeilen enthalten.'};
}
export function standardBakePhases({start=Date.now(),preheat=60}={}){
 const date=Number(new Date(start));if(!Number.isFinite(date))throw Error('Startzeit ungültig.');
 const base=date; const events=[
  {offset:-preheat,title:'Ofen und Backfläche vorheizen',temp:250,minutes:preheat,active:true},
  {offset:-10,title:'Teigling schräg einschneiden',temp:null,minutes:2,active:true},
  {offset:0,title:'Einschießen und anfangs schwaden',temp:230,minutes:4,active:true},
  {offset:4,title:'Nachschneiden',temp:230,minutes:4,active:true},
  {offset:8,title:'Dampf ablassen, auf 210 °C senken',temp:210,minutes:20,active:true},
  {offset:28,title:'Bei Bedarf vor starker Oberhitze schützen',temp:210,minutes:20,active:true},
  {offset:48,title:'Kerntemperatur prüfen: Richtwert 97 °C',temp:null,minutes:2,active:true},
  {offset:50,title:'Mindestens eine Stunde auskühlen lassen',temp:null,minutes:60,active:false}
 ];
 return events.map(e=>({...e,at:base+e.offset*60000,source:'PDF S. 24',warning:'Nur PDF-Standardprogramm für passendes Brot; Spezialrezepte anders backen.'}));
}
export const PDF_LESSONS=[
 {id:'kneten',name:'Kneten & Fenstertest',pages:'13',intro:'Weizen-/Dinkelteig: Fenstertest prüfen, Teig darf dünn gezogen werden ohne sofort zu reißen.',steps:['Mehl und Wasser mischen, wenn das Rezept Autolyse vorsieht.','Reifen Starter und Salz zugeben, nach Rezept kneten.','Probe sanft dünn ausziehen: elastische Struktur prüfen.','Überknetung erkennen: Teig wird schmierig und verliert Spannung.']},
 {id:'falten',name:'Stretch & Fold / Coil Fold',pages:'14–15',intro:'Bei geeigneten Weizenteigen beginnt der Aufbau häufig mit Stretch & Fold, später mit Coil Fold. Für Roggen anders vorgehen.',steps:['Nach dem Mischen die erste Ruhephase einhalten.','An vier Seiten behutsam dehnen und über die Mitte legen.','Später Teig von unten anheben, damit er sich selbst faltet.','Wenn Spannung sichtbar aufgebaut ist, weitere Eingriffe reduzieren.']},
 {id:'formen',name:'Formen & Reifezeichen',pages:'18–19',intro:'Teig möglichst wenig entgasen, Außenhaut spannen und Fingertest während der Stückgare nutzen.',steps:['Teig vorsichtig aus der Schüssel lösen.','Nach Rezept rund oder lang formen und Spannung aufbauen.','Teig abdecken; Austrocknung verhindern.','Fingertest: langsames Zurückfedern mit kleiner verbleibender Delle ist ein Hinweis, keine Garantie.']},
 {id:'korb',name:'Gärkörbchen & Naht',pages:'22–23',intro:'Körbchengröße nach Rohteigmasse und Form wählen. Die PDF nennt rund 70–80 % Korbfüllung.',steps:['Rundes oder ovales Körbchen wählen.','Bei normalem Ausbund die Naht im Korb nach oben legen.','Für rustikale Risse Naht nach unten und ggf. ohne Schnitt backen.','Körbchen schützen und Teig stets bedeckt lassen.']},
 {id:'ofen',name:'Ofenphasen & Dampf',pages:'24',intro:'Die PDF beschreibt ein mehrstufiges Standardprogramm für Brot – nicht für Pizza, Bagels oder Airfryer.',steps:['60 Minuten auf 250 °C vorheizen, sofern Ofen und Rezept dazu passen.','Mit 230 °C einschießen und geeignet schwaden.','Nach 4 Minuten nachschneiden; nach weiteren 4 Minuten Dampf ablassen und auf 210 °C senken.','Nach 20 Minuten vor Oberhitze schützen und weitere 20 Minuten backen; Kerntemperatur prüfen.']},
 {id:'quell',name:'Quellstück / Brühstück / Altbrot',pages:'28–30',intro:'Sämtliches Quellwasser gehört in die Gesamtwasserbilanz, sonst steigt die Hydration unbemerkt.',steps:['Saaten oder Schrote auswählen und den PDF-Aufnahmefaktor prüfen.','Altbrot: 5 % vom Mehl, PDF-Haupttext 3× Wasser; zweite Tabelle nennt 2×.','Brühstück: 5–20 % Mehl, Wasser 100–200 %, methodisch sorgfältig behandeln.','Das verwendete Quellwasser von der Hauptteig-Wassermenge abziehen.']},
 {id:'starter',name:'Anstellgut pflegen',pages:'9–12',intro:'Fütterungsmenge und tatsächliche alte Hydration dokumentieren, um die neue Hydration korrekt zu berechnen.',steps:['Alten Starter auswiegen, Frische und Geruch kontrollieren.','Mehl und Wasser nach ausgewähltem Verhältnis zugeben.','Temperatur messen und Reife beobachten, nicht allein den Zeitwert verwenden.','Peak protokollieren, damit eigene Messwerte die Prognose verbessern.']}
];
