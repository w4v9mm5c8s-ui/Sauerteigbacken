/**
 * Deterministic blend calculator.
 * Reference table: Sauerteigbrot.pdf, flour table pp. 7-8.
 * Values are suggestions; they are not independently validated fermentation predictions.
 */
export const roundGram = n => Math.round(n * 10) / 10;
export function flourBlendSuggestion(table, entries, { saltPercent=2, starterHydration=100 }={}) {
 if (!Array.isArray(table)||!Array.isArray(entries)||entries.length<1||entries.length>16)
   throw Error('Bitte mindestens eine und maximal 16 Mehlsorten auswählen.');
 if (!Number.isFinite(Number(saltPercent))||saltPercent<0||saltPercent>10)
   throw Error('Salzgehalt muss zwischen 0 und 10 % liegen.');
 if (!Number.isFinite(Number(starterHydration))||starterHydration<20||starterHydration>250)
   throw Error('Starter-Hydration muss zwischen 20 und 250 % liegen.');
 const byName = new Map(table.filter(x=>x&&typeof x.name==='string').map(row=>[row.name,row]));
 const selected = entries.map(entry=>{
  const name=String(entry?.name||'').trim(),grams=Number(entry?.grams);
  if(!name||!Number.isFinite(grams)||grams<=0||grams>20000)
   throw Error('Bitte für jedes Mehl eine Sorte und eine Menge über 0 g eingeben.');
  const row=byName.get(name);
  if(!row||![row.water500,row.starter500,row.hydration].every(Number.isFinite))
   throw Error('Für '+name+' sind keine hinterlegten Mengenwerte vorhanden.');
  return {name,grams,row};
 });
 const grams=selected.reduce((total,x)=>total+x.grams,0);
 if(grams>50000)throw Error('Mehlmenge ist zu hoch.');
 const water=roundGram(selected.reduce((total,x)=>total+x.row.water500*x.grams/500,0));
 const starter=roundGram(selected.reduce((total,x)=>total+x.row.starter500*x.grams/500,0));
 const salt=roundGram(grams*Number(saltPercent)/100);
 const weightedHydration=roundGram(selected.reduce((total,x)=>total+x.row.hydration*x.grams,0)/grams);
 const stockFactor=roundGram(selected.reduce((total,x)=>total+x.row.stockFactor*x.grams,0)/grams);
 const proofFactor=roundGram(selected.reduce((total,x)=>total+x.row.proofFactor*x.grams,0)/grams);
 const types=new Map();
 for(const item of selected){
  const key=String(item.row.starterType||'weizen').toLocaleLowerCase('de-DE');
  types.set(key,(types.get(key)||0)+item.grams);
 }
 const suggestedStarter=[...types.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'weizen';
 const starterFlour=starter/(1+Number(starterHydration)/100);
 const starterWater=starter-starterFlour;
 const effectiveHydration=roundGram(100*(water+starterWater)/(grams+starterFlour));
 return {flours:selected.map(({name,grams})=>({name,grams})),flourTotal:roundGram(grams),water,starter,salt,saltPercent:Number(saltPercent),starterHydration:Number(starterHydration),total:roundGram(grams+water+starter+salt),weightedHydration,effectiveHydration,stockFactor,proofFactor,suggestedStarter,source:'Sauerteigbrot.pdf, Mehltabelle S. 7–8',isEstimate:true};
}
