import {icon} from './icons.js';
export function recipePhotoPath(r){
 const title=String(r?.title||'').toLocaleLowerCase('de-DE');
 const category=String(r?.category||'').toLocaleLowerCase('de-DE');
 if(/brezel|laugen|bagel/.test(title))return '/art-pretzel.svg';
 if(/kasten|toast/.test(title))return '/design/photo-kasten.png';
 if(/vollkorn|saat|kern|nuss|leinsamen|mohn|sonnenblum/.test(title))return '/design/photo-vollkorn.png';
 if(/roggen|bauern|misch|vinschgauer/.test(title))return '/design/photo-bauernbrot.png';
 if(/ciabatta|baguette|semmel|bröt|seele|kleingebäck/.test(title+' '+category))return '/design/photo-rustikal.png';
 if(/pizza|focaccia|zimtschneck/.test(title))return '/design/photo-helles.png';
 if(/weizen|hell|dinkel/.test(title))return '/design/photo-helles.png';
 return '/design/photo-landbrot.png';
}
function artwork(r){return recipePhotoPath(r)}

export function recipeCards(recipes,escape=x=>String(x),action='recipe'){
 return recipes.map(r=>'<button class="recipe-gallery-item" data-act="'+action+':'+escape(r.id)+'"><span class="recipe-gallery-picture"><img src="'+artwork(r)+'" alt="KI-generiertes Beispielbild" loading="lazy" decoding="async"></span><span class="recipe-gallery-content"><strong>'+escape(r.title)+'</strong><small>'+escape(r.category||'Sauerteig')+' · '+escape(r.yieldLabel||'Rezept')+'</small></span><span class="recipe-gallery-arrow">'+icon('arrow',19)+'</span></button>').join('')||'<p class="muted">Keine passenden Rezepte.</p>';
}

export function recipePicker(recipes,escape=x=>String(x)){return '<section class="card"><span class="hero-kicker">NEUER BACKTAG</span><h2>Was möchtest du backen?</h2><p class="muted">Wähle zuerst ein Rezept. Danach legst du Menge und Backzeit fest.</p><label for="pickRecipeSearch">Rezept suchen</label><input id="pickRecipeSearch" placeholder="Brot, Brötchen, Brezeln …"><div id="pickRecipeResults" class="recipe-gallery">'+recipeCards(recipes,escape,'selectForPlan')+'</div></section>'}

export function filterRecipeLibrary(recipes,query='',category=''){
 const q=String(query||'').trim().toLocaleLowerCase('de-DE');
 const c=String(category||'').trim();
 return recipes.filter(r=>{
  if(c&&r.category!==c)return false;
  const searchable=[r.title,r.category,r.yieldLabel,...(r.flours||[]).map(x=>x.name),...(r.extras||[]).map(x=>x.name)].join(' ').toLocaleLowerCase('de-DE');
  return !q||searchable.includes(q);
 });
}
export function recipeCategoryOptions(recipes,escape=x=>String(x)){
 const categories=[...new Set(recipes.map(r=>r.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
 const options='<option value="">Alle Kategorien</option>'+categories.map(category=>'<option value="'+escape(category)+'">'+escape(category)+'</option>').join('');
 const chips=[['Alle',''],['Brote','Brot'],['Brötchen','Brötchen'],['Süßes','Süßgebäck']];
 return '<div class="recipe-categories" role="group" aria-label="Rezeptkategorien">'+chips.filter(([label,value])=>!value||categories.includes(value)).map(([label,value])=>'<button type="button" class="recipe-category-chip" data-act="recipeCat:'+escape(value)+'" aria-pressed="'+(!value?'true':'false')+'">'+label+'</button>').join('')+'<label class="recipe-category-more"><span>Mehr</span><select id="recipeCategory" aria-label="Weitere Kategorien">'+options+'</select></label></div>';
}
