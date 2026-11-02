import {createHmac,timingSafeEqual} from 'node:crypto';

export function billingConfigured(env=process.env){
 return Boolean(env.STRIPE_SECRET_KEY&&env.STRIPE_WEBHOOK_SECRET&&env.STRIPE_PRICE_MONTHLY&&env.STRIPE_PRICE_YEARLY&&env.SUPABASE_SERVICE_ROLE_KEY&&env.SUPABASE_URL);
}
export function billingEnabled(env=process.env){return env.BILLING_ENABLED==='true'&&billingConfigured(env)}
export function billingPrices(env=process.env){return {monthly:env.STRIPE_PRICE_MONTHLY,yearly:env.STRIPE_PRICE_YEARLY}}
export function verifyStripeWebhook(raw,header,secret,now=Math.floor(Date.now()/1000)){
 if(!header||!secret||!Buffer.isBuffer(raw))return false;
 const parts=header.split(',').map(x=>x.trim()),timestamp=Number(parts.find(x=>x.startsWith('t='))?.slice(2));
 if(!Number.isSafeInteger(timestamp)||Math.abs(now-timestamp)>300)return false;
 const expected=createHmac('sha256',secret).update(timestamp+'.').update(raw).digest();
 return parts.filter(x=>x.startsWith('v1=')).some(part=>{const hex=part.slice(3);if(!/^[a-f0-9]{64}$/i.test(hex))return false;const actual=Buffer.from(hex,'hex');return timingSafeEqual(expected,actual)});
}
export async function stripeCall(path,params,env=process.env){
 if(!env.STRIPE_SECRET_KEY)throw Error('Stripe ist nicht eingerichtet');
 const response=await fetch('https://api.stripe.com/v1/'+path,{method:'POST',headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params).toString(),signal:AbortSignal.timeout(12000)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw Error('Zahlungsdienst derzeit nicht erreichbar');
 return result;
}
export async function subscriptionRow(userId,env=process.env){
 const url=env.SUPABASE_URL+'/rest/v1/sourdough_subscriptions?user_id=eq.'+encodeURIComponent(userId)+'&select=user_id,stripe_customer_id,stripe_subscription_id,status,price_id,current_period_end';
 const r=await fetch(url,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY},signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error('Abo-Status derzeit nicht verfügbar');
 return (await r.json())[0]||null;
}
export async function checkoutSession(user,plan,env=process.env){
 if(!billingEnabled(env))throw Error('Bezahlfunktion noch nicht freigeschaltet');
 if(!['monthly','yearly'].includes(plan))throw Error('Ungültiger Tarif');
 const price=billingPrices(env)[plan];if(!/^price_[A-Za-z0-9]+$/.test(price))throw Error('Stripe-Preis nicht eingerichtet');
 const existing=await subscriptionRow(user.id,env);
 if(existing&&['active','trialing'].includes(existing.status))throw Error('Dein Plus-Abo ist bereits aktiv. Bitte Abo verwalten.');
 const base=env.PUBLIC_BASE_URL||'https://backen-mit-sauerteig.onrender.com';
 const params={
 mode:'subscription',
 'line_items[0][price]':price,'line_items[0][quantity]':'1',
 success_url:base+'/?billing=success',cancel_url:base+'/?billing=cancel',
 client_reference_id:user.id,'subscription_data[metadata][user_id]':user.id,
 'metadata[user_id]':user.id,'billing_address_collection':'required',
 'allow_promotion_codes':'true'
 };
 if(existing?.stripe_customer_id)params.customer=existing.stripe_customer_id;
 else params.customer_email=user.email;
 const result=await stripeCall('checkout/sessions',params,env);
 if(!/^https:\/\/checkout\.stripe\.com\//.test(result.url||''))throw Error('Ungültige Checkout-Adresse');
 return {url:result.url};
}
export async function portalSession(userId,env=process.env){
 if(!billingEnabled(env))throw Error('Bezahlfunktion noch nicht freigeschaltet');
 const existing=await subscriptionRow(userId,env);
 if(!existing?.stripe_customer_id)throw Error('Noch kein Stripe-Kundenkonto vorhanden');
 const base=env.PUBLIC_BASE_URL||'https://backen-mit-sauerteig.onrender.com';
 const result=await stripeCall('billing_portal/sessions',{customer:existing.stripe_customer_id,return_url:base+'/'},env);
 if(!/^https:\/\/billing\.stripe\.com\//.test(result.url||''))throw Error('Ungültige Portal-Adresse');
 return {url:result.url};
}
export function subscriptionFromEvent(event){
 if(!['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event?.type))return null;
 const s=event.data?.object;if(!s?.id||!s.customer)return null;
 const uid=s.metadata?.user_id;
 if(!/^[0-9a-f-]{36}$/i.test(uid||''))return null;
 return {user_id:uid,stripe_customer_id:typeof s.customer==='string'?s.customer:s.customer.id,
 stripe_subscription_id:s.id,status:s.status||'inactive',price_id:s.items?.data?.[0]?.price?.id||null,
 current_period_end:s.items?.data?.[0]?.current_period_end?new Date(s.items.data[0].current_period_end*1000).toISOString():null,
 last_event_created:event.created||0,updated_at:new Date().toISOString()};
}
export async function applyStripeEvent(event,env=process.env){
 const record=subscriptionFromEvent(event);if(!record)return {ignored:true};
 const old=await subscriptionRow(record.user_id,env);
 // A stale webhook must never restore a cancelled subscription.
 const lookup=await fetch(env.SUPABASE_URL+'/rest/v1/sourdough_subscriptions?user_id=eq.'+record.user_id+'&select=last_event_created',{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY}});
 if(!lookup.ok)throw Error('Abo-Ereignis konnte nicht geprüft werden');
 const previous=(await lookup.json())[0];
 if(previous&&Number(previous.last_event_created)>record.last_event_created)return {ignored:true};
 // A different subscription may not replace an active one.
 if(old?.stripe_subscription_id&&old.stripe_subscription_id!==record.stripe_subscription_id&&['active','trialing'].includes(old.status))return {ignored:true};
 const r=await fetch(env.SUPABASE_URL+'/rest/v1/sourdough_subscriptions?on_conflict=user_id',{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify(record)});
 if(!r.ok)throw Error('Abo-Ereignis konnte nicht gespeichert werden');
 return {updated:true};
}
