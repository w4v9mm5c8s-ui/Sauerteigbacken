export function starterForecast(logs,ratio,temp){
 const values=(logs||[]).filter(x=>x.ratio===ratio&&Math.abs(Number(x.temperature)-temp)<=2&&Number(x.peakHours)>0).map(x=>Number(x.peakHours)).sort((a,b)=>a-b);
 if(values.length<3)return null;
 const mid=Math.floor(values.length/2);return {hours:values.length%2?values[mid]:(values[mid-1]+values[mid])/2,count:values.length};
}
export function starterListView(items,esc){
 if(!items.length)return '<p class="muted">Noch keine Starter gespeichert.</p>';
 return items.map((x,i)=>{
 const logs=x.logs||[],last=logs.at(-1),forecast=last?starterForecast(logs,last.ratio||x.ratio||'1:2:2',Number(last.temperature||22)):null;
 return '<details class="starter-entry"><summary>'+esc(x.name)+' · '+esc(x.type||'Weizen')+'</summary><p>Fütterung '+esc(x.ratio||'1:2:2')+'</p><p class="muted">'+(forecast?'Persönliche Reifeprognose: ca. '+forecast.hours+' Stunden aus '+forecast.count+' vergleichbaren Beobachtungen.':'Für eine persönliche Reifeprognose sind mindestens drei vergleichbare Messungen nötig.')+'</p><button data-act="feed:'+i+'">Fütterung berechnen</button><label>Fütterungsverhältnis</label><select id="starterLogRatio'+i+'">'+['1:1:1','1:2:2','1:3:3','1:5:5'].map(r=>'<option '+(r===(x.ratio||'1:2:2')?'selected':'')+'>'+r+'</option>').join('')+'</select><label>Temperatur (°C)</label><input type="number" id="starterLogTemp'+i+'" min="5" max="40" value="22" step="0.5"><label>Stunden bis zum Peak</label><input type="number" id="starterLogHours'+i+'" min="0.5" max="72" step="0.25"><button data-act="starterRecord:'+i+'">Messung speichern</button><h3>Letzte Messungen</h3>'+logs.slice(-5).reverse().map(l=>'<div class="line">'+esc(l.date)+' · '+esc(l.temperature)+' °C · '+esc(l.ratio)+' · '+esc(l.peakHours)+' h</div>').join('')+'</details>';
 }).join('');
}
