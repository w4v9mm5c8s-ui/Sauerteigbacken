const MAX_BYTES=600_000;
const MAX_ITEMS=2000;
const lists=['history','shopping','starters','favorites','ownRecipes','pantry','communitySaved'];
const allowed=new Set([...lists,'activeBake','parallelBakes','onboarded','updatedAt','exportedAt','backupVersion']);
export function validateBackup(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Ungültige Sauerteig-Datensicherung');
 let raw;try{raw=JSON.stringify(input)}catch{throw Error('Datensicherung ist nicht lesbar')}
 if(!raw||new TextEncoder().encode(raw).length>MAX_BYTES)throw Error('Die Datensicherung ist zu groß');
 for(const key of ['history','shopping','starters']){
  if(!Array.isArray(input[key])||input[key].length>MAX_ITEMS)throw Error('Datensicherung enthält unvollständige '+key+'-Daten');
 }
 for(const key of lists){
  if(input[key]!==undefined&&(!Array.isArray(input[key])||input[key].length>MAX_ITEMS))throw Error('Ungültige '+key+'-Daten');
 }
 const checkBake=b=>b===null||b===undefined||typeof b==='object'&&!Array.isArray(b)&&typeof b.title==='string'&&b.title.length<=200&&Array.isArray(b.steps)&&b.steps.length>=1&&b.steps.length<=150&&b.steps.every(step=>step&&typeof step.title==='string'&&step.title.length<=180&&Number.isFinite(Number(step.at)));
 if(!checkBake(input.activeBake))throw Error('Aktiver Backtag in der Datensicherung ist ungültig');
 if(input.parallelBakes!==undefined&&(!Array.isArray(input.parallelBakes)||input.parallelBakes.length>24||!input.parallelBakes.every(b=>b!==null&&b!==undefined&&checkBake(b))))throw Error('Parallele Backtage in der Datensicherung sind ungültig');
 const clean=Object.fromEntries(Object.entries(JSON.parse(raw)).filter(([key])=>allowed.has(key)));
 for(const key of ['history','shopping','starters'])clean[key]??=[];
 clean.updatedAt=Date.now();
 return clean;
}
export function makeBackup(data,activeBake=null,parallelBakes=[]){
 const snapshot={...data,activeBake,parallelBakes,backupVersion:1,exportedAt:new Date().toISOString()};
 return validateBackup(snapshot);
}
export async function readBackup(file){
 if(!file)throw Error('Bitte eine Datensicherung auswählen');
 if(file.size>MAX_BYTES)throw Error('Datei zu groß');
 let parsed;try{parsed=JSON.parse(await file.text())}catch{throw Error('Datei ist kein gültiges JSON')}
 return validateBackup(parsed);
}
