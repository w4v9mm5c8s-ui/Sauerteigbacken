import {icon} from './icons.js';
const catalogPhotos = new Map([
  ["starter-weizen-landbrot", "Helles Weizen-Landbrot"],
  ["starter-weizenvollkorn", "Saftiges Weizenvollkornbrot"],
  ["starter-bauernbrot-70-30", "Bauernmischbrot 70/30"],
  ["starter-roggenmisch-60-40", "Kräftiges Roggenmischbrot 60/40"],
  ["starter-roggenvollkorn-kasten", "Roggenvollkorn-Kastenbrot"],
  ["starter-dinkel-hell", "Mildes Dinkelbrot"],
  ["starter-dinkel-saaten", "Dinkelvollkorn-Saatenbrot"],
  ["starter-kartoffel-weizen", "Kartoffel-Weizenbrot"],
  ["starter-walnuss", "Walnuss-Sauerteigbrot"],
  ["starter-kuerbiskern", "Kürbiskernbrot"],
  ["starter-hafer-kasten", "Haferflocken-Kastenbrot"],
  ["starter-emmer-weizen", "Emmer-Weizen-Laib"],
  ["starter-baguette", "Sauerteig-Baguettes"],
  ["starter-ciabatta", "Luftiges Sauerteig-Ciabatta"],
  ["starter-focaccia", "Rosmarin-Sauerteig-Focaccia"],
  ["starter-pizza", "Sauerteig-Pizzateig"],
  ["starter-weizensemmeln", "Knusprige Sauerteig-Semmeln"],
  ["starter-roggenbroetchen", "Rustikale Roggenbrötchen"],
  ["starter-dinkelseelen", "Schwäbische Dinkelseelen mit Sauerteig"],
  ["starter-saatensemmeln", "Kernige Sauerteig-Saatensemmeln"],
  ["starter-vinschgauer", "Vinschgauer Paarlen"],
  ["starter-bagels", "Sauerteig-Bagels"],
  ["starter-natronstangen", "Sauerteig-Laugenstangen"],
  ["starter-toastbrot", "Weiches Sauerteig-Toastbrot"],
  ["starter-zimtschnecken", "Sauerteig-Zimtschnecken"],
  ["starter-sauerteig-brezeln", "Sauerteig-Laugenbrezeln"],
  ["pdf-weizen550", "Weizenbrot Type 550"],
  ["pdf-ruch-altbrot", "Ruchbrot mit Weizenprotein und Altbrot"],
  ["pdf-roggen1150", "Roggenbrot Type 1150"],
  ["pdf-manitoba-walnuss", "Manitoba-Brot mit Walnussfüllung"],
  ["pdf-dinkel-koerner", "Dinkelbrot mit Körnern"],
  ["pdf-proteinbrot", "Proteinbrot"],
  ["pdf-airfryer", "Weizenbrot aus dem Airfryer"],
  ["pdf-joghurt", "Sauerteig-Joghurtbrötchen"],
  ["pdf-toast", "Sauerteig-Toastbrot"],
]);
const photoByTitle = new Map([...catalogPhotos].map(([id,title]) => [title.toLocaleLowerCase("de-DE"), id]));
export function recipePhotoPath(r){
 if(/^https:\/\/pantrymama\.com\/wp-content\/uploads\/[A-Za-z0-9_./%-]+$/.test(r?.sourcePhoto||''))return r.sourcePhoto;
 const id = catalogPhotos.has(r?.id) ? r.id : photoByTitle.get(String(r?.title || "").toLocaleLowerCase("de-DE"));
 if (id) return "/design/" + id + ".webp";
 const title=String(r?.title||'').toLocaleLowerCase('de-DE');
 const category=String(r?.category||'').toLocaleLowerCase('de-DE');
 if(/brezel|laugen/.test(title))return '/design/starter-sauerteig-brezeln.webp';
 if(/bagel/.test(title))return '/design/starter-bagels.webp';
 if(/baguette/.test(title))return '/design/starter-baguette.webp';
 if(/focaccia/.test(title))return '/design/starter-focaccia.webp';
 if(/pizza/.test(title))return '/design/starter-pizza.webp';
 if(/zimtschneck/.test(title))return '/design/starter-zimtschnecken.webp';
 if(/kasten|toast/.test(title))return '/design/starter-toastbrot.webp';
 if(/vollkorn|saat|kern|nuss|leinsamen|mohn|sonnenblum/.test(title))return '/design/starter-dinkel-saaten.webp';
 if(/roggen|bauern|misch|vinschgauer/.test(title))return '/design/starter-bauernbrot-70-30.webp';
 if(/ciabatta|baguette|semmel|bröt|seele|kleingebäck/.test(title+' '+category))return '/design/starter-weizensemmeln.webp';
 if(/pizza|focaccia|zimtschneck/.test(title))return '/design/starter-weizen-landbrot.webp';
 if(/weizen|hell|dinkel/.test(title))return '/design/starter-weizen-landbrot.webp';
 return '/design/starter-weizen-landbrot.webp';
}
function artwork(r){return recipePhotoPath(r)}

export function recipeCards(recipes,escape=x=>String(x),action='recipe',favorites=[]){
 const savedIds=Array.isArray(favorites)?favorites:[];
 return recipes.map(r=>{
  const id=escape(r.id),saved=savedIds.includes(r.id);
  const actionButton='<button type="button" class="recipe-gallery-main" data-act="'+action+':'+id+'"><span class="recipe-gallery-picture"><img src="'+recipePhotoPath(r)+'" alt="'+(r.sourcePhoto?'Originalfoto von The Pantry Mama: ':'KI-generiertes Beispielbild: ')+escape(r.title)+'" referrerpolicy="no-referrer" loading="lazy" decoding="async"></span><span class="recipe-gallery-content"><strong>'+escape(r.title)+'</strong><small>'+escape(r.category||'Sauerteig')+' · '+escape(r.yieldLabel||'Rezept')+'</small></span>'+(action==='recipe'?'':'<span class="recipe-gallery-arrow">'+icon('arrow',19)+'</span>')+'</button>';
  const favorite=action==='recipe'?'<button type="button" class="recipe-gallery-fav '+(saved?'is-favorite':'')+'" data-act="favorite:'+id+'" aria-label="'+(saved?'Aus Favoriten entfernen':'Zu Favoriten hinzufügen')+'" aria-pressed="'+saved+'">'+icon('heart',20)+'</button>':'';
  return '<article class="recipe-gallery-item">'+actionButton+favorite+'</article>';
 }).join('')||'<p class="muted">Keine passenden Rezepte.</p>';
}

export function recipePicker(recipes,escape=x=>String(x)){return '<section class="card"><h2>Was möchtest du backen?</h2><label for="pickRecipeSearch">Rezept suchen</label><input id="pickRecipeSearch" placeholder="Brot, Brötchen, Brezeln …"><div id="pickRecipeResults" class="recipe-gallery">'+recipeCards(recipes,escape,'selectForPlan')+'</div></section>'}

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
