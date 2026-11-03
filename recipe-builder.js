import {flourBlendSuggestion,roundGram} from './flour-mix.js';
import {calculateDough} from './calculators.js';

export function bakeChoiceView(){
 return '<section class="bake-choice-head"><span class="studio-overline">JETZT BACKEN</span><h2>Wie möchtest du starten?</h2><p>Wähle einen fertigen Backplan oder stelle dein eigenes Rezept zusammen.</p></section>'+
 '<div class="bake-choice-list">'+
 '<button class="bake-choice-option" data-act="planFromRecipe"><img src="/design/photo-landbrot.png" alt="Sauerteigbrot" loading="lazy"><span><strong>Backtag planen</strong><small>Rezept auswählen, Mengen anpassen und passende Schritte planen</small></span><span class="studio-chevron" aria-hidden="true">›</span></button>'+
 '<button class="bake-choice-option" data-act="newRecipe"><img src="/design/tile-import.png" alt="" loading="lazy"><span><strong>Eigenes Rezept berechnen oder erstellen</strong><small>Mehle und Mengen eingeben – Wasser, Starter und Salz vorschlagen lassen</small></span><span class="studio-chevron" aria-hidden="true">›</span></button>'+
 '</div><button class="bake-choice-history" data-act="bakingDays">Meine laufenden Backtage ansehen →</button>';
}

export function flourBlendRow(rows,esc=x=>String(x),name='',grams='',index=0){
 const options='<option value="">Mehlsorte auswählen</option>'+rows.map(r=>'<option value="'+esc(r.name)+'" '+(r.name===name?'selected':'')+'>'+esc(r.name)+'</option>').join('');
 return '<div class="flour-blend-row" data-flour-row><label><span>Mehl '+(index+1)+'</span><select class="blend-flour" aria-label="Mehlsorte '+(index+1)+'">'+options+'</select></label><label><span>Menge (g)</span><input class="blend-grams" type="number" min="0.1" max="20000" step="0.1" inputmode="decimal" value="'+esc(grams)+'"></label><button type="button" class="blend-remove" data-act="blendRemove" aria-label="Dieses Mehl entfernen">×</button></div>';
}

export function recipeBuilderView(rows,esc=x=>String(x),starters=[]){
 const initial=rows.find(r=>r.name==='Weizenmehl Type 550')||rows[0]||null;
 const prediction=initial?flourBlendSuggestion(rows,[{name:initial.name,grams:500}]):null;
 const options=Array.isArray(starters)?starters.map((st,i)=>'<option value="'+i+'">'+esc(st.name||'Starter')+' ('+esc(st.type||'Weizen')+')</option>').join(''):'';
 return '<section class="blend-title"><span class="studio-overline">EIGENES REZEPT</span><h2>Rezept berechnen oder erstellen</h2><p>Wähle ein oder mehrere Mehle und gib jeweils die Grammzahl ein. Die übrigen Grundzutaten werden anhand der hinterlegten Mehltabelle vorgeschlagen.</p></section>'+
 '<section class="card blend-form"><div class="blend-section-head"><h3>Deine Mehlmischung</h3><small>Mehlanteile frei kombinieren</small></div>'+
 '<div id="blendRows">'+(initial?flourBlendRow(rows,esc,initial.name,500,0):'<p>Mehltabelle ist noch nicht verfügbar.</p>')+'</div>'+
 '<button class="blend-add" type="button" data-act="blendAdd">+ Weiteres Mehl hinzufügen</button>'+
 '<div class="blend-options"><label for="blendSaltPct">Salz (% der Mehlmenge)</label><input id="blendSaltPct" type="number" value="2" min="0" max="10" step="0.1" inputmode="decimal">'+
 '<label for="blendHydration">Hydration des Starters (%)</label><input id="blendHydration" type="number" value="100" min="20" max="250" step="5" inputmode="decimal"></div>'+
 (options?'<label for="blendSavedStarter">Deinen eigenen Starter übernehmen (optional)</label><select id="blendSavedStarter"><option value="">Keinen gespeicherten Starter auswählen</option>'+options+'</select>':'<p class="muted small">Deine Starter verwaltest du unter „Ich“ → „Meine Starter“.</p>')+
 '<label class="blend-automation"><input id="blendAuto" type="checkbox" checked> Wasser, Starter und Salz automatisch vorschlagen</label>'+
 '<div class="blend-quantities"><label for="blendWater">Wasser (g)<input id="blendWater" type="number" min="0" max="30000" step="0.1" inputmode="decimal" value="'+(prediction?.water??'')+'"></label>'+
 '<label for="blendStarter">Reifer Starter (g)<input id="blendStarter" type="number" min="0" max="10000" step="0.1" inputmode="decimal" value="'+(prediction?.starter??'')+'"></label>'+
 '<label for="blendSalt">Salz (g)<input id="blendSalt" type="number" min="0" max="5000" step="0.1" inputmode="decimal" value="'+(prediction?.salt??'')+'"></label>'+
 '<label for="blendStarterType">Starterart<select id="blendStarterType">'+['Weizen','Roggen','Dinkel'].map(v=>'<option '+((prediction?.suggestedStarter||'weizen')===v.toLowerCase()?'selected':'')+'>'+v+'</option>').join('')+'</select></label></div>'+
 '<div id="blendResult" class="blend-result" aria-live="polite">'+(prediction?blendSummary(prediction,prediction.water,prediction.starter,prediction.salt):'Bitte Mehl auswählen.')+'</div>'+
 '<p class="blend-source">Die Mengen sind Vorschläge aus der Mehltabelle (Sauerteigbrot.pdf, S. 7–8), kein garantiertes Rezept. Bei anderen Temperaturen und Startern muss der Teigzustand geprüft werden.</p></section>'+
 '<section class="card blend-complete"><details id="blendRecipeDetails"><summary><strong>Eigenes Rezept fertigstellen</strong><span>Fürs Speichern oder Planen Backschritte und Zeiten ergänzen</span></summary>'+
 '<label for="blendTitle">Rezeptname</label><input id="blendTitle" type="text" maxlength="120" placeholder="z. B. Mein Weizen-Roggen-Brot">'+
 '<label for="blendSteps">Zubereitungsschritte (mindestens zwei, eine Zeile je Schritt)</label><textarea id="blendSteps" rows="5" placeholder="Mehle, Wasser und Starter mischen\nTeig gehen lassen und den Zustand prüfen\nFormen und backen"></textarea>'+
 '<div class="blend-time-fields"><label>Backtemperatur (°C)<input id="blendBakeTemp" type="number" min="80" max="300" inputmode="numeric" placeholder="Eingeben"></label>'+
 '<label>Backzeit (Minuten)<input id="blendBakeMin" type="number" min="5" max="240" inputmode="numeric" placeholder="Eingeben"></label>'+
 '<label>Stockgare (Stunden)<input id="blendStockHours" type="number" min="0.25" max="48" step="0.25" inputmode="decimal" placeholder="Eingeben"></label>'+
 '<label>Stückgare (Stunden)<input id="blendProofHours" type="number" min="0.25" max="48" step="0.25" inputmode="decimal" placeholder="Eingeben"></label></div>'+
 '<p class="muted small">Die Gär- und Backzeiten können nicht verlässlich nur aus der Mehlmischung bestimmt werden. Hier bitte eigene Rezeptangaben eintragen.</p></details>'+
 '<div class="blend-actions"><button data-act="blendPlan">Backtag mit diesem Rezept planen</button><button class="primary" data-act="blendSave">Eigenes Rezept speichern</button></div></section>';
}

