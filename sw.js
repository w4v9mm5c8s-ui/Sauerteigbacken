const CACHE='sauerteig-public-v18';const ASSETS=['/','/index.html','/style.css','/theme.css','/theme-v3.css','/app.js','/backup.js','/planner.js','/backtag.js','/home.js','/recipe-gallery.js','/calendar.js','/hub.js','/icons.js','/stats.js','/calculators.js','/knowledge.js','/pantry.js','/billing-ui.js','/own-recipes.js','/recipes.json','/knowledge-data.json','/planning-ui.js','/flour-table.js','/flour-table.json','/resources.js','/resources.json','/source-conflicts.json','/community-ui.js','/historical.js','/bake-metrics.js','/historical-recipes.json','/photos.js','/own-recipe-parser.js','/starter-tracking.js','/onboarding.js','/art-pretzel.svg','/art-heart.svg','/art-chart.svg','/art-hero.svg','/art-books.svg','/art-scale.svg','/art-calendar.svg','/art-buddy.svg','/art-loaf.svg','/art-starter.svg','/art-tools.svg','/art-basket.svg','/art-wheat.svg','/manifest.webmanifest','/icon.svg'];
const publicPaths=new Set(ASSETS);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(name=>name.startsWith('sauerteig-public-')&&name!==CACHE).map(name=>caches.delete(name)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||!publicPaths.has(url.pathname))return;
 const key=url.pathname==='/'?'/index.html':url.pathname;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(key);
  if(cached){
   // Return the local SVG-based app instantly, while waking the free Render server in the background.
   event.waitUntil(fetch(request,{cache:'no-store'}).then(response=>response.ok?cache.put(key,response.clone()):undefined).catch(()=>{}));
   return cached;
  }
  try{
   const response=await fetch(request);
   if(response.ok)event.waitUntil(cache.put(key,response.clone()).catch(()=>{}));
   return response;
  }catch{
   return new Response('Keine Verbindung. Öffne die App erneut, sobald das Netzwerk verfügbar ist.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
 })());
});
