import {canonicalFlourName} from './flour-table.js';
export const ingredientKey=name=>canonicalFlourName(String(name||'').trim()).toLocaleLowerCase('de-DE').replace(/\s+/g,' ');
export function recipeNeeds(recipe,scale=1){
 if(!recipe||!Number.isFinite(scale)||scale<=0)throw Error('Bitte ein Rezept wählen');
 const rows=[...(recipe.flours||[]),...(recipe.extras||[]),...(recipe.soaker?.items||[]),...(recipe.additionalSoaker?.items||[]),{name:'Salz',grams:recipe.salt}];
 const result=new Map();
 for(const row of rows){if(/wasser/i.test(row.name))continue;if(row.grams==null)throw Error('Menge für '+row.name+' bitte zuerst ergänzen');const grams=Number(row.grams)*scale;if(!Number.isFinite(grams)||grams<0)throw Error('Ungültige Menge für '+row.name);if(!grams)continue;const key=ingredientKey(row.name),old=result.get(key);if(old)old.grams+=grams;else result.set(key,{name:canonicalFlourName(row.name),grams});}
 return [...result.values()].map(x=>({...x,grams:Math.round(x.grams*10)/10}));
}
export function inventoryBalance(needs,pantry){
 const amounts=new Map();for(const row of pantry){const key=ingredientKey(row.name);amounts.set(key,(amounts.get(key)||0)+Math.max(0,Number(row.amount)||0));}
 return needs.map(row=>{const available=amounts.get(ingredientKey(row.name))||0;return {...row,available,missing:Math.max(0,Math.round((row.grams-available)*10)/10)}});
}
export function consumeInventory(needs,pantry){
 const balance=inventoryBalance(needs,pantry);if(balance.some(x=>x.missing>0))throw Error('Vorrat reicht noch nicht. Bitte Mengen ergänzen oder korrigieren.');
 const next=pantry.map(x=>({...x}));for(const row of needs){let remaining=row.grams;for(const item of next){if(ingredientKey(item.name)!==ingredientKey(row.name))continue;const used=Math.min(remaining,Number(item.amount)||0);item.amount=Math.round((item.amount-used)*10)/10;remaining-=used;if(remaining<=0)break;}}return next;
}
export function addMissingShopping(shopping,balance){const next=shopping.map(x=>({...x}));for(const row of balance.filter(x=>x.missing>0)){const existing=next.find(x=>!x.done&&ingredientKey(x.name)===ingredientKey(row.name));if(existing)existing.grams=Math.max(Number(existing.grams)||0,row.missing);else next.push({name:row.name,grams:row.missing,done:false});}return next;}
export function inventoryView(recipe,pantry,esc,scale=1){const balance=inventoryBalance(recipeNeeds(recipe,scale),pantry);return '<section class="card"><h2>Vorrat für '+esc(recipe.title||'deinen Backtag')+'</h2><p>Mehle, Salz, Saaten und weitere Zutaten. Wasser und reifen Starter separat bereitstellen. Verglichen werden gleiche Zutatenbezeichnungen.</p><div style="overflow:auto"><table><thead><tr><th>Zutat</th><th>Benötigt</th><th>Vorrat</th><th>Fehlt</th></tr></thead><tbody>'+balance.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+x.grams+' g</td><td>'+x.available+' g</td><td>'+x.missing+' g</td></tr>').join('')+'</tbody></table></div><button data-act="shoppingMissing">Fehlmengen auf die Einkaufsliste</button><button data-act="consumePantry">Für diesen Backtag verbrauchen</button><p>Verbrauch wird erst nach deiner Bestätigung abgezogen.</p></section>';}
export function chatView(messages,esc){const rows=(messages||[]).slice(-80);if(!rows.length)return '<p class="chat-empty">Noch keine Antwort. Stell dem KI Buddy eine Frage zum Backen.</p>';return rows.map(m=>'<div class="msg '+(m.role==='user'?'user':'assistant')+'"><strong>'+(m.role==='user'?'Du':'KI Buddy')+'</strong><p style="white-space:pre-wrap">'+esc(m.content)+'</p></div>').join('');}
export const conflictFields=['starters','ownRecipes','history','shopping','pantry','favorites','communitySaved','activeBake','parallelBakes','chatMessages','recipeProfiles','onboarded'];
function recordPairs(key,left,right){
 if(!Array.isArray(left)||!Array.isArray(right))return null;
 function index(rows){
  const map=new Map();
  for(const row of rows){
   const id=row?.id??row?.recipe?.id??(key==='history'?row?.finishedAt:null)??(['pantry','shopping','starters'].includes(key)?row?.name:null)??(['favorites','communitySaved'].includes(key)&&typeof row==='string'?row:null);
   if(typeof id!=='string'||!id||map.has(id))return null;
   map.set(id,row);
  }
  return map;
 }
 const a=index(left),b=index(right);
 if(!a||!b)return null;
 return [...new Set([...a.keys(),...b.keys()])].map(id=>({id,local:a.get(id),cloud:b.get(id),choice:key+':'+encodeURIComponent(id)}));
}
export function resolveCloudChoices(local,cloud,choices){
 const result={...cloud};
 function pick(key,a,b){
  if(JSON.stringify(a)===JSON.stringify(b))return a;
  if(!['local','cloud'].includes(choices[key]))throw Error('Bitte für jeden geänderten Eintrag einen Stand wählen.');
  return choices[key]==='local'?a:b;
 }
 for(const key of new Set([...Object.keys(local),...Object.keys(cloud)])){
  if(key==='updatedAt')continue;
  const pairs=recordPairs(key,local[key],cloud[key]);
  result[key]=pairs?pairs.map(p=>pick(p.choice,p.local,p.cloud)).filter(v=>v!==undefined):pick(key,local[key],cloud[key]);
 }
 result.updatedAt=Date.now();return result;
}
const fieldNames={starters:'Starter',ownRecipes:'Eigene Rezepte',history:'Backhistorie',shopping:'Einkaufsliste',pantry:'Vorrat',favorites:'Favoriten',communitySaved:'Community-Merkliste',activeBake:'Aktiver Backtag',parallelBakes:'Weitere Backtage',chatMessages:'KI-Gespräch',recipeProfiles:'Eigene Rezeptvorgaben',onboarded:'Einrichtung'};
export function conflictView(local,cloud,esc){
 const selector=(id,label,a,b)=>'<fieldset><legend>'+esc(label)+'</legend>'+[['Lokal',a],['Cloud',b]].map(([name,value])=>'<details><summary>'+name+'</summary><pre>'+esc(value===undefined?'Eintrag fehlt':JSON.stringify(value,null,2))+'</pre></details>').join('')+'<label>Übernehmen <select data-conflict-field="'+esc(id)+'"><option value="">Bitte wählen</option><option value="local">'+(a===undefined?'Eintrag weglassen':'Lokalen Stand behalten')+'</option><option value="cloud">'+(b===undefined?'Eintrag weglassen':'Cloud-Stand behalten')+'</option></select></label></fieldset>';
 const fields=[];
 for(const key of new Set([...Object.keys(local),...Object.keys(cloud)])){
  if(key==='updatedAt'||JSON.stringify(local[key])===JSON.stringify(cloud[key]))continue;
  const label=fieldNames[key]||key,pairs=recordPairs(key,local[key],cloud[key]);
  if(!pairs){fields.push(selector(key,label,local[key],cloud[key]));continue}
  for(const p of pairs){if(JSON.stringify(p.local)===JSON.stringify(p.cloud))continue;const row=p.local??p.cloud;fields.push(selector(p.choice,label+' · '+(row.title||row.name||p.id),p.local,p.cloud))}
 }
 return '<section class="card"><h2>Cloud-Konflikt lösen</h2><p>Wähle für jeden Unterschied den gewünschten Stand. Beide Fassungen werden vor dem Speichern auf diesem Gerät gesichert.</p>'+fields.join('')+'<button data-act="resolveCloud">Auswahl speichern</button></section>';
}
