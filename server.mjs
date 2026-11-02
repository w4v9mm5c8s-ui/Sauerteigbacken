import {billingEnabled,billingConfigured,checkoutSession,portalSession,subscriptionRow,publicBillingPlans,verifyStripeWebhook,applyStripeEvent} from './billing.mjs';
import {fetchPublicRecipeUrl} from './url-import.mjs';
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('.'),port=Number(process.env.PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body))};
const quotas=new Map();
function limit(key,max=25){const hour=Math.floor(Date.now()/3600000),id=hour+':'+key,n=(quotas.get(id)||0)+1;quotas.set(id,n);if(quotas.size>10000)quotas.clear();return n<=max}
async function body(req,max=2200000){let size=0,parts=[];for await(const c of req){size+=c.length;if(size>max)throw Error('Zu große Anfrage');parts.push(c)}return JSON.parse(Buffer.concat(parts).toString('utf8'))}
async function who(req){const token=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'')?.[1];if(!token||!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY)return null;const r=await fetch(process.env.SUPABASE_URL+'/auth/v1/user',{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+token}});return r.ok?{user:await r.json(),token}:null}
async function db(method,path,identity,data){const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+identity.token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=representation'},...(data?{body:JSON.stringify(data)}:{})});if(!r.ok)throw Error('Speichern derzeit nicht möglich');return r.json()}
async function consumeAiDaily(userId,plus){
 if(process.env.AI_DAILY_QUOTA_ENABLED!=='true')return true;
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.SUPABASE_URL)return false;
 const configured=Number(plus?process.env.AI_PLUS_DAILY_LIMIT:process.env.AI_FREE_DAILY_LIMIT);
 const cap=Number.isInteger(configured)&&configured>0&&configured<=1000?configured:(plus?100:30);
 const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/rpc/consume_sourdough_ai_usage',{
  method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},
  body:JSON.stringify({p_user_id:userId,p_limit:cap}),signal:AbortSignal.timeout(8000)
 });
 if(!r.ok)return false;
 return (await r.json())===true;
}
async function ai(prompt,image){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),35000);
 try{
 const input=[{role:'user',content:[{type:'input_text',text:prompt},...(image?[{type:'input_image',image_url:image,detail:'auto'}]:[])]}];
 const payload={model:process.env.OPENAI_MODEL||'gpt-5-mini',instructions:'Du bist ein fachlich vorsichtiger deutschsprachiger Sauerteig-Backassistent. Gib konkrete kurze Anleitungen. Erfinde keine Werte oder Zutaten. Eine Fotoanalyse ist nur eine Einschätzung. Bei Bäckerlauge ausschließlich Herstelleranleitung und Schutzausrüstung empfehlen.',input,store:false,max_output_tokens:1100};
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
 if(!r.ok)throw Error(r.status===429?'KI-Limit erreicht':'KI-Dienst derzeit nicht verfügbar');
 const result=await r.json();const text=result.output_text||result.output?.filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n')||'';
 if(!text)throw Error('Keine KI-Antwort erhalten');return text;
 }finally{clearTimeout(timer)}
}
const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Permissions-Policy':'camera=(self), microphone=()','Content-Security-Policy':"default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
async function handle(req,res){for(const [k,v] of Object.entries(headers))res.setHeader(k,v);const url=new URL(req.url,'http://localhost');
if(url.pathname==='/api/stripe/webhook'&&req.method==='POST'){
 if(!billingConfigured())return json(res,503,{error:'Zahlungsdienst nicht eingerichtet'});
 let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>1000000)return json(res,413,{error:'Webhook zu groß'});chunks.push(c)}
 const raw=Buffer.concat(chunks);
 if(!verifyStripeWebhook(raw,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET))return json(res,400,{error:'Ungültige Signatur'});
 let event;try{event=JSON.parse(raw.toString('utf8'))}catch{return json(res,400,{error:'Ungültiges Ereignis'})}
 await applyStripeEvent(event);return json(res,200,{received:true});
}
if(url.pathname==='/api/health')return json(res,200,{ok:true,name:'Backen mit Sauerteig'});
if(url.pathname==='/api/config')return json(res,200,{supabaseUrl:process.env.SUPABASE_URL||'',supabaseKey:process.env.SUPABASE_PUBLISHABLE_KEY||'',aiEnabled:!!process.env.OPENAI_API_KEY});
if(url.pathname==='/api/community'&&req.method==='GET'){if(!process.env.SUPABASE_URL)return json(res,200,{recipes:[]});const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/community_recipes?status=eq.published&select=id,title,ingredients,instructions,created_at,author_display_name,flour_type,bread_type,hydration,difficulty,starter_type,bake_method,total_hours&limit=100',{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY}});return json(res,r.ok?200:502,r.ok?{recipes:await r.json()}:{error:'Community nicht erreichbar'})}
if(url.pathname.startsWith('/api/')){
 const id=await who(req);if(!id)return json(res,401,{error:'Bitte zuerst anmelden.'});
 if(!limit('user:'+id.user.id,180))return json(res,429,{error:'Zu viele Anfragen'});
 if(url.pathname==='/api/billing/status'&&req.method==='GET'){
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.SUPABASE_URL)return json(res,200,{enabled:false,plus:false,status:'unavailable',hasCustomer:false});
 const row=await subscriptionRow(id.user.id);return json(res,200,{enabled:billingEnabled(),plus:!!row&&['active','trialing'].includes(row.status),status:row?.status||'inactive',hasCustomer:!!row?.stripe_customer_id&&!!process.env.STRIPE_SECRET_KEY,periodEnd:row?.current_period_end||null});
}
if(url.pathname==='/api/billing/plans'&&req.method==='GET'){
 try{return json(res,200,await publicBillingPlans())}catch{return json(res,200,{enabled:false,plans:[]})}
}
if(url.pathname==='/api/billing/checkout'&&req.method==='POST'){
 if(!limit('billing-checkout:'+id.user.id,5))return json(res,429,{error:'Bitte später erneut versuchen'});
 const input=await body(req,1500);return json(res,200,await checkoutSession(id.user,String(input.plan||'')));
}
if(url.pathname==='/api/billing/portal'&&req.method==='POST'){
 if(!limit('billing-portal:'+id.user.id,10))return json(res,429,{error:'Bitte später erneut versuchen'});
 return json(res,200,await portalSession(id.user.id));
}
if(url.pathname==='/api/sync'){
 if(req.method==='GET'){const r=await db('GET','app_data?user_id=eq.'+id.user.id+'&select=payload',id);return json(res,200,r[0]||{payload:null})}
 if(req.method==='PUT'){const b=await body(req,900000);if(!b.payload||typeof b.payload!=='object'||Array.isArray(b.payload))return json(res,400,{error:'Ungültige Daten'});await db('POST','app_data?on_conflict=user_id',id,{user_id:id.user.id,payload:b.payload,updated_at:new Date().toISOString()});return json(res,200,{ok:true})}}
 if(url.pathname==='/api/moderation/me'&&req.method==='GET'){const rows=await db('GET','sourdough_moderators?user_id=eq.'+id.user.id+'&select=user_id',id);return json(res,200,{moderator:rows.length>0})}
 if(url.pathname==='/api/moderation/pending'&&req.method==='GET'){const m=await db('GET','sourdough_moderators?user_id=eq.'+id.user.id+'&select=user_id',id);if(!m.length)return json(res,403,{error:'Keine Berechtigung'});const rows=await db('GET','community_recipes?status=eq.pending&select=id,title,ingredients,instructions,created_at&order=created_at.asc&limit=50',id);return json(res,200,{recipes:rows})}
 if(url.pathname==='/api/moderation/decision'&&req.method==='POST'){const m=await db('GET','sourdough_moderators?user_id=eq.'+id.user.id+'&select=user_id',id);if(!m.length)return json(res,403,{error:'Keine Berechtigung'});const b=await body(req,2000);if(!/^[0-9a-f-]{36}$/i.test(b.id||'')||!['published','rejected'].includes(b.status))return json(res,400,{error:'Ungültige Entscheidung'});await db('PATCH','community_recipes?id=eq.'+b.id,id,{status:b.status});return json(res,200,{ok:true})}
 if(url.pathname==='/api/community/report'&&req.method==='POST'){const b=await body(req,2500);if(!/^[0-9a-f-]{36}$/i.test(b.id||'')||String(b.reason||'').trim().length<5)return json(res,400,{error:'Bitte einen gültigen Meldegrund angeben'});await db('POST','community_reports',id,{reporter_id:id.user.id,recipe_id:b.id,reason:String(b.reason).trim().slice(0,1000)});return json(res,201,{ok:true})}
 if(url.pathname==='/api/community'&&req.method==='POST'){const b=await body(req,20000);const title=String(b.title||'').trim(),ingredients=String(b.ingredients||'').trim(),instructions=String(b.instructions||'').trim();if(title.length<3||title.length>120||ingredients.length<5||instructions.length<5)return json(res,400,{error:'Bitte alle Felder ausfüllen'});await db('POST','community_recipes',id,{author_id:id.user.id,title,ingredients,instructions,status:'pending',author_display_name:String(b.author||'Bäcker:in').slice(0,60),flour_type:String(b.flour||'').slice(0,100)||null,bread_type:String(b.breadType||'').slice(0,100)||null,hydration:b.hydration===''||b.hydration==null?null:Number(b.hydration),difficulty:String(b.difficulty||'').slice(0,50)||null,starter_type:String(b.starterType||'').slice(0,50)||null,bake_method:String(b.bakeMethod||'').slice(0,60)||null,total_hours:b.totalHours===''||b.totalHours==null?null:Number(b.totalHours)});return json(res,201,{ok:true})}
 if(url.pathname==='/api/recipe-url'&&req.method==='POST'){if(!limit('import-url:'+id.user.id,10))return json(res,429,{error:'Zu viele Rezeptimporte'});const b=await body(req,4000);try{const found=await fetchPublicRecipeUrl(String(b.url||''));return json(res,200,found)}catch(e){return json(res,422,{error:e.message||'Link konnte nicht gelesen werden'})}}
 if(['/api/buddy','/api/recipe-extract'].includes(url.pathname)&&req.method==='POST'){
 let aiLimit=30,plus=false;if(billingEnabled()){try{const sub=await subscriptionRow(id.user.id);plus=['active','trialing'].includes(sub?.status);if(plus)aiLimit=90}catch{}}if(!limit('ai:'+id.user.id,aiLimit))return json(res,429,{error:'Dein KI-Limit für diese Stunde ist erreicht'});
 if(!process.env.OPENAI_API_KEY)return json(res,503,{error:'Die KI ist noch nicht freigeschaltet.'});
 const b=await body(req);const image=typeof b.image==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(b.image)&&b.image.length<2100000?b.image:null;
 if(b.image&&!image)return json(res,400,{error:'Bitte ein kleineres JPG-, PNG- oder WebP-Bild wählen.'});
 if(url.pathname==='/api/recipe-extract'&&!image&&!String(b.text||'').trim())return json(res,400,{error:'Bitte ein Rezeptfoto oder Rezepttext eingeben.'});
 const prompt=url.pathname==='/api/recipe-extract'?'Lies das Rezept aus dem Foto oder Text. Gib ausschließlich gültiges JSON mit title (Text), ingredients (Array aus {name,grams}), steps (Textarray), uncertain (Textarray). Keine Zutaten oder Mengen erfinden; fehlende Werte null. Rezepttext: '+String(b.text||'').slice(0,7000):String(b.question|| (image?'Bitte schätze anhand des Fotos den Teig- oder Brot-Zustand ein. Kennzeichne Unsicherheiten deutlich.':'')).slice(0,2500);
 if(!prompt.trim())return json(res,400,{error:'Bitte Frage eingeben'});
 if(!await consumeAiDaily(id.user.id,plus))return json(res,429,{error:'Dein tägliches KI-Limit ist erreicht oder kann gerade nicht geprüft werden'});
 const result=await ai(prompt,image);
 if(url.pathname==='/api/recipe-extract'){let parsed;try{parsed=JSON.parse(result.replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim())}catch{return json(res,502,{error:'Das Rezept konnte nicht sicher gelesen werden.'})}if(!parsed||typeof parsed.title!=='string'||!Array.isArray(parsed.ingredients)||!Array.isArray(parsed.steps))return json(res,502,{error:'Unvollständige Rezeptdaten. Bitte manuell eingeben.'});return json(res,200,{recipe:parsed,requiresReview:true})}
 return json(res,200,{answer:result})}
 return json(res,404,{error:'Unbekannte Funktion'});
}
if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Methode nicht erlaubt'});
let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return json(res,400,{error:'Ungültiger Pfad'})}
if(pathname==='/'||(!extname(pathname)&&pathname!=='/recipes.json'))pathname='/index.html';
const publicFiles=new Set(['/index.html','/app.js','/planner.js','/backtag.js','/own-recipes.js','/hub.js','/icons.js','/stats.js','/calculators.js','/knowledge.js','/pantry.js','/billing-ui.js','/backup.js','/recipes.json','/knowledge-data.json','/planning-ui.js','/flour-table.js','/flour-table.json','/resources.js','/resources.json','/source-conflicts.json','/community-ui.js','/historical.js','/bake-metrics.js','/historical-recipes.json','/photos.js','/own-recipe-parser.js','/starter-tracking.js','/onboarding.js','/art-loaf.svg','/art-starter.svg','/art-tools.svg','/style.css','/manifest.webmanifest','/icon.svg','/sw.js','/robots.txt']);
if(!publicFiles.has(pathname))return json(res,404,{error:'Nicht gefunden'});
const file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep))return json(res,403,{error:'Zugriff verweigert'});
try{if(!(await stat(file)).isFile())throw Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'public, max-age=180'});res.end(req.method==='HEAD'?undefined:data)}catch{return json(res,404,{error:'Nicht gefunden'})}
}
http.createServer((req,res)=>Promise.resolve(handle(req,res)).catch(e=>json(res,500,{error:e.message==='Zu große Anfrage'?e.message:'Serverfehler'}))).listen(port,'0.0.0.0');

if(process.env.OPENAI_API_KEY){setTimeout(async()=>{try{const r=await fetch('https://api.openai.com/v1/models/'+encodeURIComponent(process.env.OPENAI_MODEL||'gpt-5-mini'),{headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},signal:AbortSignal.timeout(10000)});console.log('AI credential check HTTP',r.status===200?'200 OK':r.status)}catch{console.log('AI credential check unavailable')}},3000)}else{console.log('AI credential not configured')}

setTimeout(async()=>{try{const paths=['/api/health','/recipes.json','/index.html','/app.js','/manifest.webmanifest'];const checks=await Promise.all(paths.map(async p=>{const r=await fetch('http://127.0.0.1:'+port+p,{signal:AbortSignal.timeout(5000)});return p+':'+r.status}));console.log('Startup route check',checks.join(' '))}catch{console.log('Startup route check unavailable')}},2000)
