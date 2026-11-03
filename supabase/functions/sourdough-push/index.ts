import webpush from 'npm:web-push@3.6.7';
const base=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const origin='https://backen-mit-sauerteig.onrender.com';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Content-Type':'application/json'};
const reply=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers});
async function db(path:string,method='GET',data?:unknown){const r=await fetch(base+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},body:data===undefined?undefined:JSON.stringify(data)});if(!r.ok)throw Error('Database unavailable');const text=await r.text();return text?JSON.parse(text):null;}
function validEndpoint(value:string){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&(u.hostname==='fcm.googleapis.com'||u.hostname.endsWith('.push.apple.com')||u.hostname==='updates.push.services.mozilla.com'||u.hostname.endsWith('.notify.windows.com'));}catch{return false}}
Deno.serve(async req=>{if(req.method==='OPTIONS')return reply({});try{
 const secrets=await db('rpc/sourdough_push_secrets','POST',{});
 if(req.method==='GET')return reply({publicKey:secrets.sourdough_vapid_public});
 const bearer=req.headers.get('Authorization')||'';
 if(bearer==='Bearer '+secrets.sourdough_push_worker){
  webpush.setVapidDetails(origin,secrets.sourdough_vapid_public,secrets.sourdough_vapid_private);
  const jobs=await db('rpc/claim_sourdough_push','POST',{});let sent=0;
  for(const j of jobs){const subscriptions=await db('sourdough_push_subscriptions?id=eq.'+j.subscription_id+'&user_id=eq.'+j.user_id);const sub=subscriptions[0];try{
   if(!sub||!validEndpoint(sub.endpoint))throw Error('Invalid subscription');
   await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title:'Backen mit Sauerteig',body:'Dein Backtimer ist abgelaufen.',tag:j.id,url:'/'}),{TTL:600,timeout:10000});
   await db('sourdough_push_jobs?id=eq.'+j.id,'PATCH',{state:'sent'});sent++;
  }catch(error){const status=(error as {statusCode?:number}).statusCode;if(status===404||status===410){await db('sourdough_push_subscriptions?id=eq.'+j.subscription_id,'DELETE');}else await db('sourdough_push_jobs?id=eq.'+j.id,'PATCH',{state:j.attempts>=3?'failed':'pending'});}}
  return reply({sent});
 }
 const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:bearer}});if(!auth.ok)return reply({error:'Bitte anmelden.'},401);const user=await auth.json();
 if(req.method==='DELETE'){await db('sourdough_push_subscriptions?user_id=eq.'+user.id,'DELETE');return reply({ok:true});}
 const input=await req.json();const sub=input.subscription;
 if(!sub||!validEndpoint(sub.endpoint)||sub.endpoint.length>2048||!/^[-_A-Za-z0-9]{80,100}$/.test(sub.keys?.p256dh||'')||!/^[-_A-Za-z0-9]{20,30}$/.test(sub.keys?.auth||''))return reply({error:'Ungültige Push-Anmeldung.'},400);
 const existing=await db('sourdough_push_subscriptions?user_id=eq.'+user.id);let row=existing.find((x:{endpoint:string})=>x.endpoint===sub.endpoint);
 if(!row){if(existing.length>=10)return reply({error:'Maximal zehn Geräte.'},400);row=(await db('sourdough_push_subscriptions','POST',{user_id:user.id,endpoint:sub.endpoint,p256dh:sub.keys.p256dh,auth:sub.keys.auth}))[0];}
 else await db('sourdough_push_subscriptions?id=eq.'+row.id,'PATCH',{p256dh:sub.keys.p256dh,auth:sub.keys.auth});
 return reply({id:row.id});
}catch{return reply({error:'Push-Dienst derzeit nicht verfügbar.'},503)}});