function fmt(value){return Number(value).toLocaleString('de-DE',{maximumFractionDigits:1})}
export function blendSummary(suggested,water=suggested.water,starter=suggested.starter,salt=suggested.salt){
 if(![water,starter,salt].every(x=>Number.isFinite(x)&&x>=0))return 'Bitte Mengen überprüfen.';
 const actual=calculateDough(suggested.flourTotal,Number(water),Number(salt),Number(starter),suggested.starterHydration);
 return '<span class="blend-meta">BERECHNETER VORSCHLAG</span><div class="blend-total">'+fmt(roundGram(actual.total))+' g <small>Teig gesamt</small></div>'+
 '<div class="blend-totals"><span>Mehl <strong>'+fmt(suggested.flourTotal)+' g</strong></span><span>Wasser <strong>'+fmt(water)+' g</strong></span><span>Starter <strong>'+fmt(starter)+' g</strong></span><span>Salz <strong>'+fmt(salt)+' g</strong></span></div>'+
 '<p>Hydration inklusive Starter: <strong>'+fmt(roundGram(actual.hydration))+' %</strong>. Wasserempfehlung aus der Tabelle: '+fmt(suggested.weightedHydration)+' % der Mehlmenge, ohne Starterwasser.</p>';
}

export function readBlendEntries(root=document){
 const elements=[...root.querySelectorAll('[data-flour-row]')];
 return elements.map(el=>({name:el.querySelector('.blend-flour')?.value||'',grams:Number(el.querySelector('.blend-grams')?.value)}));
}

export function readBlendQuantities(root,table){
 const num=id=>Number(root.getElementById(id)?.value),entries=readBlendEntries(root);
 const suggested=flourBlendSuggestion(table,entries,{saltPercent:num('blendSaltPct'),starterHydration:num('blendHydration')});
 const water=num('blendWater'),starter=num('blendStarter'),salt=num('blendSalt');
 if([water,starter,salt].some(x=>!Number.isFinite(x)||x<0))throw Error('Wasser, Starter und Salz müssen gültige Mengen sein.');
 return {suggested,water,starter,salt,starterType:root.getElementById('blendStarterType')?.value||'Weizen'};
}

export function readBlendRecipe(root,table){
 const {suggested,water,starter,salt,starterType}=readBlendQuantities(root,table);
 const field=id=>root.getElementById(id)?.value??'';
 const raw={
  title:field('blendTitle').trim(),
  ingredients:[...suggested.flours.map(f=>fmt(f.grams).replaceAll('.','')+' g '+f.name),fmt(water).replaceAll('.','')+' g Wasser',fmt(starter).replaceAll('.','')+' g reifer '+starterType+'starter',fmt(salt).replaceAll('.','')+' g Salz'].join('\n'),
  steps:field('blendSteps').trim(),
  bakeTemp:field('blendBakeTemp'),bakeMin:field('blendBakeMin'),
  stockHours:field('blendStockHours'),proofHours:field('blendProofHours'),
  starterType,starterHydration:suggested.starterHydration
 };
 return {raw,suggested};
}
