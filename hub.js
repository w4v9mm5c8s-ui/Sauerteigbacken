import {icon} from './icons.js';
const memberActions=new Set(['newPlan','newRecipe','planFromRecipe','bakeChoice','recipeSelect','recipeBuilder','plan','calculate','saveBake','backtag','bakingDays','own','import','history','stats','favorites','favorite','shopping','starters','blendSave','blendPlan','selectForPlan','switchBake','pdfPlan']);
export const requiresAccount=action=>memberActions.has(action.split(':')[0]);
const groups=[
 {title:'PLANEN & BEGLEITEN',items:[
  ['Aktuelle Backvorgänge','Laufende Teige und Backschritte','bakingDays','calendar'],
  ['Meine Starter','Starter füttern, messen und verwalten','starters','flask'],
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
  ['Backrechner für Sauerteig','Starter füttern, Gehzeit schätzen und Wassermengen berechnen','pdfTools','calculator'],
  ['Community-Backbuch','Rezepte aus der Community','community','users'],
  ['Sauerteig Plus','KI Buddy, Funktionen und Abomodelle','billing','sparkles']
 ]}
];
export function hubView(button,user=false,historyCount=0,ownCount=0){
 return '<div class="studio-hub-intro"><span class="studio-overline">BACKEN</span><h2>Alles für deinen nächsten Backtag.</h2><p>Vom Rezept bis zum frischen Brot – deine Schritte an einem Ort.</p></div>'+
 (user?'<div class="bake-hub-paths"><button class="studio-primary studio-hub-primary" data-act="planFromRecipe"><span class="studio-primary-icon" aria-hidden="true">+</span><span class="studio-primary-copy"><strong>Lass uns backen!</strong><small>Such dir ein Rezept aus.</small></span><span class="studio-chevron" aria-hidden="true">›</span></button><button class="bake-hub-secondary" data-act="newRecipe"><span class="bake-hub-secondary-icon">'+icon('calculator',22)+'</span><span><strong>Eigenes Rezept erstellen</strong><small>Mehl, Mengen und Zutaten festlegen</small></span><span class="studio-chevron" aria-hidden="true">›</span></button></div>':'')+
 groups.map(group=>({...group,items:group.items.filter(item=>user||!requiresAccount(item[2]))})).filter(group=>group.items.length).map(group=>'<section class="studio-hub-group"><h3>'+group.title+'</h3><div class="studio-hub-list">'+group.items.map(([title,description,action,symbol])=>'<button class="studio-hub-row" data-act="'+action+'"><span class="studio-hub-row-icon">'+icon(symbol,21)+'</span><span class="studio-hub-row-text"><strong>'+title+'</strong><small>'+description+'</small></span><span class="studio-chevron" aria-hidden="true">›</span></button>').join('')+'</div></section>').join('');
}
