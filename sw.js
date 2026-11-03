const CACHE='sauerteig-public-v32';const ASSETS=['/','/index.html','/style.css','/theme.css','/theme-v3.css','/theme-v4.css','/theme-reference.css','/theme-editorial.css','/design/hero-aquarell.png','/design/tile-plan.png','/design/tile-recipes.png','/design/tile-import.png','/design/tile-backtage.png','/design/tile-statistik.png','/design/tile-favoriten.png','/design/tile-backbuecher.png','/design/tile-wissen.png','/design/tile-einkauf.png','/design/photo-landbrot.png','/design/photo-vollkorn.png','/design/photo-bauernbrot.png','/design/photo-helles.png','/design/photo-saaten.png','/design/photo-kasten.png','/design/photo-krume.png','/design/photo-rustikal.png','/design/photo-brezeln.png','/design/photo-baguette.png','/design/photo-bagels.png','/design/photo-focaccia.png','/design/photo-pizza.png','/design/photo-zimtschnecken.png','/app.js','/auth-ui.js','/dough-weight.js','/backup.js','/planner.js','/backtag.js','/home.js','/recipe-gallery.js','/recipe-builder.js','/flour-mix.js','/pdf-baking.js','/pdf-tools-ui.js','/pdf-recipes.js','/calendar.js','/hub.js','/icons.js','/stats.js','/calculators.js','/knowledge.js','/pantry.js','/billing-ui.js','/own-recipes.js','/recipes.json','/knowledge-data.json','/planning-ui.js','/flour-table.js','/flour-table.json','/resources.js','/resources.json','/source-conflicts.json','/community-ui.js','/historical.js','/bake-metrics.js','/historical-recipes.json','/photos.js','/own-recipe-parser.js','/starter-tracking.js','/onboarding.js','/art-pretzel.svg','/art-shopping.svg','/art-heart.svg','/art-chart.svg','/art-hero.svg','/art-books.svg','/art-scale.svg','/art-calendar.svg','/art-buddy.svg','/art-loaf.svg','/art-starter.svg','/art-tools.svg','/art-basket.svg','/art-wheat.svg','/manifest.webmanifest','/icon.svg'];
const publicPaths=new Set(ASSETS);
async function isRealAsset(path,response){
 if(!response.ok)return false;
 const type=(response.headers.get('content-type')||'').toLowerCase();
 if(path==='/'||path==='/index.html'){
  if(!type.includes('text/html'))return false;
  return (await response.clone().text()).includes('<main id="main">');
 }
 if(/\.svg$/.test(path))return type.includes('image/svg+xml');
 if(/\.png$/.test(path))return type.includes('image/png');
 if(/\.css$/.test(path))return type.includes('text/css');
 if(/\.js$/.test(path))return type.includes('javascript');
 if(/\.json$/.test(path))return type.includes('json');
 if(/\.webmanifest$/.test(path))return type.includes('manifest')||type.includes('json');
 return true;
}

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(name=>name.startsWith('sauerteig-public-')&&name!==CACHE).map(name=>caches.delete(name)))).then(()=>self.clients.claim()));
});
/* A navigation must not stay on an outdated HTML/JS shell after a deployment.
   Prefer the current valid response; fall back to the complete offline version
   quickly while the Render Free instance starts. API/auth are never cached. */
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||!publicPaths.has(url.pathname))return;
 const path=url.pathname;
 const key=path==='/'?'/index.html':path;
 const isShell=path==='/'||path==='/index.html'||/\.(?:js|css)$/.test(path);
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(key);
  const remote=fetch(request,{cache:'no-store'}).then(async response=>{
   if(!await isRealAsset(path,response))return null;
   event.waitUntil(cache.put(key,response.clone()).catch(()=>{}));
   return response;
  }).catch(()=>null);
  if(isShell){
   if(cached){
    // Avoid mixing old HTML/modules when online, but never block a cached
    // interface for the entire duration of a free-instance cold start.
    const fresh=await Promise.race([remote,new Promise(resolve=>setTimeout(()=>resolve(null),1400))]);
    if(fresh)return fresh;
    event.waitUntil(remote);
    return cached;
   }
   const fresh=await remote;
   if(fresh)return fresh;
   return new Response(path==='/'||path==='/index.html'?
     '<!doctype html><html lang="de"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Backen mit Sauerteig</title><body style="font:16px system-ui;background:#faf2e9;color:#4a3130;padding:30px"><h1>Backen mit Sauerteig</h1><p>Die Verbindung ist gerade nicht verfügbar. Öffne die App erneut, sobald Render wieder erreichbar ist.</p></body></html>':
     'Die Anwendung ist derzeit offline.',{status:503,headers:{'Content-Type':path==='/'||path==='/index.html'?'text/html; charset=utf-8':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
  }
  if(cached){
   event.waitUntil(remote);
   return cached;
  }
  const fresh=await remote;
  if(fresh)return fresh;
  return new Response('Diese Datei ist gerade nicht verfügbar.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
 })());
});
