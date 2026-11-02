import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {billingConfigured,billingEnabled,verifyStripeWebhook,subscriptionFromEvent,checkoutSession,validConsumerPrice,approvedPremium} from '../billing.mjs';
import {billingView} from '../billing-ui.js';

test('payments remain disabled until all credentials and explicit approval are present',()=>{
 const env={STRIPE_SECRET_KEY:'sk_test_example',STRIPE_WEBHOOK_SECRET:'whsec_example',STRIPE_PRICE_MONTHLY:'price_123',STRIPE_PRICE_YEARLY:'price_456',STRIPE_PRODUCT_ID:'prod_test',SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_URL:'https://example.supabase.co'};
 assert.equal(billingConfigured(env),true);assert.equal(billingEnabled(env),false);
 assert.equal(billingEnabled({...env,BILLING_ENABLED:'true'}),true);
 assert.equal(billingConfigured({...env,STRIPE_WEBHOOK_SECRET:''}),false);
 assert.equal(billingConfigured({...env,STRIPE_PRODUCT_ID:''}),false);
});
test('Stripe webhook validates signature and rejects tampering, replay and missing headers',()=>{
 const secret='whsec_test',raw=Buffer.from('{"id":"evt_test"}'),now=1783000000;
 const sign=(t,b)=>'t='+t+',v1='+createHmac('sha256',secret).update(t+'.').update(b).digest('hex');
 assert.equal(verifyStripeWebhook(raw,sign(now,raw),secret,now),true);
 assert.equal(verifyStripeWebhook(Buffer.from('{"id":"evt_fake"}'),sign(now,raw),secret,now),false);
 assert.equal(verifyStripeWebhook(raw,sign(now-400,raw),secret,now),false);
 assert.equal(verifyStripeWebhook(raw,'',secret,now),false);
});
test('subscription webhook maps verified customer and owner only',()=>{
 const event={type:'customer.subscription.updated',created:1783000000,data:{object:{id:'sub_1',customer:'cus_1',status:'active',metadata:{user_id:'11111111-1111-4111-8111-111111111111'},items:{data:[{price:{id:'price_123'},current_period_end:1784000000}]}}}};
 const env={STRIPE_PRICE_MONTHLY:'price_123',STRIPE_PRICE_YEARLY:'price_456'};const row=subscriptionFromEvent(event,env);assert.equal(row.status,'active');assert.equal(row.stripe_customer_id,'cus_1');assert.equal(row.price_id,'price_123');assert.equal(subscriptionFromEvent({...event,data:{object:{...event.data.object,metadata:{}}}},env),null);
});
test('billing view never offers checkout when not enabled',()=>{
 const html=billingView({id:'x',email:'test@example.org'},{enabled:false,plus:false,status:'unavailable'},x=>x);
 assert.match(html,/nicht freigeschaltet/);assert.doesNotMatch(html,/data-act="billingCheckout:/);
});
test('no checkout request when payments disabled',async()=>{
 await assert.rejects(checkoutSession({id:'test',email:'test@example.org'},'monthly',{}),/nicht freigeschaltet/);
});

test('unrelated Stripe products cannot grant Sauerteig Plus',()=>{const e={type:'customer.subscription.updated',created:1783000000,data:{object:{id:'sub_other',customer:'cus_1',status:'active',metadata:{user_id:'11111111-1111-4111-8111-111111111111'},items:{data:[{price:{id:'price_unrelated'}}]}}}};assert.equal(subscriptionFromEvent(e,{STRIPE_PRICE_MONTHLY:'price_123',STRIPE_PRICE_YEARLY:'price_456'}),null)});

test('subscription event is ignored when Stripe price is not configured',()=>{
 const e={type:'customer.subscription.updated',created:1783000000,data:{object:{id:'sub_1',customer:'cus_1',status:'active',metadata:{user_id:'11111111-1111-4111-8111-111111111111'},items:{data:[{price:{id:'price_123'}}]}}}};
 assert.equal(subscriptionFromEvent(e,{}),null);
});
test('Stripe portal stays available to existing subscribers after new checkout is disabled',async()=>{
 const source=(await import('node:fs')).readFileSync(new URL('../billing.mjs',import.meta.url),'utf8');
 const fn=source.slice(source.indexOf('export async function portalSession'),source.indexOf('export function subscriptionFromEvent'));
 assert.doesNotMatch(fn,/billingEnabled\(env\)/);
});
test('subscription updates use atomic database RPC rather than read-then-write',async()=>{
 const source=(await import('node:fs')).readFileSync(new URL('../billing.mjs',import.meta.url),'utf8');
 assert.match(source,/rpc\/apply_sourdough_subscription_event/);
});

test('a subscription only unlocks Plus when status AND configured price both match',()=>{
 const env={STRIPE_PRICE_MONTHLY:'price_approved_month',STRIPE_PRICE_YEARLY:'price_approved_year'};
 assert.equal(approvedPremium({status:'active',price_id:'price_approved_month'},env),true);
 assert.equal(approvedPremium({status:'trialing',price_id:'price_approved_year'},env),true);
 assert.equal(approvedPremium({status:'active',price_id:'price_other_app'},env),false);
 assert.equal(approvedPremium({status:'past_due',price_id:'price_approved_month'},env),false);
 assert.equal(approvedPremium({status:'canceled',price_id:'price_approved_month'},env),false);
 assert.equal(approvedPremium({status:'active',price_id:null},env),false);
});
test('checkout price must belong to the expected Stripe product',()=>{
 const price={active:true,currency:'eur',type:'recurring',recurring:{interval:'month'},unit_amount:490,tax_behavior:'inclusive',product:'prod_sauerteig'};
 assert.equal(validConsumerPrice(price,'month','prod_sauerteig'),true);
 assert.equal(validConsumerPrice(price,'month','prod_other_app'),false);
 assert.equal(validConsumerPrice({...price,tax_behavior:'unspecified'},'month','prod_sauerteig'),false);
});
