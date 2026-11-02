const amount=line=>{const m=line.match(/(?:^|\s)(\d+(?:[,.]\d+)?)\s*g\b/i);if(!m)return null;const grams=Number(m[1].replace(',','.'));const name=(line.slice(0,m.index)+line.slice(m.index+m[0].length)).replace(/^[\s\-:]+|[\s\-:]+$/g,'').trim();return {name,grams}};
export function parseOwnRecipe(input){
 const title=String(input.title||'').trim(),steps=String(input.steps||'').split(/\n+/).map(s=>s.replace(/^\s*\d+[.)]\s*/,'').trim()).filter(Boolean);
 if(title.length<3||steps.length<2)throw Error('Bitte Titel und mindestens zwei Zubereitungsschritte eingeben');
 const lines=String(input.ingredients||'').split(/\n+/).map(x=>x.trim()).filter(Boolean),parsed=lines.map(amount);
 if(parsed.some(x=>!x||!x.name||x.grams<=0))throw Error('Jede Zutat braucht eine Grammangabe, z. B. 500 g Weizenmehl');
 const flours=[],extras=[];let water=0,salt=0,starter=0;
 for(const x of parsed){if(/(?:mehl|schrot|vollkorn|grieß|griess)/i.test(x.name))flours.push(x);else if(/(?:wasser|water)/i.test(x.name))water+=x.grams;else if(/(?:salz|salt)/i.test(x.name))salt+=x.grams;else if(/(?:starter|anstellgut|sauerteig)/i.test(x.name))starter+=x.grams;else extras.push(x)}
 if(!flours.length||!water||!starter)throw Error('Für den Backplan werden Mehl, Wasser und reifer Starter mit Grammangaben benötigt');
 const bakeTemp=Number(input.bakeTemp),bakeMin=Number(input.bakeMin),stock=Number(input.stockHours),proof=Number(input.proofHours);
 if(![bakeTemp,bakeMin,stock,proof].every(Number.isFinite)||bakeTemp<80||bakeTemp>300||bakeMin<5||bakeMin>240||stock<=0||proof<=0)throw Error('Bitte Backtemperatur, Backzeit, Stock- und Stückgare ergänzen');
 return {id:String(input.id||'own-'+Date.now()),title,category:'Eigene Rezepte',difficulty:'Eigene Angabe',yieldLabel:'Eigene Rezeptmenge',flours,water,salt,starter:{type:input.starterType||'Weizen',grams:starter},extras,steps,bake:[{temp:bakeTemp,min:bakeMin}],stock:[stock,stock],proof:[proof,proof],autolyse:0,cold:null,source:'own'};
}
export function ownRecipeForm(r=null,esc=x=>String(x)){
 const field=(id,label,value='',type='text')=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" value="'+esc(value)+'" '+(type==='number'?'min="0" step="0.25"':'')+'>';
 return '<section class="card"><h2>'+(r?'Rezept bearbeiten':'Eigenes Rezept')+'</h2>'+field('ownTitle','Rezeptname',r?.title||'')+'<label>Zutaten – jede Menge in Gramm</label><textarea id="ownIngredients" rows="7" placeholder="500 g Weizenmehl 550&#10;350 g Wasser&#10;100 g reifer Starter&#10;10 g Salz">'+esc(r?.ingredients||'')+'</textarea><label>Zubereitung – ein Schritt je Zeile</label><textarea id="ownSteps" rows="7">'+esc(r?.steps||'')+'</textarea><div class="cols"><div>'+field('ownBakeTemp','Backtemperatur (°C)',r?.bakeTemp||230,'number')+field('ownStock','Stockgare (h)',r?.stockHours||4,'number')+'</div><div>'+field('ownBakeMin','Backzeit (Min.)',r?.bakeMin||40,'number')+field('ownProof','Stückgare (h)',r?.proofHours||2,'number')+'</div></div><label>Starterart</label><select id="ownStarterType"><option>Weizen</option><option>Roggen</option><option>Dinkel</option></select><button class="primary" data-act="ownSave">Rezept speichern</button></section>';
}
export function recipeToRaw(r){return {title:r.title,ingredients:[...r.flours.map(x=>x.grams+' g '+x.name),r.water+' g Wasser',r.salt+' g Salz',r.starter.grams+' g '+r.starter.type+'starter',...(r.extras||[]).map(x=>x.grams+' g '+x.name)].join('\n'),steps:r.steps.join('\n'),bakeTemp:r.bake[0]?.temp,bakeMin:r.bake[0]?.min,stockHours:r.stock[0],proofHours:r.proof[0],starterType:r.starter.type}}
