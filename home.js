import {icon} from './icons.js';

const tiles=[
 ['Neues Brot planen','newPlan','/art-calendar.svg'],
 ['Meine Rezepte','own','/art-books.svg'],
 ['Rezept importieren','import','/art-tools.svg'],
 ['Meine Backtage','bakingDays','/art-loaf.svg'],
 ['Backstatistik','stats','/art-chart.svg'],
 ['Favoriten','favorites','/art-heart.svg'],
 ['Wissensbibliothek','knowledge','/art-books.svg'],
 ['Einkaufsliste','shopping','/art-shopping.svg']
];

const displayTitle=label=>({'Backstatistik':'Back-<wbr>statistik','Wissensbibliothek':'Wissens-<wbr>bibliothek','Einkaufsliste':'Einkaufs-<wbr>liste'}[label]||label);
const dateLabel=h=>{const value=h.finishedAt||h.date;if(!value)return '';const parsed=new Date(value);return Number.isNaN(+parsed)?String(value):parsed.toLocaleDateString('de-DE',{day:'2-digit',month:'short'})};
const stars=x=>Number.isFinite(Number(x))&&Number(x)>0?'★'.repeat(Math.min(5,Math.max(1,Math.round(Number(x))))):'';

export function homeView({signed=false,active=null,parked=[],history=[],favorites=[],recipes=[],escape=e=>String(e)}){
 const activeCount=(active?1:0)+parked.length;
 const hero='<section class="home-masthead"><div class="home-brand"><h1>Backen mit <svg class="brand-heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="35" height="35" fill="none" stroke="#b67a79" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 37C8 26 2 16 8 8q7-8 15 6 10-17 18-9 7 10-18 32z"/><path d="M24 38q-2-10 1-19" opacity=".42"/></svg><em>Sauerteig</em></h1><p>Dein Begleiter für natürliches Brotbacken.</p></div><div class="home-artwork"><img src="/art-hero.svg" width="950" height="455" alt="" decoding="async" fetchpriority="high"></div></section>';
 const live=active?'<section class="home-current"><div class="home-current-picture"><img src="/art-loaf.svg" alt=""></div><div class="home-current-copy"><span class="home-current-label">'+icon('calendar',18)+' Dein Backtag</span><h2>'+escape(active.title)+'</h2><p>Schritt '+(Math.min(active.steps?.length||1,(active.index||0)+1))+' von '+(active.steps?.length||1)+(activeCount>1?' · '+activeCount+' Backtage parallel':'')+'</p></div><button data-act="backtag" class="home-current-button" aria-label="Backtag öffnen">'+icon('arrow',21)+' <span>Zum Backtag</span></button></section>':'';
 const grid='<section class="home-feature-grid" aria-label="Backen mit Sauerteig Funktionen">'+tiles.map(([label,route,art])=>'<button class="home-feature" data-act="'+route+'"><span class="home-feature-art"><img src="'+art+'" alt="" loading="lazy" decoding="async" width="240" height="200"></span><span class="home-feature-label">'+displayTitle(label)+'</span></button>').join('')+'</section>';
 const recent=signed&&history.length?'<section class="home-recent"><div class="home-section-heading"><h2>Zuletzt gebacken</h2><button data-act="history">Alle anzeigen '+icon('arrow',18)+'</button></div><div class="home-recent-grid">'+history.slice(-3).reverse().map((h,i)=>'<button class="home-recent-card" data-act="history"><div class="home-recent-art"><img src="'+(i===2?'/art-basket.svg':'/art-loaf.svg')+'" alt="" loading="lazy"></div><strong>'+escape(h.title||'Backtag')+'</strong><small class="home-stars">'+(stars(h.rating)||'Noch nicht bewertet')+'</small><small>'+escape(dateLabel(h))+'</small></button>').join('')+'</div></section>':'';
 const buddy=signed?'<button class="home-buddy" data-act="buddy"><img src="/art-buddy.svg" alt="" loading="lazy" width="150" height="135"><span><strong>Sauerteig-Buddy</strong><small>Dein KI-Assistent für Rezepte, Planung und Backfragen</small></span><span class="home-buddy-arrow">'+icon('arrow',22)+'</span></button>':'';
 return hero+live+grid+recent+buddy;
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
 if(!n)return '<section class="card"><h2>Meine Backtage</h2><p class="muted">Aktuell läuft noch kein Backtag.</p><button class="primary" data-act="newPlan">Neuen Backtag planen</button></section>';
 const tasks=upcomingBakeTasks(active,parked).slice(0,5);
 const upcoming=tasks.length?'<div class="baking-day-next"><h3>Nächste Arbeitsschritte</h3>'+tasks.map(item=>{
  const stamp=new Date(item.at).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  return '<button class="baking-day-task" data-act="'+item.action+'"><span><strong>'+escape(item.task)+'</strong><small>'+escape(item.title)+'</small></span><time>'+escape(stamp)+'</time></button>';
 }).join('')+'</div>':'';
 const ongoing=(active?'<button class="item" data-act="backtag"><strong>'+escape(active.title)+'</strong><span class="muted">Aktiv · Schritt '+((active.index||0)+1)+' von '+active.steps.length+'</span></button>':'');
 const parkedBakes=parked.map((b,i)=>'<button class="item" data-act="switchBake:'+i+'"><strong>'+escape(b.title)+'</strong><span class="muted">Schritt '+((b.index||0)+1)+' von '+(b.steps?.length||0)+'</span></button>').join('');
 return '<section class="card"><h2>Meine Backtage</h2><p class="muted">'+n+' laufende Backtage</p>'+upcoming+ongoing+parkedBakes+'<button data-act="newPlan">Weiteren Backtag planen</button></section>';
}
