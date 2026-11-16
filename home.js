import {requiresAccount} from './hub.js';
import {recipePhotoPath} from './recipe-gallery.js';

const hero="<section class=\"studio-hero\" aria-label=\"Backen mit Sauerteig\">\n  <div class=\"studio-hero-copy\"><h1>Backen mit <em>Sauerteig</em></h1></div>\n  <div class=\"studio-hero-picture\"><img src=\"/design/buddy-original.webp\" width=\"1440\" height=\"960\" alt=\"Aquarell eines Sauerteigglases und eines frisch gebackenen Brotes\" fetchpriority=\"high\" decoding=\"async\"></div>\n</section>";
const quickstart="<section class=\"studio-quick\" aria-label=\"Schnellstart\"><button class=\"studio-primary\" data-act=\"newPlan\"><span class=\"studio-primary-icon\" aria-hidden=\"true\">+</span><span class=\"studio-primary-copy\"><strong>Lass uns backen!</strong><small>Such dir ein Rezept aus.</small></span><span class=\"studio-chevron\" aria-hidden=\"true\">›</span></button><button class=\"studio-text-link\" data-act=\"newRecipe\">Starte mit deinem eigenen Rezept. <span aria-hidden=\"true\">→</span></button></section>";
const inspiration="<section class=\"studio-inspiration\" aria-label=\"Rezeptideen\"><div class=\"studio-section-head\"><h2>Inspiration für dein nächstes Brot</h2></div><div class=\"studio-photo-rail\"><button class=\"studio-photo-item\" data-act=\"recipe:starter-weizen-landbrot\"><img src=\"/design/starter-weizen-landbrot.webp\" alt=\"KI-generiertes Beispielbild für Helles Weizen-Landbrot\" loading=\"lazy\" decoding=\"async\" width=\"240\" height=\"160\"><span>Helles Weizen-Landbrot</span></button><button class=\"studio-photo-item\" data-act=\"recipe:starter-bauernbrot-70-30\"><img src=\"/design/starter-bauernbrot-70-30.webp\" alt=\"KI-generiertes Beispielbild für Bauernmischbrot 70/30\" loading=\"lazy\" decoding=\"async\" width=\"240\" height=\"160\"><span>Bauernmischbrot 70/30</span></button><button class=\"studio-photo-item\" data-act=\"recipe:starter-dinkel-saaten\"><img src=\"/design/starter-dinkel-saaten.webp\" alt=\"KI-generiertes Beispielbild für Dinkelvollkorn-Saatenbrot\" loading=\"lazy\" decoding=\"async\" width=\"240\" height=\"160\"><span>Dinkelvollkorn-Saatenbrot</span></button></div><button class=\"studio-head-link\" data-act=\"recipes\">Alle Rezepte <span aria-hidden=\"true\">→</span></button></section>";
const directoryGroups=[
 [
  "REZEPTE & BACKTAGE",
  [
   [
    "recipes",
    "book",
    "Rezeptbibliothek",
    "Alle Rezepte und Ideen ansehen"
   ],
   [
    "own",
    "library",
    "Meine Rezepte",
    "Eigene Rezepte bearbeiten"
   ],
   [
    "import",
    "upload",
    "Rezept importieren",
    "Aus Link, Text oder Foto"
   ],
   [
    "bakingDays",
    "calendar",
    "Aktuelle Backvorgänge",
    "Laufende und geplante Abläufe"
   ]
  ]
 ],
 [
  "WISSEN & HELFER",
  [
   [
    "shopping",
    "basket",
    "Einkaufsliste",
    "Zutaten für deine Rezepte"
   ],
   [
    "favorites",
    "heart",
    "Favoriten",
    "Gespeicherte Lieblingsrezepte"
   ],
   [
    "stats",
    "chart",
    "Backstatistik",
    "Deine dokumentierten Backergebnisse"
   ],
   [
    "knowledge",
    "help",
    "Wissensbibliothek",
    "Sauerteig, Teigführung und Tipps"
   ],
   [
    "community",
    "users",
    "Backbücher",
    "Rezepte aus der Community"
   ]
  ]
 ]
];
function directory(signed){
 return '<section class="studio-directory" aria-label="Alle Bereiche">'+directoryGroups.map(([title,items])=>
  '<div class="studio-directory-group"><h2>'+title+'</h2><div class="studio-directory-list">'+items.filter(([action])=>signed||!requiresAccount(action)).map(([action,image,label,description])=>
   '<button class="studio-directory-row" data-act="'+action+'"><span class="studio-mini-art"><img src="/design/menu-'+image+'.svg" alt="" loading="lazy"></span><span class="studio-directory-copy"><strong>'+label+'</strong><small>'+description+'</small></span><span class="studio-chevron" aria-hidden="true">›</span></button>'
  ).join('')+'</div></div>').join('')+'</section>';
}
const buddy="<section class=\"studio-buddy-row\"><button data-act=\"buddy\"><span aria-hidden=\"true\" class=\"studio-buddy-mark\">✦</span><span><strong>KI Buddy</strong><small>Dein Backchat im Plus-Abo. Frag zum Beispiel: „Warum geht mein Teig nicht auf?“</small></span><span aria-hidden=\"true\" class=\"studio-chevron\">›</span></button></section>";
const fmtDate=h=>{const value=h?.finishedAt||h?.date;if(!value)return '';const d=new Date(value);return Number.isNaN(+d)?String(value):d.toLocaleDateString('de-DE',{day:'2-digit',month:'short'})};
const starLabel=n=>Number.isFinite(Number(n))&&Number(n)>0?'★'.repeat(Math.min(5,Math.round(Number(n)))):'';
export function homeView({signed=false,active=null,parked=[],history=[],favorites=[],recipes=[],escape=x=>String(x)}={}){
 const sessions=[...(active?[{bake:active,action:'backtag'}]:[]),...(Array.isArray(parked)?parked:[]).map((bake,i)=>({bake,action:'switchBake:'+i}))];
 const count=sessions.length;
 const next=count?'<section class="studio-active"><div class="studio-section-head"><h2>Deine nächsten Backschritte</h2><button class="studio-head-link" data-act="bakingDays">Alle anzeigen →</button></div><div class="studio-active-list">'+sessions.slice(0,2).map(({bake,action})=>{
  const steps=Array.isArray(bake?.steps)?bake.steps:[],idx=Math.max(0,Number(bake?.index)||0);
  const nextStep=steps.slice(idx).find(s=>s&&s.active!==false&&s.at&&Number.isFinite(new Date(s.at).getTime()));
  const when=nextStep?.at?new Date(nextStep.at).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
  return '<button class="studio-active-row" data-act="'+action+'"><span class="studio-active-dot" aria-hidden="true"></span><span><strong>'+escape(bake?.title||'Backtag')+'</strong><small>'+escape(nextStep?.title||'Zum Backtag')+(when?' · '+escape(when):'')+'</small></span><span class="studio-chevron" aria-hidden="true">›</span></button>';
 }).join('')+'</div></section>':'';
 const recent=signed&&Array.isArray(history)&&history.length?'<section class="studio-history"><div class="studio-section-head"><h2>Zuletzt gebacken</h2><button class="studio-head-link" data-act="history">Alle anzeigen →</button></div><div class="studio-photo-rail">'+history.slice(-3).reverse().map(h=>'<button class="studio-photo-item" data-act="history"><img src="'+recipePhotoPath(h)+'" alt="KI-generiertes Beispielbild, kein persönliches Backfoto" loading="lazy" decoding="async"><span>'+escape(h?.title||'Backtag')+'</span><small>'+escape(fmtDate(h))+' '+starLabel(h?.rating)+'</small></button>').join('')+'</div></section>':'';
 return hero+(signed?quickstart:'')+(signed?next:'')+inspiration+recent+directory(signed)+buddy;
}

