import {ownRecipeForm,recipeToRaw} from './own-recipe-parser.js';
import {recipePhotoPath} from './recipe-gallery.js';
const versionFields={title:'Rezeptname',ingredients:'Hauptteig',steps:'Zubereitung',starterType:'Starterart',starterHydration:'Starter-Hydration (%)',bakeMin:'Backzeit (Min.)',bakeTemp:'Backtemperatur (°C)',stockHours:'Stockgare (h)',proofHours:'Stückgare (h)',bakePhases:'Backphasen',fillingItems:'Füllung',toppingItems:'Belag',soakerItems:'Quellstück',soakWater:'Quellwasser (g)',soakHours:'Quellzeit (h)',brewMethod:'Zubereitung der Vorstufe',brewFlour:'Mehl der Vorstufe (g)',brewWater:'Wasser der Vorstufe (g)',brewCoolMinutes:'Abkühlzeit (Min.)'};
export function versionHistory(item,index,esc){
 if(!item.versions?.length)return '';
 const snapshots=item.versions.map((old,j)=>{
  const diffs=Object.entries(versionFields).filter(([key])=>String(old[key]??'').trim()!==String(item[key]??'').trim());
  const fields=diffs.map(([key,label])=>'<li><strong>'+label+'</strong><div style="white-space:pre-wrap">Damals: '+esc(old[key]??'–')+'<br>Jetzt: '+esc(item[key]??'–')+'</div></li>').join('');
  return '<details><summary>Fassung '+(j+1)+(old.updatedAt?' · '+esc(new Date(old.updatedAt).toLocaleString('de-DE')):'')+'</summary>'+(fields?'<ul>'+fields+'</ul>':'<p>Alle Rezeptfelder stimmen überein.</p>')+'<button data-act="ownRestore:'+index+':'+j+'">Diese Fassung wiederherstellen</button></details>';
 });
 return '<details><summary>Versionen vergleichen</summary>'+snapshots.reverse().join('')+'</details>';
}
export function restoreVersion(current,j,now){
 const old=current?.versions?.[j];
 if(!old)throw Error('Rezeptversion nicht gefunden.');
 const {versions,...present}=current;
 return {...old,...(old.recipe?{recipe:{...old.recipe,id:current.recipe?.id||old.recipe.id}}:{}),updatedAt:now,versions:[...versions.filter((_,i)=>i!==j),present].slice(-20)};
}
export function ownRecipesView(items,esc,editing=null){
 return '<section class="card"><div class="illustrated-section"><div><span class="hero-kicker">DEINE BACKSAMMLUNG</span><h2>Meine Rezepte</h2></div><img src="/design/tile-recipes.png" alt="" width="154" height="120" loading="lazy"></div>'+(items.length?items.map((r,i)=>'<div class="item recipe watercolor-own-recipe"><img class="own-recipe-photo" src="'+recipePhotoPath(r)+'" alt="KI-generiertes Beispielbild" loading="lazy"><div><strong>'+esc(r.title)+'</strong><small class="muted">'+(r.recipe?'Mit Backplan':'Noch ohne vollständigen Backplan')+'</small></div><div class="stack"><button data-act="ownEdit:'+i+'">Bearbeiten</button><button data-act="ownDuplicate:'+i+'">Duplizieren</button>'+(r.recipe?'<button data-act="ownPlan:'+i+'">Backtag planen</button>':'')+versionHistory(r,i,esc)+'<button data-act="ownDelete:'+i+'">Löschen</button></div></div>').join(''):'<p class="muted">Noch keine eigenen Rezepte.</p>')+'</section>'+
 ownRecipeForm(editing===null?null:items[editing],esc)+
 '<section class="card"><h2>Rezept importieren</h2><label>Rezeptlink (HTTPS)</label><input id="ownImportUrl" type="url" placeholder="https://beispiel.de/rezept"><button data-act="ownFetchUrl">Link auslesen</button><label>Rezepttext</label><textarea id="ownImportText" placeholder="Rezepttext einfügen"></textarea><label>Oder Rezeptfoto</label><input id="ownImportPhoto" type="file" accept="image/jpeg,image/png,image/webp"><label><input id="ownImportConsent" type="checkbox" style="width:auto"> Ich stimme der KI-Auswertung zu.</label><button data-act="ownImport">Auslesen und prüfen</button></section>';
}
export function normalizeExtractedRecipe(r){return {title:String(r.title||'').trim(),ingredients:(r.ingredients||[]).map(x=>(x.grams==null?'':x.grams+' g ')+String(x.name||'')).join('\n'),steps:(r.steps||[]).join('\n')}}
