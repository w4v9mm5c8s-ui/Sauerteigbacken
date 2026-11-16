import {foldDefaults,potRecipe} from './beginner-baking.js';
import {placeActions} from './planning-conflicts.js';
import {estimateStarterPeak,standardBakePhases} from './pdf-baking.js';
const blocked=(d,from,to)=>{const h=d.getHours()*60+d.getMinutes(),a=from.split(':').map(Number),b=to.split(':').map(Number),x=a[0]*60+a[1],y=b[0]*60+b[1];return x>y?h>=x||h<y:h>=x&&h<y};
const withinClock=(d,from,to)=>{if(!/^\d{2}:\d{2}$/.test(from||'')||!/^\d{2}:\d{2}$/.test(to||''))return false;const [h,m]=from.split(':').map(Number),[h2,m2]=to.split(':').map(Number),now=d.getHours()*60+d.getMinutes(),start=h*60+m,end=h2*60+m2;return start<=end?now>=start&&now<end:now>=start||now<end};
export function unavailableAt(date,from,to,absenceStart,absenceEnd,options={}){if(blocked(date,from,to))return true;const time=+date;if(absenceStart&&absenceEnd&&time>=+absenceStart&&time<+absenceEnd)return true;for(const range of options.absenceWindows||[]){if(range.from&&range.to&&time>=+new Date(range.from)&&time<+new Date(range.to))return true}const weekday=(date.getDay()+6)%7;const days=options.recurringDays||[];const start=options.recurringFrom||'',end=options.recurringTo||'';
 if(start>end){
  const clock=date.getHours()*60+date.getMinutes();
  const minutes=value=>{const [h,m]=value.split(':').map(Number);return h*60+m};
  return days.includes(weekday)&&clock>=minutes(start)||days.includes((weekday+6)%7)&&clock<minutes(end);
 }
 if(days.includes(weekday)&&withinClock(date,start,end))return true;
 return false}
