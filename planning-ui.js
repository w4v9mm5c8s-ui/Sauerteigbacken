import {canonicalFlourName} from './flour-table.js';
import {doughWeight,isDoughIngredient} from './dough-weight.js';
import {waterBalance,PDF_SOAKER_RATIOS,checkBanneton} from './pdf-baking.js';
export function planFlourRow(f,i,table=[],esc=x=>String(x)){
 const flourName=canonicalFlourName(f.name);const options='<option value="">Manuell eingeben</option>'+table.map(row=>'<option value="'+esc(row.name)+'" '+(row.name===flourName?'selected':'')+'>'+esc(row.name)+'</option>').join('');
 return '<div class="plan-flour-row" data-plan-flour-row><label for="flourPreset'+i+'">Mehl aus der Tabelle</label><select class="plan-flour-preset" id="flourPreset'+i+'">'+options+'</select><div class="cols"><div><label for="flourName'+i+'">Mehlsorte</label><input class="plan-flour-name" id="flourName'+i+'" maxlength="90" value="'+esc(flourName)+'"></div><div><label for="flourAmount'+i+'">Menge (g)</label><input class="plan-flour-grams" id="flourAmount'+i+'" type="number" min="0" max="20000" step="0.1" value="'+esc(f.grams??0)+'"></div></div><button type="button" class="plan-flour-remove" data-act="planFlourRemove">Mehl entfernen</button></div>';
}
const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
export function planningView(r,esc,now,flourTable=[],starters=[]){
 if(!r)return '<section class="card">Bitte zuerst ein Rezept auswählen.</section>';
 const date=new Date(now.getTime()+2*86400000),pad=n=>String(n).padStart(2,'0'),local=date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes());
 const field=(label,id,value,opts='')=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" '+opts+' value="'+esc(value??'')+'">';
 const mean=values=>values?.[0]==null?'':(values[0]+values[1])/2;
 const flour=r.flours.reduce((a,f)=>a+f.grams,0),total=doughWeight(r);
 return '<section class="card"><h2>'+esc(r.title)+'</h2>'+(r.sourceNote?'<p>'+esc(r.sourceNote)+'</p>':'')+'<p class="muted">Du kannst die vorgeschlagenen Mengen und Zeiten anpassen.</p><details open><summary>1. Gebäck und Menge</summary>'+
 field('Name deines Backtags','bakeName',r.title,'maxlength="120"')+
 field('Anzahl fertige Brote','loaves',1,'type="number" min="1" max="24"')+
 field('Mehlmenge je Brot (g)','flourPerLoaf',Math.round(flour),'type="number" min="50" max="10000"')+field('Gewünschtes fertiges Brotgewicht je Brot (g, optional)','finishedWeight','','type="number" min="100" max="10000"')+field('Angenommener Backverlust (%)','bakeLoss',12,'type="number" min="0" max="30" step="0.5"')+
 '<p class="muted small">Das fertige Brot wiegt nach dem Backen weniger als der rohe Teig. Die genaue Differenz hängt vom Rezept ab.</p></details>'+
 '<details open><summary>2. Mehl und Zutaten</summary>'+
 '<div id="planFlours">'+r.flours.map((f,i)=>planFlourRow(f,i,flourTable,esc)).join('')+'</div>'+
 '<button type="button" class="plan-flour-add" data-act="planFlourAdd">+ Weiteres Mehl hinzufügen</button>'+
 '<label class="plan-ingredients-automatic"><input id="planAutoIngredients" type="checkbox" '+(r.source==='PDF'?'':'checked')+'> Bei Änderungen der Mehle Wasser, Starter und Salz nach Mehltabelle berechnen</label>'+
 
 field('Gesamtes Rezeptwasser inklusive Quell- und Brühwasser (g)','waterAmount',r.water,'type="number" min="0" max="30000"')+
 field('Salz (g)','saltAmount',r.salt,'type="number" min="0" max="1000"')+
 '<div id="doughPreview" class="success">Rezeptmenge: '+Math.round(total)+' g Teig</div></details>'+
 '<details><summary>3. Starter und Fütterung</summary>'+
 field('Reifer Starter (g)','starterAmount',r.starter.grams,'type="number" min="0" max="10000"')+
 (starters.length?'<label for="starterProfile">Gespeicherten Starter aus „Ich“ auswählen</label><select id="starterProfile"><option value="">Ohne gespeicherten Starter</option>'+starters.map((st,i)=>'<option value="'+i+'">'+esc(st.name||'Starter')+' ('+esc(st.type||'Weizen')+')</option>').join('')+'</select>':'')+
 '<label>Starter oder Anstellgut</label><select id="starterType"><option '+(r.starter.type==='Weizen'?'selected':'')+'>Weizen</option><option '+(r.starter.type==='Roggen'?'selected':'')+'>Roggen</option><option>Dinkel</option></select>'+
 field('Hydration des Starters (%)','starterHydration',r.source==='PDF'?(r.starter.hydration??''):(r.starter.hydration||100),'type="number" min="20" max="250"')+
 '<label>Fütterungsverhältnis</label><select id="feedRatio"><option>1:2:2</option><option>1:1:1</option><option>1:3:3</option><option>1:5:5</option></select>'+
 '<label><input id="starterReady" type="checkbox" style="width:auto"> Starter ist bereits reif</label>'+
 field('Starter-Reifezeit in Stunden (optional)','starterHours','','type="number" min="1" max="72" step="0.5" placeholder="Aus PDF-Tabelle oder persönliche Erfahrung"')+'<div id="pdfStarterPeakHint" class="muted small"></div>'+
 '</details><details><summary>4. Temperaturen</summary>'+
 field('Raumtemperatur (°C)','roomTemp',22,'type="number" min="5" max="40" step="0.5"')+
 field('Mehltemperatur (°C)','flourTemp',22,'type="number" min="5" max="40" step="0.5"')+
 field('Startertemperatur (°C, optional)','starterTemp','','type="number" min="5" max="40" step="0.5"')+
 field('Gewünschte Teigtemperatur (°C)','targetTemp',24,'type="number" min="15" max="35" step="0.5"')+'<div id="waterSuggestion" class="muted small"></div>'+
 field('Kühlschranktemperatur (°C, optional)','fridgeTemp','','type="number" min="0" max="15" step="0.5"')+
 '</details><details><summary>5. Gare und Equipment</summary>'+
 '<label>Gare</label><select id="proofMode"><option value="auto">Passende Gare automatisch wählen</option><option value="warm">Stückgare</option><option value="cold" '+(!r.cold?'disabled':'')+'>Kühlschrankgare'+(!r.cold?' (für dieses Rezept nicht hinterlegt)':'')+'</option></select>'+
 (r.saltNote?'<p>'+esc(r.saltNote)+'</p>':'')+(r.liquidNote?'<p>'+esc(r.liquidNote)+'</p>':'')+
 (r.requiresColdBulk?field('Kalte Stockgare über Nacht (Stunden; eigene Angabe)','coldBulkHours','','type="number" min="1" max="48"'): '')+
 (r.soaker?field('Quellzeit des Rezept-Quellstücks (Stunden)','recipeSoakerHours',r.soaker.hours,'type="number" min="0.25" max="48" step="0.25"'):'')+
 (!r.bake.length?field('Backtemperatur (°C; eigene Angabe)','recipeBakeTemp','','type="number" min="80" max="300"')+field('Backdauer (Minuten; eigene Angabe)','recipeBakeMinutes','','type="number" min="5" max="240"'):'')+
 field('Stockgare (Stunden)','stockHours',mean(r.stock),'type="number" min="0.5" max="48" step="0.25"')+
 field('Stückgare (Stunden)','proofHours',mean(r.proof),'type="number" min="0.25" max="48" step="0.25"')+
 '<label class="pdf-reference-toggle"><input id="planAutoTimes" type="checkbox"> PDF-Referenzzeiten nach Mehl/Temperatur vorschlagen (nur Referenzbedingungen)</label><div class="muted small" id="pdfTimingReference" aria-live="polite">PDF-Zeitvergleich nach Eingabe der Temperaturen verfügbar.</div>'+
 field('Faltabstand (Minuten)','foldInterval',r.foldInterval||40,'type="number" min="10" max="240"')+
 field('Anzahl Faltvorgänge','foldCount',r.foldCount??(r.starter.type==='Weizen'?2:0),'type="number" min="0" max="8"')+
 field('Vorheizen (Minuten)','preheat',60,'type="number" min="15" max="120"')+
 '<label>Backgerät</label><select id="equipment"><option>Backblech</option><option>Backstein</option><option>Gusseisentopf</option><option>Backform</option><option'+(r.equipment==='Airfryer'?' selected':'')+'>Airfryer</option></select>'+
 '<label>Gärkörbchen</label><select id="basketShape"><option value="round">Rund</option><option value="oval">Oval</option><option value="none">Keines</option></select><div id="basketHint" class="muted small"></div>'+
 '<label class="pdf-reference-toggle"><input id="pdfBakeStandard" type="checkbox"> PDF-Standardbackprogramm 230/210 °C und 97 °C Kerntemperatur verwenden (nur geeignete Brote)</label>'+
 '<label>Ofenladungen</label><input id="ovenLoads" type="number" min="1" max="12" value="1"></details><details><summary>Altbrot und Quellstück</summary>'+field('Altbrot (g, optional)','altbrot',0,'type="number" min="0" max="1000"')+'<label>Quellwasser für Altbrot</label><select id="altbrotRatio"><option value="3">3 × Altbrot (Standard)</option><option value="2">2 × Altbrot (Einlagen-Tabelle)</option></select>'+'<label for="soakerKind">Saaten-/Schrotart für Quellstück</label><select id="soakerKind"><option value="">Keine Saat/kein Schrot</option>'+PDF_SOAKER_RATIOS.flatMap(group=>group.names.map(name=>'<option value="'+esc(name)+'">'+esc(name)+' ('+group.label+')</option>')).join('')+'</select>'+field('Zusätzliches Quellstück (g)','soakerAmount',0,'type="number" min="0" max="5000"')+field('Zusätzliches Quellwasser (g)','soakerWater',0,'type="number" min="0" max="5000"')+'<label class="pdf-reference-toggle"><input id="autoSoakerWater" type="checkbox" checked> Quellwasser automatisch nach PDF-Tabelle berechnen (50–200 %)</label>'+field('Quellzeit (Stunden)','soakerHours',12,'type="number" min="0.25" max="48" step="0.25"')+
 field('Mehl für Brühstück (g; Teil der Mehlmenge)','brewFlour',0,'type="number" min="0" max="5000"')+field('Wasser für Brühstück (g)','brewWater',0,'type="number" min="0" max="10000"')+
 field('Brühstück-Abkühlzeit (Minuten; Temperatur anschließend prüfen)','brewCoolMinutes',60,'type="number" min="30" max="1440"')+
 '<div id="pdfWaterCheck" class="muted small" aria-live="polite">Quellwasser wird vom Gesamtwasser abgezogen.</div>'+'</details><details open><summary>6. Dein Zeitplan</summary>'+
 field('Fertig am','finish',local,'type="datetime-local"')+
 '<div class="cols"><div>'+field('Schlafen ab','sleepFrom','22:00','type="time"')+'</div><div>'+field('Aufstehen um','sleepTo','07:00','type="time"')+'</div></div>'+
 field('Frühestens beginnen ab (optional)','earliestStart','','type="datetime-local"')+
 '<details><summary>Abwesenheiten berücksichtigen</summary>'+field('Abwesend von','awayFrom','','type="datetime-local"')+field('Bis','awayTo','','type="datetime-local"')+field('Weitere Abwesenheit von','awayFrom2','','type="datetime-local"')+field('Bis','awayTo2','','type="datetime-local"')+'<label>Regelmäßig nicht verfügbar (Wochentage)</label><div class="weekday-grid">'+['Mo','Di','Mi','Do','Fr','Sa','So'].map((day,i)=>'<label><input type="checkbox" id="recurringDay'+i+'" data-unavailable-day="'+i+'">'+day+'</label>').join('')+'</div>'+field('An diesen Tagen ab','recurringFrom','09:00','type="time"')+field('Bis','recurringTo','17:00','type="time"')+'</details>'+
 '</details><button class="primary" data-act="calculate">Meinen Backplan erstellen</button><div id="planResult"></div></section>';
}
export function readPlanningForm(r,get){
 const val=id=>get(id)?.value??'',n=id=>num(val(id),NaN),optional=id=>val(id)===''?null:n(id);
 const loaves=n('loaves'),per=n('flourPerLoaf');
 if(!Number.isInteger(loaves)||loaves<1||loaves>24||!Number.isFinite(per)||per<50)throw Error('Bitte eine gültige Brotanzahl und Mehlmenge angeben');
 const flourSection=get('planFlours');
 let flours=flourSection&&typeof flourSection.querySelectorAll==='function'?[...flourSection.querySelectorAll('[data-plan-flour-row]')].map(row=>({name:(row.querySelector('.plan-flour-name')?.value||'').trim(),grams:Number(row.querySelector('.plan-flour-grams')?.value)})):r.flours.map((f,i)=>({name:val('flourName'+i).trim(),grams:n('flourAmount'+i)}));
 flours=flours.map(x=>({...x,name:canonicalFlourName(x.name)}));
 if(flours.some(x=>!x.name||x.grams<0||!Number.isFinite(x.grams))||!flours.some(x=>x.grams>0))throw Error('Bitte die Mehlmengen prüfen');
 const original=flours.reduce((a,f)=>a+f.grams,0),targetWeight=optional('finishedWeight'),loss=n('bakeLoss');
 if(loss<0||loss>30)throw Error('Bitte einen Backverlust zwischen 0 und 30 % wählen');
 const altbrot=n('altbrot'),soakerAmount=n('soakerAmount'),soakerWater=n('soakerWater'),brewFlour=n('brewFlour'),brewWater=n('brewWater');
 if([altbrot,soakerAmount,soakerWater,brewFlour,brewWater].some(x=>!Number.isFinite(x)||x<0))throw Error('Bitte Quell-/Brühstückmengen prüfen.');
 const soakerKind=val('soakerKind');
 if(soakerAmount>0&&!soakerKind)throw Error('Bitte eine Quellstück-Art auswählen.');if(!soakerAmount&&soakerWater>0)throw Error('Quellwasser ohne Quellstück ist nicht möglich.');
 if(val('saltAmount')===''||val('starterHydration')==='')throw Error('Bitte Salzmenge und Starter-Hydration ergänzen.');
 if(!(n('stockHours')>0)||!(n('proofHours')>0))throw Error('Bitte Stock- und Stückgare aus deiner Erfahrung ergänzen.');
 if(r.requiresColdBulk&&!(n('coldBulkHours')>=1&&n('coldBulkHours')<=48))throw Error('Bitte Dauer der kalten Stockgare angeben.');
 if(r.soaker&&!(n('recipeSoakerHours')>0&&n('recipeSoakerHours')<=48))throw Error('Bitte Quellzeit angeben.');
 if(!r.bake.length&&!(n('recipeBakeTemp')>=80&&n('recipeBakeTemp')<=300&&n('recipeBakeMinutes')>=5&&n('recipeBakeMinutes')<=240))throw Error('Bitte Backtemperatur und Backdauer ergänzen.');
 const baseWater=n('waterAmount'),salt=n('saltAmount'),starter=n('starterAmount'),starterHydration=n('starterHydration');
 const inheritedSeeds=r.soaker?.items||[],inheritedMass=inheritedSeeds.reduce((sum,x)=>sum+x.grams,0),inheritedWater=inheritedMass?Number(r.soaker.water)||0:0;
 const balance=waterBalance({flours,totalWater:baseWater,starter,starterHydration,altbrot,altbrotRatio:n('altbrotRatio'),
  soakers:[...inheritedSeeds.map(x=>({...x,ratio:inheritedWater/inheritedMass})),...(soakerAmount?[{name:soakerKind,grams:soakerAmount,ratio:soakerWater/soakerAmount}]:[])],brewFlour,brewWater,extras:[...(r.extras||[]),{name:'Salz',grams:salt}]});
 const originalDoughExtras=(r.extras||[]).filter(isDoughIngredient).reduce((a,x)=>a+x.grams,0);
 const rawTotal=original+baseWater+salt+starter+originalDoughExtras+altbrot+soakerAmount+inheritedMass;
 const targetRaw=targetWeight&&targetWeight>0?targetWeight*loaves/(1-loss/100):null;
 if(targetRaw!==null&&targetRaw<=0)throw Error('Das Zielgewicht muss positiv sein.');
 const factor=targetRaw!==null?targetRaw/rawTotal:per*loaves/original;
 if(!Number.isFinite(factor)||factor<=0)throw Error('Die Zielmenge lässt sich nicht berechnen.');
 const ingredients={...r,coldBulkHours:r.requiresColdBulk?n('coldBulkHours'):null,bake:r.bake.length?r.bake:[{temp:n('recipeBakeTemp'),min:n('recipeBakeMinutes')}],flours:flours.map(f=>({...f,grams:Math.round(f.grams*factor*10)/10})),water:Math.round(balance.mainWater*factor*10)/10,salt:Math.round(n('saltAmount')*factor*10)/10,starter:{...r.starter,type:val('starterType'),hydration:starterHydration,grams:Math.round(n('starterAmount')*factor*10)/10},extras:[...(inheritedWater?[{name:'Rezept-Quellwasser',grams:inheritedWater*factor,role:'teig'}]:[]),...(r.extras||[]).map(x=>({...x,grams:Math.round(x.grams*factor*10)/10})), ...(altbrot?[{name:'Altbrot',grams:altbrot*factor,role:'teig'},{name:'Altbrot-Quellwasser',grams:balance.altbrotWater*factor,role:'teig'}]:[]), ...(soakerAmount?[{name:soakerKind,grams:soakerAmount*factor,role:'teig'},{name:'Quellwasser',grams:soakerWater*factor,role:'teig'}]:[]), ...(brewFlour?[{name:'Brühwasser',grams:brewWater*factor,role:'teig'}]:[])],altbrot:altbrot?{grams:altbrot*factor,water:balance.altbrotWater*factor,hours:12}:null,soaker:soakerAmount?{hours:n('soakerHours'),water:soakerWater*factor,grams:soakerAmount*factor,name:soakerKind}:r.soaker?{...r.soaker,hours:n('recipeSoakerHours'),water:inheritedWater*factor,items:inheritedSeeds.map(x=>({...x,grams:x.grams*factor}))}:null,additionalSoaker:soakerAmount&&r.soaker?{...r.soaker,hours:n('recipeSoakerHours'),water:inheritedWater*factor,items:inheritedSeeds.map(x=>({...x,grams:x.grams*factor}))}:null,brew:brewFlour?{flour:brewFlour*factor,water:brewWater*factor,coolMinutes:n('brewCoolMinutes')}:null,waterBalance:{...balance,...Object.fromEntries(['flourMass','totalRecipeWater','mainWater','soakerWater','altbrotWater','brewWater','starterWater','starterFlour','doughMass','reserve'].map(key=>[key,Math.round(balance[key]*factor*10)/10]))},stock:[n('stockHours'),n('stockHours')],proof:[n('proofHours'),n('proofHours')]};
 if(n('starterHydration')<20||n('starterHydration')>250)throw Error('Starter-Hydration muss zwischen 20 und 250 % liegen');if([ingredients.water,ingredients.salt,ingredients.starter.grams].some(x=>!Number.isFinite(x)||x<0))throw Error('Bitte die Zutatenmengen prüfen');
 const finish=new Date(val('finish'));if(!Number.isFinite(+finish))throw Error('Bitte ein gültiges Datum eingeben');
 const awayFrom=val('awayFrom')?new Date(val('awayFrom')):null,awayTo=val('awayTo')?new Date(val('awayTo')):null;
 if(Boolean(awayFrom)!==Boolean(awayTo)||awayFrom&&awayTo<=awayFrom)throw Error('Bitte Abwesenheit vollständig und korrekt angeben');
 const ovenLoads=n('ovenLoads');if(!Number.isInteger(ovenLoads)||ovenLoads<1||ovenLoads>12)throw Error('Bitte die Ofenladungen prüfen');const extraFrom=val('awayFrom2')?new Date(val('awayFrom2')):null,extraTo=val('awayTo2')?new Date(val('awayTo2')):null;if(Boolean(extraFrom)!==Boolean(extraTo)||extraFrom&&extraTo<=extraFrom)throw Error('Bitte die zweite Abwesenheit vollständig und korrekt angeben');const recurringDays=[0,1,2,3,4,5,6].filter(i=>get('recurringDay'+i)?.checked);const options={ovenLoads,mode:val('proofMode'),starterHours:optional('starterHours'),starterRatio:val('feedRatio'),roomTemp:n('roomTemp'),starterType:val('starterType'),stockMinutes:n('stockHours')*60,proofMinutes:n('proofHours')*60,fridgeTemp:optional('fridgeTemp'),pdfStandardBake:Boolean(get('pdfBakeStandard')?.checked),equipment:val('equipment'),foldInterval:n('foldInterval'),foldCount:n('foldCount'),earliestStart:val('earliestStart')?new Date(val('earliestStart')):null,absenceWindows:extraFrom?[{from:extraFrom,to:extraTo}]:[],recurringDays,recurringFrom:val('recurringFrom'),recurringTo:val('recurringTo')};
 const room=n('roomTemp'),flour=n('flourTemp'),target=n('targetTemp'),starterTemp=optional('starterTemp'),fridge=optional('fridgeTemp');
 if([room,flour,target].some(x=>x<5||x>40||!Number.isFinite(x)))throw Error('Bitte Temperaturen prüfen');
 const basketShape=val('basketShape');if(basketShape&&basketShape!=='none')ingredients.banneton=checkBanneton((rawTotal*factor)/loaves,basketShape);
 return {recipe:ingredients,finish,loaves,estimatedFinishedWeight:targetWeight||null,bakeLoss:loss,starterHydration:n('starterHydration'),options,preheat:n('preheat'),from:val('sleepFrom'),to:val('sleepTo'),awayFrom,awayTo,ready:Boolean(get('starterReady')?.checked),temperatures:{room,flour,target,starterTemp,fridge},name:val('bakeName').trim()||r.title};
}
