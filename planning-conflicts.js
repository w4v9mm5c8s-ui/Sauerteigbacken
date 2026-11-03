export function overlaps(a,b){return a.at<b.at+b.minutes*60000&&b.at<a.at+a.minutes*60000;}
export function placeActions(actions,occupied=[]){
 const fixed=[],flex=[];
 for(const a of actions){const row={title:a[0],at:a[1],minutes:a[2],detail:a[3]||''};(/vorheizen|prüfen|Quellstück ansetzen|Brühstück ansetzen|einschneiden/i.test(row.title)?flex:fixed).push(row);}
 const placed=[];
 for(const row of fixed.sort((a,b)=>a.at-b.at)){if(placed.some(x=>overlaps(x,row)))throw Error('Arbeitsschritte überschneiden sich: '+row.title+'. Bitte Faltabstand oder Garzeiten ändern.');placed.push(row);}
 for(const row of flex.sort((a,b)=>a.at-b.at)){let candidate=null;for(let m=0;m<=120;m++){const next={...row,at:row.at-m*60000};if(![...placed,...occupied].some(x=>overlaps(x,next))){candidate=next;break}}if(!candidate) return null;placed.push(candidate);}
 if(placed.some(row=>occupied.some(x=>overlaps(row,x))))return null;
 return placed.sort((a,b)=>a.at-b.at);
}
