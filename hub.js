import {icon} from './icons.js';

const tiles=[
 ['Neues Brot planen','Zutaten und Zeiten','plan','calendar','/art-calendar.svg'],
 ['Meine Rezepte','Deine Rezeptsammlung','own','book','/art-books.svg'],
 ['Rezeptbibliothek','26 geprüfte Vorlagen','recipes','library','/art-basket.svg'],
 ['Historische Rezepte','Dokumentierte Rezeptstände','historical','book','/art-loaf.svg'],
 ['Favoriten','Deine Lieblingsrezepte','favorites','heart',null],
 ['Community-Backbuch','Rezepte entdecken','community','users','/art-buddy.svg'],
 ['Rezept importieren','Foto, Text oder Link','import','upload','/art-tools.svg'],
 ['Meine Brote','Backhistorie','history','bread','/art-loaf.svg'],
 ['Meine Backstatistik','Deine Backergebnisse','stats','chart',null],
 ['Rechner & Helfer','Mengen und Hydration','calculator','calculator','/art-scale.svg']
];
export function hubView(button,user,historyCount,ownCount){
 return '<section class="hub-actions" aria-label="Backen und Rezepte">'+tiles.map(([title,subtitle,route,symbol,art],i)=>{
 const visual=art?'<img src="'+art+'" alt="" loading="lazy" decoding="async">':'';
 return '<button class="hub-tile '+(i===0?'featured':'')+'" data-act="'+route+'"><span class="hub-icon" aria-hidden="true">'+visual+'<span class="hub-line-icon">'+icon(symbol,art?19:45)+'</span></span><span class="hub-text"><strong>'+title+'</strong><small>'+subtitle+'</small></span><span class="hub-arrow" aria-hidden="true"></span></button>';
 }).join('')+'</section>';
}
