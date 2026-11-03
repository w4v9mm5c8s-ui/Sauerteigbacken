import {icon} from './icons.js';
const groups=[
 {title:'PLANEN & BEGLEITEN',items:[
  ['Meine Backtage','Laufende Teige und Backschritte','bakingDays','calendar'],
  ['Rezeptbibliothek','Alle Sauerteigrezepte','recipes','book'],
  ['Meine Rezepte','Deine eigenen Kreationen','own','library'],
  ['Rezept importieren','Per Link, Foto oder Text','import','upload']
 ]},
 {title:'DEINE ERGEBNISSE',items:[
  ['Meine Brote','Backhistorie und Notizen','history','bread'],
  ['Favoriten','Deine gemerkten Rezepte','favorites','heart'],
  ['Meine Backstatistik','Auswertungen deiner Backtage','stats','chart']
 ]},
 {title:'MEHR ENTDECKEN',items:[
  ['Rechner & Helfer','Hydration, Mengen und Zeiten','calculator','calculator'],
  ['Community-Backbuch','Rezepte aus der Community','community','users'],
  ['Historische Rezepte','Überlieferte Rezepte entdecken','historical','book']
 ]}
];
export function hubView(button,user=false,historyCount=0,ownCount=0){
 return '<div class="studio-hub-intro"><span class="studio-overline">BACKEN</span><h2>Alles für deinen nächsten Backtag.</h2><p>Vom Rezept bis zum frischen Brot – deine Schritte an einem Ort.</p></div>'+
 '<div class="bake-hub-paths"><button class="studio-primary studio-hub-primary" data-act="newPlan"><span class="studio-primary-icon" aria-hidden="true">+</span><span class="studio-primary-copy"><strong>Backtag planen</strong><small>Rezept auswählen und Ablauf planen</small></span><span class="studio-chevron" aria-hidden="true">›</span></button><button class="bake-hub-secondary" data-act="newRecipe"><span class="bake-hub-secondary-icon">'+icon('calculator',22)+'</span><span><strong>Eigenes Rezept berechnen oder erstellen</strong><small>Mehlmischung, Mengen und Zutaten zusammenstellen</small></span><span class="studio-chevron" aria-hidden="true">›</span></button></div>'+
 '<div class="studio-hub-photo"><img src="/design/photo-landbrot.png" alt="KI-generiertes Sauerteigbrot" loading="lazy"><span>Du suchst noch ein passendes Rezept?</span><button data-act="recipes">Rezeptbibliothek öffnen <span aria-hidden="true">→</span></button></div>'+
 groups.map(group=>'<section class="studio-hub-group"><h3>'+group.title+'</h3><div class="studio-hub-list">'+group.items.map(([title,description,action,symbol])=>'<button class="studio-hub-row" data-act="'+action+'"><span class="studio-hub-row-icon">'+icon(symbol,21)+'</span><span class="studio-hub-row-text"><strong>'+title+'</strong><small>'+description+'</small></span><span class="studio-chevron" aria-hidden="true">›</span></button>').join('')+'</div></section>').join('');
}
