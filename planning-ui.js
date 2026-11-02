const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
export function planningView(r,esc,now,flourTable=[]){
 if(!r)return '<section class="card">Bitte zuerst ein Rezept auswählen.</section>';
 const date=new Date(now.getTime()+2*86400000),pad=n=>String(n).padStart(2,'0'),local=date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes());
 const field=(label,id,value,opts='')=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" '+opts+' value="'+esc(value)+'">';
 const flour=r.flours.reduce((a,f)=>a+f.grams,0),total=flour+r.water+r.salt+r.starter.grams+(r.extras||[]).reduce((a,x)=>a+x.grams,0);
 return '<section class="card"><h2>'+esc(r.title)+'</h2><p class="muted">Du kannst die vorgeschlagenen Mengen und Zeiten anpassen.</p><details open><summary>1. Gebäck und Menge</summary>'+
 field('Name deines Backtags','bakeName',r.title,'maxlength="120"')+
 field('Anzahl fertige Brote','loaves',1,'type="number" min="1" max="24"')+
 field('Mehlmenge je Brot (g)','flourPerLoaf',Math.round(flour),'type="number" min="50" max="10000"')+field('Gewünschtes fertiges Brotgewicht je Brot (g, optional)','finishedWeight','','type="number" min="100" max="10000"')+field('Angenommener Backverlust (%)','bakeLoss',12,'type="number" min="0" max="30" step="0.5"')+
 '<p class="muted small">Das fertige Brot wiegt nach dem Backen weniger als der rohe Teig. Die genaue Differenz hängt vom Rezept ab.</p></details>'+
 '<details open><summary>2. Mehl und Zutaten</summary>'+
 r.flours.map((f,i)=>'<label>Mehl aus der Tabelle (optional)</label><select id="flourPreset'+i+'"><option value="">Manuell eingeben</option>'+flourTable.map(row=>'<option value="'+esc(row.name)+'" '+(row.name===f.name?'selected':'')+'>'+esc(row.name)+'</option>').join('')+'</select><div class="cols"><div>'+field('Mehl '+(i+1),'flourName'+i,f.name,'maxlength="90"')+'</div><div>'+field('Gramm','flourAmount'+i,f.grams,'type="number" min="0" max="20000"')+'</div></div>').join('')+
 field('Wasser (g)','waterAmount',r.water,'type="number" min="0" max="30000"')+
 field('Salz (g)','saltAmount',r.salt,'type="number" min="0" max="1000"')+
 '<div id="doughPreview" class="success">Rezeptmenge: '+Math.round(total)+' g Teig</div></details>'+
 '<details><summary>3. Starter und Fütterung</summary>'+
 field('Reifer Starter (g)','starterAmount',r.starter.grams,'type="number" min="0" max="10000"')+
 '<label>Starter oder Anstellgut</label><select id="starterType"><option '+(r.starter.type==='Weizen'?'selected':'')+'>Weizen</option><option '+(r.starter.type==='Roggen'?'selected':'')+'>Roggen</option><option>Dinkel</option></select>'+
 field('Hydration des Starters (%)','starterHydration',100,'type="number" min="20" max="250"')+
 '<label>Fütterungsverhältnis</label><select id="feedRatio"><option>1:2:2</option><option>1:1:1</option><option>1:3:3</option><option>1:5:5</option></select>'+
 '<label><input id="starterReady" type="checkbox" style="width:auto"> Starter ist bereits reif</label>'+
 field('Starter-Reifezeit in Stunden (optional)','starterHours','','type="number" min="1" max="72" step="0.5" placeholder="Persönliche Erfahrung"')+
 '</details><details><summary>4. Temperaturen</summary>'+
 field('Raumtemperatur (°C)','roomTemp',22,'type="number" min="5" max="40" step="0.5"')+
 field('Mehltemperatur (°C)','flourTemp',22,'type="number" min="5" max="40" step="0.5"')+
 field('Startertemperatur (°C, optional)','starterTemp','','type="number" min="5" max="40" step="0.5"')+
 field('Gewünschte Teigtemperatur (°C)','targetTemp',24,'type="number" min="15" max="35" step="0.5"')+'<div id="waterSuggestion" class="muted small"></div>'+
 field('Kühlschranktemperatur (°C, optional)','fridgeTemp','','type="number" min="0" max="15" step="0.5"')+
 '</details><details><summary>5. Gare und Equipment</summary>'+
 '<label>Gare</label><select id="proofMode"><option value="auto">Passende Gare automatisch wählen</option><option value="warm">Stückgare</option><option value="cold" '+(!r.cold?'disabled':'')+'>Kühlschrankgare'+(!r.cold?' (für dieses Rezept nicht hinterlegt)':'')+'</option></select>'+
 field('Stockgare (Stunden)','stockHours',((r.stock[0]+r.stock[1])/2),'type="number" min="0.5" max="48" step="0.25"')+
 field('Stückgare (Stunden)','proofHours',((r.proof[0]+r.proof[1])/2),'type="number" min="0.25" max="48" step="0.25"')+
 field('Faltabstand (Minuten)','foldInterval',40,'type="number" min="10" max="240"')+
 field('Anzahl Faltvorgänge','foldCount',r.starter.type==='Weizen'?2:0,'type="number" min="0" max="8"')+
 field('Vorheizen (Minuten)','preheat',45,'type="number" min="15" max="120"')+
 '<label>Backgerät</label><select id="equipment"><option>Backblech</option><option>Backstein</option><option>Gusseisentopf</option><option>Backform</option></select>'+
 '<label>Ofenladungen</label><input id="ovenLoads" type="number" min="1" max="12" value="1"></details><details><summary>Altbrot und Quellstück</summary>'+field('Altbrot (g, optional)','altbrot',0,'type="number" min="0" max="1000"')+'<label>Quellwasser für Altbrot</label><select id="altbrotRatio"><option value="3">3 × Altbrot (Standard)</option><option value="2">2 × Altbrot (Einlagen-Tabelle)</option></select>'+field('Zusätzliches Quellstück (g)','soakerAmount',0,'type="number" min="0" max="5000"')+field('Zusätzliches Quellwasser (g)','soakerWater',0,'type="number" min="0" max="5000"')+field('Quellzeit (Stunden)','soakerHours',12,'type="number" min="0.25" max="48" step="0.25"')+'</details><details open><summary>6. Dein Zeitplan</summary>'+
 field('Fertig am','finish',local,'type="datetime-local"')+
 '<div class="cols"><div>'+field('Schlafen ab','sleepFrom','22:00','type="time"')+'</div><div>'+field('Aufstehen um','sleepTo','07:00','type="time"')+'</div></div>'+
 field('Frühestens beginnen ab (optional)','earliestStart','','type="datetime-local"')+
 '<details><summary>Abwesenheit berücksichtigen</summary>'+field('Abwesend von','awayFrom','','type="datetime-local"')+field('Bis','awayTo','','type="datetime-local"')+'</details>'+
 '</details><button class="primary" data-act="calculate">Meinen Backplan erstellen</button><div id="planResult"></div></section>';
}
export function readPlanningForm(r,get){
 const val=id=>get(id)?.value??'',n=id=>num(val(id),NaN),optional=id=>val(id)===''?null:n(id);
 const loaves=n('loaves'),per=n('flourPerLoaf');
 if(!Number.isInteger(loaves)||loaves<1||loaves>24||!Number.isFinite(per)||per<50)throw Error('Bitte eine gültige Brotanzahl und Mehlmenge angeben');
 const flours=r.flours.map((f,i)=>({name:val('flourName'+i).trim(),grams:n('flourAmount'+i)}));
 if(flours.some(x=>!x.name||x.grams<0||!Number.isFinite(x.grams))||!flours.some(x=>x.grams>0))throw Error('Bitte die Mehlmengen prüfen');
 const original=flours.reduce((a,f)=>a+f.grams,0),targetWeight=optional('finishedWeight'),loss=n('bakeLoss'),rawTotal=original+n('waterAmount')+n('saltAmount')+n('starterAmount')+(r.extras||[]).reduce((a,x)=>a+x.grams,0);if(loss<0||loss>30)throw Error('Bitte einen Backverlust zwischen 0 und 30 % wählen');const factor=targetWeight&&targetWeight>0?targetWeight*loaves/(1-loss/100)/rawTotal:per*loaves/original;
 const altbrot=n('altbrot'),soakerAmount=n('soakerAmount'),soakerWater=n('soakerWater');if([altbrot,soakerAmount,soakerWater].some(x=>!Number.isFinite(x)||x<0))throw Error('Bitte Quellstückmengen prüfen');const ingredients={...r,flours:flours.map(f=>({...f,grams:Math.round(f.grams*factor*10)/10})),water:Math.round(n('waterAmount')*factor*10)/10,salt:Math.round(n('saltAmount')*factor*10)/10,starter:{...r.starter,type:val('starterType'),grams:Math.round(n('starterAmount')*factor*10)/10},extras:[...(r.extras||[]).map(x=>({...x,grams:Math.round(x.grams*factor*10)/10})),...(altbrot?[{name:'Altbrot',grams:altbrot},{name:'Altbrot-Quellwasser',grams:altbrot*n('altbrotRatio')}]:[]),...(soakerAmount?[{name:'Quellstück',grams:soakerAmount},{name:'Quellwasser',grams:soakerWater}]:[])],altbrot:altbrot?{grams:altbrot,hours:12}:null,soaker:soakerAmount?{hours:n('soakerHours')}:r.soaker,stock:[n('stockHours'),n('stockHours')],proof:[n('proofHours'),n('proofHours')]};
 if([ingredients.water,ingredients.salt,ingredients.starter.grams].some(x=>!Number.isFinite(x)||x<0))throw Error('Bitte die Zutatenmengen prüfen');
 const finish=new Date(val('finish'));if(!Number.isFinite(+finish))throw Error('Bitte ein gültiges Datum eingeben');
 const awayFrom=val('awayFrom')?new Date(val('awayFrom')):null,awayTo=val('awayTo')?new Date(val('awayTo')):null;
 if(Boolean(awayFrom)!==Boolean(awayTo)||awayFrom&&awayTo<=awayFrom)throw Error('Bitte Abwesenheit vollständig und korrekt angeben');
 const ovenLoads=n('ovenLoads');if(!Number.isInteger(ovenLoads)||ovenLoads<1||ovenLoads>12)throw Error('Bitte die Ofenladungen prüfen');const options={ovenLoads,mode:val('proofMode'),starterHours:optional('starterHours'),foldInterval:n('foldInterval'),foldCount:n('foldCount'),earliestStart:val('earliestStart')?new Date(val('earliestStart')):null};
 const room=n('roomTemp'),flour=n('flourTemp'),target=n('targetTemp'),starterTemp=optional('starterTemp'),fridge=optional('fridgeTemp');
 if([room,flour,target].some(x=>x<5||x>40||!Number.isFinite(x)))throw Error('Bitte Temperaturen prüfen');
 return {recipe:ingredients,finish,loaves,estimatedFinishedWeight:targetWeight||null,bakeLoss:loss,starterHydration:n('starterHydration'),options,preheat:n('preheat'),from:val('sleepFrom'),to:val('sleepTo'),awayFrom,awayTo,ready:Boolean(get('starterReady')?.checked),temperatures:{room,flour,target,starterTemp,fridge},name:val('bakeName').trim()||r.title};
}
