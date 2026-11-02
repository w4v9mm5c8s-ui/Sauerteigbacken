import {icon} from './icons.js';

const tiles=[
 ['Neues Brot planen','Zutaten und Zeiten','newPlan','calendar','/design/tile-plan.png'],
 ['Meine Rezepte','Deine Rezeptsammlung','own','book','/design/tile-recipes.png'],
 ['Rezeptbibliothek','26 geprüfte Vorlagen','recipes','library','/design/tile-backtage.png'],
 ['Historische Rezepte','Dokumentierte Rezeptstände','historical','book','/design/photo-rustikal.png'],
 ['Favoriten','Deine Lieblingsrezepte','favorites','heart','/design/tile-favoriten.png'],
 ['Community-Backbuch','Rezepte entdecken','community','users','/design/tile-backbuecher.png'],
 ['Rezept importieren','Foto, Text oder Link','import','upload','/design/tile-import.png'],
 ['Meine Brote','Backhistorie','history','bread','/design/photo-landbrot.png'],
 ['Meine Backstatistik','Deine Backergebnisse','stats','chart','/design/tile-statistik.png'],
 ['Rechner & Helfer','Mengen und Hydration','calculator','calculator','/design/tile-import.png']
];
export function hubView(button,user,historyCount,ownCount){
 return '<section class="hub-actions" aria-label="Backen und Rezepte">'+tiles.map(([title,subtitle,route,symbol,art],i)=>{
 const visual=art?'<img src="'+art+'" alt="" loading="lazy" decoding="async">':'';
 return '<button class="hub-tile '+(i===0?'featured':'')+'" data-act="'+route+'"><span class="hub-icon '+(art?'has-art':'')+'" aria-hidden="true">'+visual+'<span class="hub-line-icon">'+icon(symbol,art?19:45)+'</span></span><span class="hub-text"><strong>'+title+'</strong><small>'+subtitle+'</small></span><span class="hub-arrow" aria-hidden="true"></span></button>';
 }).join('')+'</section>';
}
