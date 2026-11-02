const maxField=(x,n=8000)=>String(x??'').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|#160);/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(x[0-9a-f]+|\d+);/gi,(all,c)=>{const n=c[0].toLowerCase()==='x'?parseInt(c.slice(1),16):Number(c);return n>31&&n<0x110000?String.fromCodePoint(n):' '}).replace(/\s+/g,' ').trim().slice(0,n);
function instructions(value,depth=0){
 if(depth>8||value==null)return [];
 if(Array.isArray(value))return value.flatMap(x=>instructions(x,depth+1));
 if(typeof value==='string')return value.trim()?[maxField(value,1300)]:[];
 if(typeof value!=='object')return [];
 if(value.itemListElement)return instructions(value.itemListElement,depth+1);
 if(value.recipeInstructions)return instructions(value.recipeInstructions,depth+1);
 const text=maxField(value.text||value.description||value.name||'',1300);
 return text?[text]:[];
}
function findRecipe(value,depth=0){
 if(depth>8||value==null)return null;
 if(Array.isArray(value))for(const item of value){const r=findRecipe(item,depth+1);if(r)return r}
 if(typeof value!=='object')return null;
 const types=[].concat(value['@type']||[]).map(String);
 if(types.some(x=>/(^|[/#])Recipe$/i.test(x)))return value;
 for(const key of ['@graph','mainEntity','itemListElement','hasPart']){
  const r=findRecipe(value[key],depth+1);if(r)return r;
 }
 return null;
}
export function extractStructuredRecipe(html){
 if(typeof html!=='string')return null;
 let scanned=0;
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
  if(++scanned>40)break;
  if(!/\btype\s*=\s*(?:"application\/ld\+json(?:;[^"]*)?"|'application\/ld\+json(?:;[^']*)?'|application\/ld\+json)/i.test(m[1])||m[2].length>100000)continue;
  let parsed;try{parsed=JSON.parse(m[2].trim())}catch{continue}
  const recipe=findRecipe(parsed);if(!recipe)continue;
  const title=maxField(recipe.name||recipe.headline||'',200);
  const ingredients=[].concat(recipe.recipeIngredient||[]).filter(x=>typeof x==='string').map(x=>maxField(x,400)).filter(Boolean).slice(0,100);
  const steps=instructions(recipe.recipeInstructions).filter(Boolean).slice(0,100);
  if(title&&ingredients.length&&steps.length)return {title,ingredients,steps};
 }
 return null;
}
