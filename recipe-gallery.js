import {icon} from './icons.js';
function artwork(r){
 const title=String(r.title||'').toLocaleLowerCase('de-DE'),category=String(r.category||'').toLocaleLowerCase('de-DE');
 if(/brezel|laugen|bagel/.test(title))return '/art-pretzel.svg';
 if(/bröt|semmel|baguette|seele|bagel/.test(title)||/kleingebäck|brötchen/.test(category))return '/art-basket.svg';
 if(/pizza|focaccia/.test(title))return '/art-tools.svg';
 return '/art-loaf.svg';
}
export function recipeCards(recipes,escape=x=>String(x)){
 return recipes.map(r=>'<button class="recipe-gallery-item" data-act="recipe:'+escape(r.id)+'"><span class="recipe-gallery-picture"><img src="'+artwork(r)+'" alt="" loading="lazy" decoding="async"></span><span class="recipe-gallery-content"><strong>'+escape(r.title)+'</strong><small>'+escape(r.category||'Sauerteig')+' · '+escape(r.yieldLabel||'Rezept')+'</small></span><span class="recipe-gallery-arrow">'+icon('arrow',19)+'</span></button>').join('')||'<p class="muted">Keine passenden Rezepte.</p>';
}
