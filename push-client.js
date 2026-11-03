const idKey=user=>'sourdough-push-device-'+user;
async function call(cfg,token,path,method='GET',body){const r=await fetch(cfg.supabaseUrl+path,{method,headers:{apikey:cfg.supabaseKey,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw Error(j.error||j.message||'Push-Dienst nicht erreichbar');return j;}
export async function enablePush(cfg,token,user){
 if(!token||!user)throw Error('Bitte zuerst anmelden.');
 if(!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('Für Push auf dem iPhone die App zuerst zum Home-Bildschirm hinzufügen und dort öffnen.');
 if(await Notification.requestPermission()!=='granted')throw Error('Benachrichtigungen wurden nicht erlaubt.');
 const reg=await navigator.serviceWorker.ready;
 const {publicKey}=await call(cfg,token,'/functions/v1/sourdough-push');
 const raw=atob(publicKey.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(publicKey.length/4)*4,'='));
 const sub=await reg.pushManager.getSubscription()||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(raw,c=>c.charCodeAt(0))});
 const result=await call(cfg,token,'/functions/v1/sourdough-push','POST',{subscription:sub.toJSON()});localStorage.setItem(idKey(user),result.id);return result.id;
}
export async function schedulePush(cfg,token,user,key,end){if(!token||!user||!key)return false;const id=localStorage.getItem(idKey(user));if(!id)return false;await call(cfg,token,'/rest/v1/rpc/schedule_sourdough_push','POST',{p_subscription:id,p_key:key,p_due:new Date(end).toISOString()});return true;}
export async function cancelPush(cfg,token,user,key){if(!token||!user)return;const id=localStorage.getItem(idKey(user));if(!id)return;const r=await fetch(cfg.supabaseUrl+'/rest/v1/sourdough_push_jobs?subscription_id=eq.'+encodeURIComponent(id)+'&timer_key=eq.'+encodeURIComponent(key),{method:'DELETE',headers:{apikey:cfg.supabaseKey,Authorization:'Bearer '+token}});if(!r.ok)throw Error('Die gespeicherte Push-Erinnerung konnte nicht gelöscht werden. Bitte erneut versuchen.');}
export async function disablePush(cfg,token,user){await call(cfg,token,'/functions/v1/sourdough-push','DELETE');localStorage.removeItem(idKey(user));const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub)await sub.unsubscribe();}
