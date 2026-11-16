import {canonicalFlourName} from './flour-table.js';

export function isFlour(item){
 if(item.kind)return item.kind==='flour';
 return /mehl|weizen|roggen|dinkel|emmer|einkorn|manitoba|kamut/i.test(canonicalFlourName(item.name))&&!/starter|flocken|kleie|körner|sauerteig/i.test(item.name);
}
const threshold=item=>Number(item.warnAt??200);
const grams=n=>Number(n).toLocaleString('de-DE')+' g';
function stockLine(item,esc){
 const low=Number(item.amount)<=threshold(item);
 return '<div class="stock-line"><strong>'+esc(item.name)+'</strong><b>'+grams(item.amount)+'</b><small>'+(low?'Nachfüllen · ':'')+'Warngrenze '+grams(threshold(item))+'</small></div>';
}
export function pantryView(items,esc,flours=[]){
 const rows=items.map((item,i)=>'<article class="stock-entry">'+(isFlour(item)?stockLine(item,esc):'<div class="stock-line"><strong>'+esc(item.name)+'</strong><b>'+grams(item.amount)+'</b></div>')+'<div class="stock-actions"><button data-act="pantryEdit:'+i+'">Menge ändern</button>'+(isFlour(item)?'<button data-act="pantryWarn:'+i+'">Warngrenze ändern</button>':'')+'<button data-act="pantryDelete:'+i+'">Löschen</button></div></article>').join('');
 return '<section class="card"><div class="illustrated-section"><h2>Meine Mehle & Vorrat</h2><img src="/art-wheat.svg" alt="" width="72" height="56"></div>'+rows+'<h3>Vorrat eintragen</h3><label for="pantryKind">Kategorie</label><select id="pantryKind"><option value="flour">Mehl</option><option value="other">Andere Zutat</option></select><label for="pantryName">Mehl oder Zutat</label><input id="pantryName" list="pantryFlours" placeholder="Weizenmehl Type 550"><datalist id="pantryFlours">'+flours.map(f=>'<option value="'+esc(f.name)+'"></option>').join('')+'</datalist><label for="pantryAmount">Menge hinzufügen (g)</label><input type="number" id="pantryAmount" min="0" max="1000000" placeholder="1000"><div id="pantryWarnFields"><label for="pantryWarnAt">Bei dieser Restmenge warnen (g)</label><input id="pantryWarnAt" type="number" min="0" max="1000000" value="200"></div><button data-act="pantryAdd">Hinzufügen</button></section>';
}
