import {icon} from './icons.js';
import {recipePhotoPath} from './recipe-gallery.js';

const tiles=[
 ['Neues Brot planen','newPlan','/design/tile-plan.png'],
 ['Meine Rezepte','recipes','/design/tile-recipes.png'],
 ['Rezept importieren','import','/design/tile-import.png'],
 ['Meine Backtage','bakingDays','/design/tile-backtage.png'],
 ['Backstatistik','stats','/design/tile-statistik.png'],
 ['Favoriten','favorites','/design/tile-favoriten.png'],
 ['Backbücher','community','/design/tile-backbuecher.png'],
 ['Wissensbibliothek','knowledge','/design/tile-wissen.png']
];

const displayTitle=label=>({'Backstatistik':'Back-<wbr>statistik','Wissensbibliothek':'Wissens-<wbr>bibliothek','Einkaufsliste':'Einkaufs-<wbr>liste'}[label]||label);
const dateLabel=h=>{const value=h.finishedAt||h.date;if(!value)return '';const parsed=new Date(value);return Number.isNaN(+parsed)?String(value):parsed.toLocaleDateString('de-DE',{day:'2-digit',month:'short'})};
const stars=x=>Number.isFinite(Number(x))&&Number(x)>0?'★'.repeat(Math.min(5,Math.max(1,Math.round(Number(x))))):'';

export function homeView({signed=false,active=null,parked=[],history=[],favorites=[],recipes=[],escape=e=>String(e)}){
 const activeCount=(active?1:0)+parked.length;
 const hero='<section class="home-masthead"><div class="home-brand"><h1>Backen mit <svg class="brand-heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="35" height="35" fill="none" stroke="#b67a79" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 37C8 26 2 16 8 8q7-8 15 6 10-17 18-9 7 10-18 32z"/><path d="M24 38q-2-10 1-19" opacity=".42"/></svg><em>Sauerteig</em></h1><p>Dein Begleiter für natürliches Brotbacken.</p></div><div class="home-artwork"><img src="/design/hero-aquarell.png" width="950" height="455" alt="" decoding="async" fetchpriority="high"></div></section>';

 const upcomingRecords=[...(active?[{bake:active,action:'backtag'}]:[]),...parked.map((bake,i)=>({bake,action:'switchBake:'+i}))].slice(0,2);
 const remainingLabel=value=>{
  const time=new Date(value).getTime();if(!Number.isFinite(time))return '';
  const mins=Math.ceil((time-Date.now())/60000);if(mins<=0)return 'jetzt fällig';
  if(mins>=1440)return 'noch '+Math.floor(mins/1440)+' T '+Math.floor((mins%1440)/60)+' h';
  return mins>=60?'noch '+Math.floor(mins/60)+' h'+(mins%60?' '+(mins%60)+' min':''):'noch '+mins+' min';
 };
 const live=upcomingRecords.length?'<section class="home-upcoming"><div class="home-section-heading"><h2>Deine nächsten Backtage</h2><button data-act="bakingDays">Alle anzeigen '+icon('arrow',18)+'</button></div><div class="home-upcoming-grid">'+upcomingRecords.map(({bake,action},i)=>{
  const steps=Array.isArray(bake.steps)?bake.steps:[],at=Math.max(0,Number(bake.index)||0);
  const next=steps.slice(at).find(step=>step&&step.active!==false&&Number.isFinite(new Date(step.at).getTime()));
  const summary=(next?.title||'Dein Backtag')+(next?.at?' · '+remainingLabel(next.at):'');
  const pct=steps.length?Math.max(6,Math.min(100,Math.round(at/steps.length*100))):0;
  return '<button class="home-upcoming-card" data-act="'+action+'"><span class="home-upcoming-picture"><img src="'+(i%2?'/design/tile-backtage.png':'/design/tile-import.png')+'" alt="" loading="lazy"></span><span class="home-upcoming-copy"><strong>'+escape(bake.title||'Backtag')+'</strong><small>'+escape(summary)+'</small><span class="home-upcoming-track" aria-hidden="true"><span style="width:'+pct+'%"></span></span><span class="sr-only">Schritt '+Math.min(steps.length,at+1)+' von '+steps.length+'</span></span></button>';
 }).join('')+'</div>'+(activeCount>1?'<span class="sr-only">'+activeCount+' Backtage parallel</span>':'')+'</section>':'';
 const grid='<section class="home-feature-grid" aria-label="Backen mit Sauerteig Funktionen">'+tiles.map(([label,route,art])=>'<button class="home-feature" data-act="'+route+'"><span class="home-feature-art"><img src="'+art+'" alt="" loading="lazy" decoding="async" width="240" height="200"></span><span class="home-feature-label">'+displayTitle(label)+'</span></button>').join('')+'</section>';
 const recent=signed&&history.length?'<section class="home-recent"><div class="home-section-heading"><h2>Zuletzt gebacken</h2><button data-act="history">Alle anzeigen '+icon('arrow',18)+'</button></div><div class="home-recent-grid">'+history.slice(-3).reverse().map((h,i)=>'<button class="home-recent-card" data-act="history"><div class="home-recent-art"><img src="'+recipePhotoPath(h)+'" alt="KI-generiertes Beispielbild" loading="lazy"></div><strong>'+escape(h.title||'Backtag')+'</strong><small class="home-stars">'+(stars(h.rating)||'Noch nicht bewertet')+'</small><small>'+escape(dateLabel(h))+'</small></button>').join('')+'</div></section>':'';
 const buddy=signed?'<button class="home-buddy" data-act="buddy"><img src="/design/tile-recipes.png" alt="" loading="lazy" width="150" height="135"><span><strong>Sauerteig-Buddy</strong><small>Dein KI-Assistent für Rezepte, Planung und Backfragen</small></span><span class="home-buddy-arrow">'+icon('arrow',22)+'</span></button>':'';
 return hero+grid+live+recent+buddy;
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
