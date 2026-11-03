export function starterForecast(logs,ratio,temp){
 const values=(logs||[]).filter(x=>x.ratio===ratio&&Math.abs(Number(x.temperature)-temp)<=2&&Number(x.peakHours)>0).map(x=>Number(x.peakHours)).sort((a,b)=>a-b);
 if(values.length<3)return null;
 const mid=Math.floor(values.length/2);return {hours:values.length%2?values[mid]:(values[mid-1]+values[mid])/2,count:values.length};
}

const safeRows=items=>Array.isArray(items)?items:[];
const textValue=(x,esc)=>esc(String(x??''));
export function personalStartersPreview(items,esc=x=>String(x)){
 const list=safeRows(items);
 return '<section class="personal-starters"><div class="personal-starters-head"><span><span class="studio-overline">PERSÖNLICHER BEREICH</span><h2>Meine Starter</h2></span><button data-act="starters">Alle anzeigen →</button></div>'+
 (list.length?'<div class="personal-starters-preview">'+list.slice(0,3).map(st=>'<button data-act="starters" class="personal-starter-preview"><img src="/design/tile-import.png" alt="" loading="lazy"><span><strong>'+textValue(st.name||'Starter',esc)+'</strong><small>'+textValue(st.type||'Weizen',esc)+' · '+textValue(st.hydration??100,esc)+' % Hydration · '+textValue(st.ratio||'1:2:2',esc)+'</small></span><span aria-hidden="true">›</span></button>').join('')+'</div>':
 '<p>Du hast noch keinen eigenen Starter angelegt.</p>')+
 '<button class="personal-starters-open" data-act="starters">'+(list.length?'Starter verwalten':'Ersten Starter anlegen')+'</button></section>';
}

export function starterListView(items,esc=x=>String(x)){
 const list=safeRows(items);
 if(!list.length)return '<p class="muted">Noch keine Starter gespeichert. Lege deinen ersten Starter unten an.</p>';
 return '<div class="starter-collection">'+list.map((x,i)=>{
 const logs=Array.isArray(x.logs)?x.logs:[],last=logs.at(-1),forecast=last?starterForecast(logs,last.ratio||x.ratio||'1:2:2',Number(last.temperature||22)):null;
 const name=textValue(x.name||'Starter',esc),type=textValue(x.type||'Weizen',esc),flour=x.flourName?textValue(x.flourName,esc):'Mehltyp nicht hinterlegt';
 const select=(id,values,chosen)=>'<select id="'+id+'">'+values.map(v=>'<option '+(v===chosen?'selected':'')+'>'+v+'</option>').join('')+'</select>';
 return '<article class="starter-profile"><div class="starter-profile-top"><img src="/design/tile-import.png" alt="" loading="lazy"><div><h3>'+name+' ('+type+')</h3><p>'+flour+' · '+textValue(x.hydration??100,esc)+' % Hydration · '+textValue(x.ratio||'1:2:2',esc)+'</p><small>'+logs.length+' Fütterungen protokolliert</small></div></div>'+
 '<div class="starter-profile-forecast"><strong>'+(forecast?'Persönliche Reifeprognose: '+forecast.hours+' h':'Reifeprognose aus eigenen Messungen noch offen')+'</strong><small>'+(forecast?'Aus '+forecast.count+' vergleichbaren Messungen':'Mindestens drei vergleichbare Messungen nötig; der Reifezustand geht vor')+'</small></div>'+
 '<details class="starter-profile-details"><summary>Fütterung berechnen und protokollieren</summary><button data-act="feed:'+i+'">Fütterungsmenge berechnen</button>'+
 '<label for="starterLogRatio'+i+'">Fütterungsverhältnis</label>'+select('starterLogRatio'+i,['1:1:1','1:2:2','1:3:3','1:5:5'],x.ratio||'1:2:2')+
 '<label for="starterLogTemp'+i+'">Temperatur (°C)</label><input type="number" id="starterLogTemp'+i+'" min="5" max="40" value="22" step="0.5">'+
 '<label for="starterLogHours'+i+'">Stunden bis zum Peak</label><input type="number" id="starterLogHours'+i+'" min="0.5" max="72" step="0.25" placeholder="Gemessenen Wert eingeben">'+
 '<button data-act="starterRecord:'+i+'">Messung speichern</button>'+
 (logs.length?'<h4>Letzte Fütterungen</h4>'+logs.slice(-5).reverse().map(l=>'<div class="starter-log-row">'+textValue(l.date,esc)+' · '+textValue(l.ratio,esc)+(Number(l.peakHours)>0?' · Peak nach '+textValue(l.peakHours,esc)+' h':' · Fütterung dokumentiert')+(l.hydration?' · '+textValue(l.hydration,esc)+' % Hydration':'')+'</div>').join(''):'<p class="muted small">Noch keine Fütterung protokolliert.</p>')+'</details>'+
 '<details class="starter-profile-details"><summary>Starter bearbeiten</summary>'+
 '<label for="starterEditName'+i+'">Name</label><input id="starterEditName'+i+'" value="'+name+'" maxlength="90">'+
 '<label for="starterEditType'+i+'">Starterart</label>'+select('starterEditType'+i,['Weizen','Roggen','Dinkel'],x.type||'Weizen')+
 '<label for="starterEditFlour'+i+'">Verwendetes Mehl (optional)</label><input id="starterEditFlour'+i+'" maxlength="90" value="'+textValue(x.flourName||'',esc)+'" placeholder="z. B. Weizenmehl Type 550">'+
 '<label for="starterEditHydration'+i+'">Hydration (%)</label><input id="starterEditHydration'+i+'" type="number" min="20" max="250" value="'+textValue(x.hydration??100,esc)+'">'+
 '<button data-act="starterUpdate:'+i+'">Änderungen speichern</button><button class="starter-delete" data-act="starterDelete:'+i+'">Starter löschen</button></details></article>';
 }).join('')+'</div>';
}
