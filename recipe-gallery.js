import {icon} from './icons.js';
function artwork(r){
 const title=String(r.title||'').toLocaleLowerCase('de-DE'),category=String(r.category||'').toLocaleLowerCase('de-DE');
 if(/brezel|laugen|bagel/.test(title))return '/art-pretzel.svg';
 if(/bröt|semmel|baguette|seele|bagel/.test(title)||/kleingebäck|brötchen/.test(category))return '/art-basket.svg';
 if(/pizza|focaccia/.test(title))return '/art-tools.svg';
 return '/art-loaf.svg';
}
export function recipeCards(recipes,escape=x=>String(x),action='recipe'){
 return recipes.map(r=>'<button class="recipe-gallery-item" data-act="'+action+':'+escape(r.id)+'"><span class="recipe-gallery-picture"><img src="'+artwork(r)+'" alt="" loading="lazy" decoding="async"></span><span class="recipe-gallery-content"><strong>'+escape(r.title)+'</strong><small>'+escape(r.category||'Sauerteig')+' · '+escape(r.yieldLabel||'Rezept')+'</small></span><span class="recipe-gallery-arrow">'+icon('arrow',19)+'</span></button>').join('')||'<p class="muted">Keine passenden Rezepte.</p>';
}

export function recipePicker(recipes,escape=x=>String(x)){return '<section class="card"><span class="hero-kicker">NEUER BACKTAG</span><h2>Was möchtest du backen?</h2><p class="muted">Wähle zuerst ein Rezept. Danach legst du Menge und Backzeit fest.</p><label for="pickRecipeSearch">Rezept suchen</label><input id="pickRecipeSearch" placeholder="Brot, Brötchen, Brezeln …"><div id="pickRecipeResults" class="recipe-gallery">'+recipeCards(recipes,escape,'selectForPlan')+'</div></section>'}
