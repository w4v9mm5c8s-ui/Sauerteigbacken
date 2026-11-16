const amount=line=>{const m=line.match(/(?:^|\s)(\d+(?:[,.]\d+)?)\s*g\b/i);if(!m)return null;const grams=Number(m[1].replace(',','.'));const name=(line.slice(0,m.index)+line.slice(m.index+m[0].length)).replace(/^[\s\-:]+|[\s\-:]+$/g,'').trim();return {name,grams}};
const groupedFields = [
 ['fillingItems','Füllung','fuellung'],
 ['toppingItems','Belag','belag'],
 ['soakerItems','Quellstück-Zutaten','soaker']
];
function readGroup(value,label){
 const rows=String(value||'').split(/\n/).map(line=>line.trim()).filter(Boolean);
 return rows.map(line=>{
  const item=amount(line);
  if(!item?.name||!(item.grams>0)||!Number.isFinite(item.grams)||/^-/.test(line))throw Error(label+' braucht je Zeile eine Zutat mit positiver Grammangabe.');
  return item;
 });
}
function groupedForm(r,esc){
 const fields=groupedFields.map(([key,label])=>'<label for="'+key+'">'+label+' (Gramm je Zutat)</label><textarea id="'+key+'" rows="2">'+esc(r?.[key]||'')+'</textarea>').join('');
 return '<details><summary>Füllung, Belag und Quellstück</summary><p>Zutaten hier nur einmal eintragen. Das Wasser oben ist die Gesamtmenge einschließlich Quellwasser.</p>'+fields+
 '<label for="ownSoakWater">Davon Quellwasser (g)</label><input type="number" min="0" step="any" id="ownSoakWater" value="'+esc(r?.soakWater??'')+'">'+
 '<label for="ownSoakHours">Quellzeit (Stunden)</label><input type="number" min="0.25" max="48" step="any" id="ownSoakHours" value="'+esc(r?.soakHours??'')+'"></details>';
}
export function parseOwnRecipe(input){
 const title=String(input.title||'').trim(),steps=String(input.steps||'').split(/\n+/).map(s=>s.replace(/^\s*\d+[.)]\s*/,'').trim()).filter(Boolean);
 if(title.length<3||steps.length<2)throw Error('Bitte Titel und mindestens zwei Zubereitungsschritte eingeben');
 const lines=String(input.ingredients||'').split(/\n+/).map(x=>x.trim()).filter(Boolean),parsed=lines.map(amount);
 if(parsed.some(x=>!x||!x.name||x.grams<=0))throw Error('Jede Zutat braucht eine Grammangabe, z. B. 500 g Weizenmehl');
 const flours=[],extras=[];let water=0,salt=0,starter=0;
 for(const x of parsed){if(/(?:mehl|schrot|vollkorn|grieß|griess|emmer|einkorn|kamut|manitoba|graham|ruch)/i.test(x.name))flours.push(x);else if(/(?:wasser|water)/i.test(x.name))water+=x.grams;else if(/(?:salz|salt)/i.test(x.name))salt+=x.grams;else if(/(?:starter|anstellgut|sauerteig)/i.test(x.name))starter+=x.grams;else extras.push(x)}
 if(!flours.length||(!water&&!extras.some(x=>/Milch|Joghurt|Buttermilch|Ei\b/i.test(x.name)))||!starter)throw Error('Für den Backplan werden Mehl, eine Flüssigkeit und reifer Starter mit Grammangaben benötigt');
 const bakeTemp=Number(input.bakeTemp),bakeMin=Number(input.bakeMin),stock=Number(input.stockHours),proof=Number(input.proofHours);
 if(![bakeTemp,bakeMin,stock,proof].every(Number.isFinite)||bakeTemp<80||bakeTemp>300||bakeMin<5||bakeMin>240||stock<=0||proof<=0)throw Error('Bitte Backtemperatur, Backzeit, Stock- und Stückgare ergänzen');
 const hydration=Number(input.starterHydration??100);if(!Number.isFinite(hydration)||hydration<20||hydration>250)throw Error('Starter-Hydration zwischen 20 und 250 % eingeben');
 const phases=String(input.bakePhases||'').trim().split(/\n+/).filter(Boolean).map(line=>{const v=line.split(';').map(x=>x.trim());const temp=Number(v[0]),min=Number(v[1]);if(!Number.isFinite(temp)||!Number.isFinite(min)||temp<80||temp>300||min<1||min>240)throw Error('Backphasen: Temperatur; Minuten; Hinweis');return {temp,min,detail:v.slice(2).join(';')}});
 const seeds=readGroup(input.soakerItems,'Das Quellstück');
 const soakWater=Number(input.soakWater||0),soakHours=Number(input.soakHours||0);
 if(seeds.length&&(!(soakWater>0&&soakWater<=water)||!(soakHours>=0.25&&soakHours<=48)))throw Error('Quellwasser innerhalb der Gesamtwassermenge und Quellzeit von 0,25 bis 48 Stunden eingeben.');
 if(!seeds.length&&(soakWater||soakHours))throw Error('Bitte die Quellstück-Zutaten ergänzen.');
 for(const [key,label,role] of groupedFields.filter(x=>x[2]!=='soaker')){
  extras.push(...readGroup(input[key],label).map(item=>({...item,role})));
 }
 return {id:String(input.id||'own-'+Date.now()),title,category:'Eigene Rezepte',difficulty:'Eigene Angabe',yieldLabel:'Eigene Rezeptmenge',flours,water,salt,starter:{type:input.starterType||'Weizen',grams:starter,hydration},extras,...(seeds.length?{soaker:{items:seeds,water:soakWater,hours:soakHours}}:{}),steps,bake:phases.length?phases:[{temp:bakeTemp,min:bakeMin}],stock:[stock,stock],proof:[proof,proof],autolyse:0,cold:null,source:'own'};
}
export function ownRecipeForm(r=null,esc=x=>String(x)){
 const field=(id,label,value='',type='text')=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" value="'+esc(value)+'" '+(type==='number'?'min="0" step="0.25"':'')+'>';
 return '<section class="card"><h2>'+(r?'Rezept bearbeiten':'Eigenes Rezept')+'</h2>'+field('ownTitle','Rezeptname',r?.title||'')+'<label>Zutaten – jede Menge in Gramm</label><textarea id="ownIngredients" rows="7" placeholder="500 g Weizenmehl 550&#10;350 g Wasser&#10;100 g reifer Starter&#10;10 g Salz">'+esc(r?.ingredients||'')+'</textarea><label>Zubereitung – ein Schritt je Zeile</label><textarea id="ownSteps" rows="7">'+esc(r?.steps||'')+'</textarea><div class="cols"><div>'+field('ownBakeTemp','Backtemperatur (°C)',r ? (r.bakeTemp??'') : 230,'number')+field('ownStock','Stockgare (h)',r ? (r.stockHours??'') : 4,'number')+'</div><div>'+field('ownBakeMin','Backzeit (Min.)',r ? (r.bakeMin??'') : 40,'number')+field('ownProof','Stückgare (h)',r ? (r.proofHours??'') : 2,'number')+'</div></div><label>Starterart</label><select id="ownStarterType">'+['Weizen','Roggen','Dinkel'].map(type=>'<option '+(type===(r?.starterType||'Weizen')?'selected':'')+'>'+type+'</option>').join('')+'</select>'+field('ownStarterHydration','Starter-Hydration (%)',r?.starterHydration??100,'number')+'<label for="ownBakePhases">Mehrere Backphasen (optional): °C; Minuten; Hinweis, eine Phase je Zeile</label><textarea id="ownBakePhases" rows="4">'+esc(r?.bakePhases||'')+'</textarea>'+groupedForm(r,esc)+'<button class="primary" data-act="ownSave">Rezept speichern</button></section>';
}
export function recipeToRaw(r){return {title:r.title,ingredients:[...r.flours.map(x=>x.grams+' g '+x.name),...(r.water?[r.water+' g Wasser']:[]),...(r.salt?[r.salt+' g Salz']:[]),r.starter.grams+' g '+r.starter.type+'starter',...(r.extras||[]).filter(x=>!['fuellung','füllung','belag','topping'].includes(x.role)).map(x=>x.grams+' g '+x.name)].join('\n'),fillingItems:(r.extras||[]).filter(x=>['fuellung','füllung'].includes(x.role)).map(x=>x.grams+' g '+x.name).join('\n'),toppingItems:(r.extras||[]).filter(x=>['belag','topping'].includes(x.role)).map(x=>x.grams+' g '+x.name).join('\n'),soakerItems:(r.soaker?.items||[]).map(x=>x.grams+' g '+x.name).join('\n'),soakWater:r.soaker?.water,soakHours:r.soaker?.hours,steps:r.steps.join('\n'),bakeTemp:r.bake[0]?.temp,bakeMin:r.bake[0]?.min,stockHours:r.stock[0],proofHours:r.proof[0],starterType:r.starter.type,starterHydration:r.starter.hydration??100,bakePhases:r.bake.map(p=>[p.temp,p.min,p.detail||''].join('; ')).join('\n')}}
