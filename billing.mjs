import {createHmac,timingSafeEqual} from 'node:crypto';

export const SAUERTEIG_STRIPE_TEST_PRODUCT_ID='prod_VYU3gEDcFeG3XR';
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
export async function stripePrice(priceId,env=process.env){
 if(!/^price_[A-Za-z0-9]+$/.test(priceId||''))throw Error('Ungültiger Stripe-Preis');
 const r=await fetch('https://api.stripe.com/v1/prices/'+encodeURIComponent(priceId),{
  headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY},signal:AbortSignal.timeout(10000)
 });
 if(!r.ok)throw Error('Stripe-Preis nicht verfügbar');
 return r.json();
}
export function validConsumerPrice(price,interval,expectedProductId=''){
 return price?.active===true&&price?.currency==='eur'&&price?.type==='recurring'
  &&price?.recurring?.interval===interval&&(!expectedProductId||price?.product===expectedProductId)&&Number.isInteger(price.unit_amount)
  &&price.unit_amount>0&&price.tax_behavior==='inclusive';
}
export async function publicBillingPlans(env=process.env){
 if(!billingEnabled(env))return {enabled:false,plans:[]};
 const ids=billingPrices(env),plans=[];
 for(const [plan,id] of Object.entries(ids)){
  const interval=plan==='monthly'?'month':'year',price=await stripePrice(id,env);
  if(!validConsumerPrice(price,interval,env.STRIPE_PRODUCT_ID||''))return {enabled:false,plans:[],reason:'Stripe-Preise müssen aktiv, in EUR und inklusive Steuern sein'};
  plans.push({plan,amount:price.unit_amount,currency:'EUR',interval,taxInclusive:true});
 }
 return {enabled:true,plans};
}
export async function checkoutSession(user,plan,env=process.env){
 if(!billingEnabled(env))throw Error('Bezahlfunktion noch nicht freigeschaltet');
 if(!['monthly','yearly'].includes(plan))throw Error('Ungültiger Tarif');
 const price=billingPrices(env)[plan];if(!/^price_[A-Za-z0-9]+$/.test(price))throw Error('Stripe-Preis nicht eingerichtet');
 const checked=await stripePrice(price,env);if(!validConsumerPrice(checked,plan==='monthly'?'month':'year',env.STRIPE_PRODUCT_ID||''))throw Error('Tarifpreis noch nicht für den Verkauf freigegeben');
 const existing=await subscriptionRow(user.id,env);
 if(existing&&['active','trialing'].includes(existing.status))throw Error('Dein Plus-Abo ist bereits aktiv. Bitte Abo verwalten.');
 const base=env.PUBLIC_BASE_URL||'https://backen-mit-sauerteig.onrender.com';
 const params={
 mode:'subscription',
 'line_items[0][price]':price,'line_items[0][quantity]':'1',
 success_url:base+'/?billing=success',cancel_url:base+'/?billing=cancel',
 client_reference_id:user.id,'subscription_data[metadata][user_id]':user.id,'subscription_data[metadata][app]':'sauerteig',
 'metadata[user_id]':user.id,'metadata[app]':'sauerteig','billing_address_collection':'required',
 'allow_promotion_codes':'true'
 };
 if(existing?.stripe_customer_id)params.customer=existing.stripe_customer_id;
 else params.customer_email=user.email;
 const result=await stripeCall('checkout/sessions',params,env);
 if(!/^https:\/\/checkout\.stripe\.com\//.test(result.url||''))throw Error('Ungültige Checkout-Adresse');
 return {url:result.url};
}
export async function portalSession(userId,env=process.env){
 if(!env.STRIPE_SECRET_KEY||!env.SUPABASE_SERVICE_ROLE_KEY||!env.SUPABASE_URL)throw Error('Stripe-Kundenportal nicht eingerichtet');
 const existing=await subscriptionRow(userId,env);
 if(!existing?.stripe_customer_id)throw Error('Noch kein Stripe-Kundenkonto vorhanden');
 const base=env.PUBLIC_BASE_URL||'https://backen-mit-sauerteig.onrender.com';
 const result=await stripeCall('billing_portal/sessions',{customer:existing.stripe_customer_id,return_url:base+'/'},env);
 if(!/^https:\/\/billing\.stripe\.com\//.test(result.url||''))throw Error('Ungültige Portal-Adresse');
 return {url:result.url};
}
export function subscriptionFromEvent(event,env=process.env){
 if(!['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event?.type))return null;
 const s=event.data?.object;if(!s?.id||!s.customer)return null;
 if(s.metadata?.app && s.metadata.app!=='sauerteig')return null;
 const uid=s.metadata?.user_id;
 const priceId=s.items?.data?.[0]?.price?.id||null;
 const approved=[env.STRIPE_PRICE_MONTHLY,env.STRIPE_PRICE_YEARLY].filter(Boolean);
 if(!approved.length||!approved.includes(priceId))return null;
 if(!/^[0-9a-f-]{36}$/i.test(uid||''))return null;
 return {user_id:uid,stripe_customer_id:typeof s.customer==='string'?s.customer:s.customer.id,
 stripe_subscription_id:s.id,status:s.status||'inactive',price_id:s.items?.data?.[0]?.price?.id||null,
 current_period_end:s.items?.data?.[0]?.current_period_end?new Date(s.items.data[0].current_period_end*1000).toISOString():null,
 last_event_created:event.created||0,updated_at:new Date().toISOString()};
}
export function auxiliarySubscriptionId(event){
 const obj=event?.data?.object??{};
 let id=null;
 if(event?.type==='checkout.session.completed'&&obj.mode==='subscription'){
  id=obj.subscription;
 }else if(['invoice.paid','invoice.payment_failed'].includes(event?.type)){
  id=obj.subscription||obj.parent?.subscription_details?.subscription;
 }
 if(typeof id==='object')id=id?.id;
 return typeof id==='string'&&/^sub_[A-Za-z0-9]+$/.test(id)?id:null;
}
export async function resolveBillingEvent(event,env=process.env){
 if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event?.type))return event;
 const subId=auxiliarySubscriptionId(event);
 if(!subId)return null;
 if(!env.STRIPE_SECRET_KEY)throw Error('Stripe ist nicht konfiguriert');
 const res=await fetch('https://api.stripe.com/v1/subscriptions/'+encodeURIComponent(subId),{
  headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY},
  signal:AbortSignal.timeout(10000)
 });
 if(!res.ok)throw Error('Stripe-Abostatus derzeit nicht abrufbar');
 const subscription=await res.json();
 if(subscription?.id!==subId||subscription?.object!=='subscription')throw Error('Ungültiger Stripe-Abostatus');
 return {type:'customer.subscription.updated',created:event.created,data:{object:subscription}};
}
export async function applyStripeEvent(event,env=process.env){
 const resolved=await resolveBillingEvent(event,env);
 const record=resolved?subscriptionFromEvent(resolved,env):null;
 if(!record)return {ignored:true};
 const response=await fetch(env.SUPABASE_URL+'/rest/v1/rpc/apply_sourdough_subscription_event',{
  method:'POST',
  headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},
  body:JSON.stringify({p_record:record}),signal:AbortSignal.timeout(8000)
 });
 if(!response.ok)throw Error('Abo-Ereignis konnte nicht verarbeitet werden');
 return {updated:(await response.json())===true};
}