export function makePlan(r,want,from,to,ready,preheatMinutes=45,absenceStart=null,absenceEnd=null,options={}){
 const preheat=Math.max(15,Math.min(120,Number(preheatMinutes)||45));
 const pdfStandard=Boolean(options.pdfStandardBake),special=/Laugen|Pizza|Focaccia|Bagel|Zimt|Toast|Airfryer|Joghurt|Brezeln|Semmel|Brötchen|Prote(in)?brot/i.test(r.title||'');
 if(pdfStandard&&(special||options.equipment==='Airfryer'))throw Error('Das PDF-Standardbackprogramm gilt nicht für dieses Spezialrezept.');
 const stock=Number.isFinite(Number(options.stockMinutes))&&Number(options.stockMinutes)>0?Number(options.stockMinutes):(r.stock[0]+r.stock[1])*30;
 const warmProof=Number.isFinite(Number(options.proofMinutes))&&Number(options.proofMinutes)>0?Number(options.proofMinutes):(r.proof[0]+r.proof[1])*30;
 const loads=Math.max(1,Math.min(12,Number(options.ovenLoads)||1)),bake=pdfStandard?50*loads:r.bake.reduce((s,x)=>s+x.min,0)*loads,lye=/Laugen/.test(r.title);
 const technique={
  'starter-bagels':{title:'Bagels im Kochbad garen',minutes:12,detail:r.steps?.[4],shape:r.steps?.[2]},
  'starter-focaccia':{title:'Mulden drücken und Focaccia belegen',minutes:5,detail:r.steps?.[4],shape:r.steps?.[2]},
  'starter-pizza':{title:'Pizza ausziehen und belegen',minutes:10,detail:r.steps?.[5],shape:r.steps?.[2]},
  'starter-zimtschnecken':{shape:r.steps?.slice(2,5).join(' ')}
 }[r.id];
 const prepMinutes=lye?15:technique?.minutes||0;
 const coldProof=r.cold?.[0]>0?(r.cold[0]+r.cold[1])*30:null;
 const mode=options.mode||'auto';
 if(mode==='cold'&&!coldProof)throw Error('Für dieses Rezept ist keine Kühlschrankgare hinterlegt.');
 const warmMode={minutes:warmProof,cold:false},coldMode={minutes:coldProof,cold:true};
 const pizza=r.id==='starter-pizza';
 const modes=pizza&&coldProof?[coldMode]:mode==='warm'?[warmMode]:mode==='cold'?[coldMode]:coldProof?[warmMode,coldMode]:[warmMode];
 const peak=options.starterRatio&&Number.isFinite(Number(options.roomTemp))?estimateStarterPeak({ratio:options.starterRatio,temperature:Number(options.roomTemp),type:options.starterType||r.starter.type,observations:options.starterObservations||[]}):null;
 const starterHours=Number.isFinite(Number(options.starterHours))&&Number(options.starterHours)>0?Number(options.starterHours):peak?.hours??null;
 if(!ready&&starterHours===null)throw Error('Keine passende Starterprognose. Bitte eigene Reifezeit eingeben oder einen bereits reifen Starter verwenden.');
 const unverifiedPeak=!(Number.isFinite(Number(options.starterHours))&&Number(options.starterHours)>0)&&!peak?.valid;
 const folds=Number.isInteger(Number(options.foldCount))?Math.max(0,Math.min(8,Number(options.foldCount))):foldDefaults(r).count;
 const interval=Number.isFinite(Number(options.foldInterval))?Math.max(10,Math.min(240,Number(options.foldInterval))):foldDefaults(r).interval;
 for(const selected of modes){const {minutes:coldOrWarm,cold}=selected;
 const temper=pizza&&cold?warmProof:0,proof=coldOrWarm+temper;
 for(let shift=0;shift<21*1440;shift+=15){
 const finish=+want+shift*60000,oven=finish-bake*60000,shape=oven-(proof+20+prepMinutes)*60000,bulkStart=shape-stock*60000-(r.coldBulkHours||0)*3600000,mix=bulkStart-15*60000,auto=mix-(r.autolyse||0)*60000,feed=mix-starterHours*3600000;
 const actions=[...(!ready?[['Starter füttern',feed,10,'Starter nach deinem Fütterungsverhältnis füttern.'],['Starter prüfen',mix-10*60000,5,'Reifezeichen prüfen: Volumen, Bläschen und Peak.']]:[]),...(r.autolyse?[['Autolyse ansetzen',auto,10,r.autolyseDetail||'Mehl und Wasser mischen.']]:[]),['Teig mischen',mix,15,(r.mixDetail||'Zutaten nach Rezept mischen.')+(r.starter.type==='Roggen'?' Roggenteig nur homogen mischen; kein Fenstertest.':options.kneadMethod==='hand'?' PDF-Richtwert: von Hand 8–12 Minuten; Dehnbarkeit prüfen.':options.kneadMethod==='machine'?' PDF-Richtwert: Maschine 3–4 Minuten; Erwärmung und Fenstertest prüfen, nicht überkneten.':'')],['Stockgare prüfen',bulkStart+(stock-10)*60000,5,r.stockCheckDetail||'Teigentwicklung prüfen.'],['Formen',shape,20,r.shapeDetail||technique?.shape||'Teig nach Rezept formen.'],...(pdfStandard?[]:[['Ofen vorheizen',oven-preheat*60000,5,'Auf '+(r.preheatTemp||r.bake[0].temp)+' °C vorheizen.'+(options.equipment==='Pizzastein auf dem Backblech'?' Den Pizzastein auf dem Backblech nach Herstellerangabe mit vorheizen.':(r.potOptional||potRecipe(r))&&options.equipment==='Gusseisentopf'?' Den ofenfesten Topf samt Deckel mit vorheizen.':'')]]),...(cold?[['Kühlschrankgare beginnen',shape+20*60000,5,'Teig abgedeckt in den Kühlschrank stellen. Kühltemperatur und Reife beachten.']]:[['Stückgare prüfen',oven-(prepMinutes+10)*60000,5,r.proofCheckDetail||'Teigreife prüfen.']])];
 if(cold)actions.push(['Aus dem Kühlschrank nehmen',pizza?oven-(prepMinutes+temper)*60000:oven-30*60000,5,'Teigzustand prüfen. Ob direkt kalt gebacken wird, richtet sich nach dem Rezept.']);
 if(technique?.title)actions.push([technique.title,oven-prepMinutes*60000,prepMinutes,technique.detail+' Zeitfenster für die gesamte Vorbereitung: '+prepMinutes+' Min (Planwert).']);
 if(lye)actions.push(['Mit Bäckerlauge behandeln',oven-15*60000,15,'Nur lebensmitteltaugliche Bäckerlauge nach Herstelleranleitung verwenden. Schutzbrille und laugenfeste Handschuhe tragen.']);
 if(r.coldBulkHours)actions.push(['Kalte Stockgare beginnen',bulkStart+stock*60000,5,'Teig nach sichtbarem Aufgang abgedeckt in den Kühlschrank stellen.'+(options.fridgeTemp!=null?' Vorgabe: '+options.fridgeTemp+' °C.':'')],['Teig aus dem Kühlschrank nehmen',shape-5*60000,5,'Erst jetzt teilen und formen.']);
 const rests=[['Stockgare',bulkStart,stock],[cold?'Kühlschrankgare':'Stückgare',shape+20*60000,coldOrWarm]];
 if(temper)rests.push(['Pizzakugeln temperieren',oven-(prepMinutes+temper)*60000,temper]);
 if(r.coldBulkHours)rests.push(['Kalte Stockgare',bulkStart+stock*60000,r.coldBulkHours*60]);
 if(r.brew?.flour){const cool=Number(r.brew.coolMinutes);if(!Number.isFinite(cool)||cool<30)throw Error('Bitte mindestens 30 Minuten zum Abkühlen des Brühstücks einplanen und die Temperatur vor dem Mischen prüfen.');const at=mix-(cool+10)*60000;actions.push([r.brew.method==='cook'?'Kochstück ansetzen':'Brühstück ansetzen',at,10,r.brew.flour+' g Mehl mit '+r.brew.water+' g Wasser '+(r.brew.method==='cook'?'unter ständigem Rühren aufkochen, bis eine gebundene Masse entsteht.':'(kochend) übergießen und verrühren.')]);rests.push(['Brühstück abkühlen lassen',at+10*60000,cool]);actions.push(['Brühstücktemperatur prüfen',mix-5*60000,5,'Erst passend zur gewünschten Teigtemperatur abgekühlt verwenden.']);}
 for(const soaker of [r.soaker,r.additionalSoaker].filter(Boolean)){const at=mix-(soaker.hours*60+10)*60000;actions.push(['Quellstück ansetzen',at,10,(soaker.items?.length?soaker.items:[{grams:soaker.grams,name:soaker.name}]).map(x=>x.grams+' g '+x.name).join(', ')+' mit '+soaker.water+' g Quellwasser vermischen. '+(soaker.detail||'')]);rests.push(['Quellstück quellen lassen',at+10*60000,soaker.hours*60])}
 const scheduledFolds=Math.min(folds,Math.max(0,Math.ceil((stock-20)/interval)-1));
 for(let i=1;i<=scheduledFolds;i++)actions.push([i<=2?'Stretch & Fold ('+i+'/'+scheduledFolds+')':'Coil Fold ('+i+'/'+scheduledFolds+')',bulkStart+i*interval*60000,5,i<=2?'Teig behutsam anheben und über die Mitte legen.':'Teig von unten anheben und schonend zusammenfalten.']);
 if(r.altbrot?.grams){const alt=+mix-(r.altbrot.hours||12)*3600000-10*60000;actions.push(['Altbrot-Quellstück ansetzen',alt,10,'Altbrot mit dem gewählten Quellwasser vermischen.']);rests.push(['Altbrot quellen lassen',alt+10*60000,(r.altbrot.hours||12)*60])}
 let t=oven;for(let load=1;load<=loads;load++){
 if(pdfStandard){
  const phases=standardBakePhases({start:t,preheat});
  for(const p of phases){if(p.offset>=50||(load>1&&p.offset<0))continue;
   if(p.active)actions.push([(loads>1?'Ofenladung '+load+': ':'')+p.title,p.at,Math.min(2,p.minutes),p.temp?p.temp+' °C · Nach PDF S. 24.':p.source]);}
  rests.push(['Backen lassen',t+2*60000,46]);t+=50*60000;
 }else{
  for(const [phase,p] of r.bake.entries()){const method=r.potOptional||potRecipe(r);const guidance=options.equipment==='Pizzastein auf dem Backblech'?'Auf dem heißen Pizzastein offen backen.':method&&options.equipment==='Gusseisentopf'?(phase===0?'Laib in den vorgeheizten Topf setzen und mit Deckel backen.':'Deckel abnehmen und offen fertig backen.'):method&&options.equipment==='Backblech'?(phase===0?'Laib auf dem Backblech offen backen.':'Auf dem Blech weiterbacken und Bräunung prüfen.') : '';actions.push([loads>1?'Ofenladung '+load+' starten':'Backphase starten',t,2,p.temp+' °C für '+p.min+' Minuten. '+guidance+' '+(p.detail||'')+' '+(loads>1?'Spätere Teiglinge bis zum Einschießen kühl halten und Gare prüfen.':'')]);rests.push(['Backen lassen',t+2*60000,Math.max(1,p.min-2)]);t+=p.min*60000;}
 }
}
 actions.push(['Brot herausnehmen und Garzustand prüfen',finish,2,'Bräunung und rezeptgemäße Kerntemperatur prüfen; auf einem Gitter auskühlen lassen.']);
 rests.push(['Auskühlen lassen',finish+2*60000,r.coolMinutes||60]);
 const placed=placeActions(actions,options.occupied||[]);if(!placed)continue;
 if(placed.some(row=>{const a=[row.title,row.at,row.minutes];return (options.earliestStart&&a[1]<+options.earliestStart)||a[1]<Date.now()+60000||Array.from({length:a[2]},(_,i)=>unavailableAt(new Date(a[1]+i*60000),from,to,absenceStart,absenceEnd,options)).some(Boolean)}))continue;
 const steps=[...placed.map(a=>({...a,active:true})),...rests.map(a=>({title:a[0],at:a[1],minutes:a[2],detail:a[0]==='Stockgare'?'Geplantes Ende: '+new Date(a[1]+a[2]*60000).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' Uhr.'+(scheduledFolds?' Alle '+scheduledFolds+' Faltrunden liegen innerhalb dieser Gehzeit. Danach nur noch bis zur Teigreife ruhen lassen.':' Den Teig abgedeckt gehen lassen.') :a[0]==='Auskühlen lassen'?'Mindestens '+a[2]+' Minuten auf einem Gitter auskühlen lassen.':'Ruhezeit – Teigzustand beachten.',active:false}))].sort((a,b)=>a.at-b.at);
 return {finish,steps,shift,cold,assumptions:(ready?'Starter bereits reif':'Starterreife '+starterHours+' h ('+(peak?.source||'deine Eingabe')+')')+' · Stock-/Stückgare sind Richtwerte; Reifezeichen prüfen. Vorheizen '+preheat+' min.'};
 }}return null;
}
export function rescheduleRemaining(steps,index,delayMinutes,sleepFrom='22:00',sleepTo='07:00',options={}){
 if(!Number.isFinite(delayMinutes)||delayMinutes<0||delayMinutes>1440)throw Error('Bitte eine Verzögerung von 0 bis 1440 Minuten angeben');
 const delta=delayMinutes*60000;
 const proposed=steps.map((s,i)=>i>index&&!options.logs?.[i]?.completedAt?{...s,at:Number(s.at)+delta}:s);
 const changed=proposed.filter((s,i)=>s!==steps[i]&&s.active);
 if(changed.some(s=>Array.from({length:s.minutes||5},(_,i)=>unavailableAt(new Date(s.at+i*60000),sleepFrom,sleepTo,options.awayFrom?new Date(options.awayFrom):null,options.awayTo?new Date(options.awayTo):null,options)).some(Boolean)))throw Error('Die Verschiebung kollidiert mit Schlaf- oder Abwesenheitszeiten. Zeitfenster prüfen; die Gare wurde nicht verlängert.');
 if(changed.some(s=>(options.occupied||[]).some(o=>s.at<Number(o.at)+(o.minutes||5)*60000&&Number(o.at)<s.at+(s.minutes||5)*60000)))throw Error('Die Verschiebung kollidiert mit einem anderen Backtag.');
 return proposed;
}
function phaseBoundary(title=''){
 return ['Teig mischen','Formen','Kalte Stockgare beginnen','Kühlschrankgare beginnen','Teig aus dem Kühlschrank nehmen','Aus dem Kühlschrank nehmen','Backphase starten','Einschießen','Bagels im Kochbad garen','Mulden drücken und Focaccia belegen','Pizza ausziehen und belegen','Mit Bäckerlauge behandeln','Brot herausnehmen und Garzustand prüfen'].includes(title)||/^Ofenladung [0-9]+[: ]/.test(title);
}
// Only phase boundaries anchor a new schedule. Folds and checks do not restart fermentation.
export function adjustAfterCompletion(record,index,completedAt,occupied=[]){
 const step=record.steps[index];
 if(record.autoAdjust===false||record.logs?.[index]?.completedAt||!phaseBoundary(step?.title))return {steps:record.steps,delay:0};
 const delay=Math.floor((+new Date(completedAt)-(Number(step.at)+(step.minutes||0)*60000))/60000);
 if(!Number.isFinite(delay)||delay<2)return {steps:record.steps,delay:0};
 try{return {steps:rescheduleRemaining(record.steps,index,delay,record.sleepFrom||'22:00',record.sleepTo||'07:00',{...record.constraints,logs:record.logs,occupied}),delay}}
 catch(e){return {steps:record.steps,delay:0,warning:e.message}}
}
