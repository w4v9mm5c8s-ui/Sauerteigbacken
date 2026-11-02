export function flourSuggestion(rows,name,grams){
 const row=rows.find(x=>x.name===name);
 if(!row||!Number.isFinite(grams)||grams<=0)return null;
 return {water:Math.round(row.water500*grams/500),starter:Math.round(row.starter500*grams/500),hydration:row.hydration,starterType:row.starterType,stockFactor:row.stockFactor,proofFactor:row.proofFactor,source:'Sauerteigbrot.pdf, Mehltabelle S. 7–8'};
}
export function waterTempSuggestion(target,flour,starter,friction=0){
 if(![target,flour,starter,friction].every(Number.isFinite))return null;
 const value=3*target-flour-starter-friction;
 return value>=5&&value<=45?Math.round(value*10)/10:null;
}
