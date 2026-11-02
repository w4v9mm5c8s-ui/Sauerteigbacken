const MAX_BYTES=600_000;
export function validateBackup(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Ungültige Sauerteig-Datensicherung');
 if(JSON.stringify(input).length>MAX_BYTES)throw Error('Die Datensicherung ist zu groß');
 for(const key of ['history','shopping','starters']){
  if(!Array.isArray(input[key])||input[key].length>2000)throw Error('Datensicherung enthält unvollständige '+key+'-Daten');
 }
 for(const key of ['favorites','ownRecipes','pantry']){
  if(input[key]!==undefined&&(!Array.isArray(input[key])||input[key].length>2000))throw Error('Ungültige '+key+'-Daten');
 }
 const data=JSON.parse(JSON.stringify(input));
 data.updatedAt=Date.now();
 return data;
}
export async function readBackup(file){
 if(!file)throw Error('Bitte eine Datensicherung auswählen');
 if(file.size>MAX_BYTES)throw Error('Datei zu groß');
 let parsed;try{parsed=JSON.parse(await file.text())}catch{throw Error('Datei ist kein gültiges JSON')};
 return validateBackup(parsed);
}
