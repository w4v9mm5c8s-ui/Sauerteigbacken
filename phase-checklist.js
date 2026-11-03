export function ingredientPhases(r){
 if(!r)return {};
 const phases={};const add=(phase,name,grams)=>{if(Number(grams)>0)(phases[phase]??=[]).push({name,grams:Math.round(grams*10)/10})};
 const flourTotal=r.flours.reduce((n,f)=>n+f.grams,0),basePhase=r.autolyse?'Autolyse ansetzen':'Teig mischen';
 for(const f of r.flours)add(basePhase,f.name,f.grams-(r.brew?.flour||0)*f.grams/flourTotal);
 add(basePhase,'Wasser für den Hauptteig',r.water);
 add('Teig mischen','Reifer '+r.starter.type+'starter',r.starter.grams);add('Teig mischen','Salz',r.salt);
 for(const x of r.extras||[]){if(/wasser/i.test(x.name)||r.altbrot&&x.name==='Altbrot'||x.name===r.soaker?.name||x.name===r.additionalSoaker?.name)continue;add(['fuellung','füllung','belag','topping'].includes(x.role)?'Formen':r.autolyse&&/Milch|Honig|Joghurt/i.test(x.name)?basePhase:'Teig mischen',x.name,x.grams)}
 for(const s of [r.soaker,r.additionalSoaker].filter(Boolean)){for(const x of s.items||[{name:s.name,grams:s.grams}])add('Quellstück ansetzen',x.name,x.grams);add('Quellstück ansetzen','Quellwasser',s.water)}
 if(r.altbrot){add('Altbrot-Quellstück ansetzen','Altbrot',r.altbrot.grams);add('Altbrot-Quellstück ansetzen','Quellwasser',r.altbrot.water)}
 if(r.brew){const phase=r.brew.method==='cook'?'Kochstück ansetzen':'Brühstück ansetzen';add(phase,'Mehl aus der Rezeptmenge',r.brew.flour);add(phase,'Wasser',r.brew.water)}
 return phases;
}
export function checklistState(b){const phases=ingredientPhases(b.ingredients),signature=JSON.stringify(phases);return {phases,signature,checked:b.ingredientChecklist?.signature===signature?b.ingredientChecklist.checked||{}:{}};}
export function checklistView(b,esc){const {phases,checked}=checklistState(b);if(!Object.keys(phases).length)return '';return '<details open><summary>Zutaten nach Arbeitsschritt abhaken</summary>'+Object.entries(phases).map(([phase,items])=>'<fieldset><legend>'+esc(phase)+'</legend>'+items.map((x,i)=>{const key=phase+':'+i;return '<label><input type="checkbox" data-act="ingredientCheck:'+encodeURIComponent(key)+'" '+(checked[key]?'checked':'')+'> '+x.grams+' g '+esc(x.name)+'</label>'}).join('')+'</fieldset>').join('')+'</details>';}
export function checkIngredient(b,key){const state=checklistState(b);if(!Object.entries(state.phases).some(([phase,items])=>items.some((_,i)=>key===phase+':'+i)))throw Error('Zutat nicht gefunden');b.ingredientChecklist={signature:state.signature,checked:{...state.checked,[key]:!state.checked[key]}};return b;}
export function incompletePhase(b,title){const {phases,checked}=checklistState(b);return (phases[title]||[]).some((_,i)=>!checked[title+':'+i]);}
export function pendingPreparations(b){return (b.steps||[]).flatMap((s,i)=>/^(Autolyse ansetzen|Quellstück ansetzen|Altbrot-Quellstück ansetzen|Brühstück ansetzen|Kochstück ansetzen|Brühstücktemperatur prüfen|Starter prüfen)$/.test(s.title)&&!b.logs?.[i]?.completedAt?[s.title]:[]);}
