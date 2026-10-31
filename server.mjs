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
if(url.pathname==='/api/health')return json(res,200,{ok:true,name:'Backen mit Sauerteig'});
if(url.pathname==='/api/config')return json(res,200,{supabaseUrl:process.env.SUPABASE_URL||'',supabaseKey:process.env.SUPABASE_PUBLISHABLE_KEY||'',aiEnabled:!!process.env.OPENAI_API_KEY});
if(url.pathname==='/api/community'&&req.method==='GET'){if(!process.env.SUPABASE_URL)return json(res,200,{recipes:[]});const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/community_recipes?status=eq.published&select=id,title,ingredients,instructions,created_at&limit=60',{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY}});return json(res,r.ok?200:502,r.ok?{recipes:await r.json()}:{error:'Community nicht erreichbar'})}
if(url.pathname.startsWith('/api/')){
 if(!limit(req.socket.remoteAddress||'ip',90))return json(res,429,{error:'Zu viele Anfragen'});
 const id=await who(req);if(!id)return json(res,401,{error:'Bitte zuerst anmelden.'});
 if(url.pathname==='/api/sync'){
 if(req.method==='GET'){const r=await db('GET','app_data?user_id=eq.'+id.user.id+'&select=payload',id);return json(res,200,r[0]||{payload:null})}
 if(req.method==='PUT'){const b=await body(req,900000);if(!b.payload||typeof b.payload!=='object'||Array.isArray(b.payload))return json(res,400,{error:'Ungültige Daten'});await db('POST','app_data?on_conflict=user_id',id,{user_id:id.user.id,payload:b.payload,updated_at:new Date().toISOString()});return json(res,200,{ok:true})}}
 if(url.pathname==='/api/community'&&req.method==='POST'){const b=await body(req,20000);const title=String(b.title||'').trim(),ingredients=String(b.ingredients||'').trim(),instructions=String(b.instructions||'').trim();if(title.length<3||title.length>120||ingredients.length<5||instructions.length<5)return json(res,400,{error:'Bitte alle Felder ausfüllen'});await db('POST','community_recipes',id,{author_id:id.user.id,title,ingredients,instructions,status:'pending'});return json(res,201,{ok:true})}
 if(['/api/buddy','/api/recipe-extract'].includes(url.pathname)&&req.method==='POST'){
 if(!limit('ai:'+id.user.id,30))return json(res,429,{error:'Dein KI-Limit ist erreicht'});
 if(!process.env.OPENAI_API_KEY)return json(res,503,{error:'Die KI ist noch nicht freigeschaltet.'});
 const b=await body(req);const image=typeof b.image==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(b.image)&&b.image.length<2100000?b.image:null;
 if(b.image&&!image)return json(res,400,{error:'Bitte ein kleineres JPG-, PNG- oder WebP-Bild wählen.'});
 if(url.pathname==='/api/recipe-extract'&&!image&&!String(b.text||'').trim())return json(res,400,{error:'Bitte ein Rezeptfoto oder Rezepttext eingeben.'});
 const prompt=url.pathname==='/api/recipe-extract'?'Lies das Rezept aus dem Foto oder Text. Gib ausschließlich gültiges JSON mit title (Text), ingredients (Array aus {name,grams}), steps (Textarray), uncertain (Textarray). Keine Zutaten oder Mengen erfinden; fehlende Werte null. Rezepttext: '+String(b.text||'').slice(0,7000):String(b.question||'').slice(0,2500);
 if(!prompt.trim())return json(res,400,{error:'Bitte Frage eingeben'});
 const result=await ai(prompt,image);
 if(url.pathname==='/api/recipe-extract'){let parsed;try{parsed=JSON.parse(result.replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim())}catch{return json(res,502,{error:'Das Rezept konnte nicht sicher gelesen werden.'})}if(!parsed||typeof parsed.title!=='string'||!Array.isArray(parsed.ingredients)||!Array.isArray(parsed.steps))return json(res,502,{error:'Unvollständige Rezeptdaten. Bitte manuell eingeben.'});return json(res,200,{recipe:parsed,requiresReview:true})}
 return json(res,200,{answer:result})}
 return json(res,404,{error:'Unbekannte Funktion'});
}
if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Methode nicht erlaubt'});
let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return json(res,400,{error:'Ungültiger Pfad'})}
if(pathname==='/'||(!extname(pathname)&&pathname!=='/recipes.json'))pathname='/index.html';
const file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep))return json(res,403,{error:'Zugriff verweigert'});
try{if(!(await stat(file)).isFile())throw Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'public, max-age=180'});res.end(req.method==='HEAD'?undefined:data)}catch{return json(res,404,{error:'Nicht gefunden'})}
}
http.createServer((req,res)=>Promise.resolve(handle(req,res)).catch(e=>json(res,500,{error:e.message==='Zu große Anfrage'?e.message:'Serverfehler'}))).listen(port,'0.0.0.0');
