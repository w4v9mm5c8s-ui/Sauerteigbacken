/** Canonical PDF names for legacy 26-recipe flour codes; no stored IDs are rewritten. */
export const PDF_FLOUR_ALIASES=Object.freeze({
 w550:'Weizenmehl Type 550',w1050:'Weizenmehl Type 1050',
 wvk:'Weizenvollkornmehl',w00:'Weizenmehl Type 00',
 r1150:'Roggenmehl Type 1150',rvk:'Roggenvollkornmehl',
 d630:'Dinkelmehl Type 630',d1050:'Dinkelmehl Type 1050',
 dvk:'Dinkelvollkornmehl',emmerhell:'Emmer hell'
});
export function canonicalFlourName(name){
 const key=String(name??'').trim();return PDF_FLOUR_ALIASES[key]||key;
}
export function flourSuggestion(rows,name,grams){
 const row=rows.find(x=>x.name===canonicalFlourName(name));
 if(!row||!Number.isFinite(grams)||grams<=0)return null;
 return {water:Math.round(row.water500*grams/500),starter:Math.round(row.starter500*grams/500),hydration:row.hydration,starterType:row.starterType,stockFactor:row.stockFactor,proofFactor:row.proofFactor,source:'Richtwert für die gewählte Mehlsorte'};
}
export function mixingFriction(room,flour,starter,water,finished){
 if(![room,flour,starter,water,finished].every(Number.isFinite))return null;
 return 4*finished-room-flour-starter-water;
}
export function waterTempSuggestion(target,flour,starter,room,friction=0){
 if(![target,flour,starter,room,friction].every(Number.isFinite))return null;
 const value=4*target-room-flour-starter-friction;
 return value>=5&&value<=45?Math.round(value*10)/10:null;
}