export function upcomingBakeTasks(active=null,parked=[]){
 const bakes=[...(active?[{record:active,action:'backtag'}]:[]),...parked.map((record,i)=>({record,action:'switchBake:'+i}))];
 return bakes.map(({record,action})=>{
  const start=Math.max(0,Math.min(record.steps?.length||0,Math.trunc(Number(record.index)||0)));
  const step=(record.steps||[]).slice(start).find(item=>item&&item.active!==false&&Number.isFinite(new Date(item.at).getTime()));
  return step?{title:record.title,task:step.title,at:new Date(step.at).getTime(),action}:null;
 }).filter(Boolean).sort((a,b)=>a.at-b.at);
}
export function bakingDaysView({active=null,parked=[],escape=e=>String(e)}){
 const n=(active?1:0)+parked.length;
 if(!n)return '<section class="card"><p class="muted">Du hast noch keinen Backvorgang gestartet.</p><button class="primary" data-act="newPlan">Etwas backen</button></section>';
 const tasks=upcomingBakeTasks(active,parked).slice(0,5);
 const upcoming=tasks.length?'<div class="baking-day-next"><h3>Nächste Arbeitsschritte</h3>'+tasks.map(item=>{
  const stamp=new Date(item.at).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  return '<button class="baking-day-task" data-act="'+item.action+'"><span><strong>'+escape(item.task)+'</strong><small>'+escape(item.title)+'</small></span><time>'+escape(stamp)+'</time></button>';
 }).join('')+'</div>':'';
 const ongoing=(active?'<button class="item" data-act="backtag"><strong>'+escape(active.title)+'</strong><span class="muted">Aktiv · Schritt '+((active.index||0)+1)+' von '+active.steps.length+'</span></button>':'');
 const parkedBakes=parked.map((b,i)=>'<button class="item" data-act="switchBake:'+i+'"><strong>'+escape(b.title)+'</strong><span class="muted">Schritt '+((b.index||0)+1)+' von '+(b.steps?.length||0)+'</span></button>').join('');
 return '<section class="card"><p class="muted">'+(n===1?'1 laufender Backvorgang':n+' laufende Backvorgänge')+'</p>'+upcoming+ongoing+parkedBakes+'<button data-act="newPlan">Noch etwas backen</button></section>';
}
