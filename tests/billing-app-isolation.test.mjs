import test from 'node:test';
import assert from 'node:assert/strict';
import {auxiliarySubscriptionId,resolveBillingEvent,subscriptionFromEvent,validConsumerPrice} from '../billing.mjs';

test('sourdough subscription pricing only uses its own Stripe product',()=>{
 const price={active:true,currency:'eur',type:'recurring',unit_amount:499,tax_behavior:'inclusive',recurring:{interval:'month'},product:'prod_sourdough'};
 assert.equal(validConsumerPrice(price,'month','prod_sourdough'),true);
 assert.equal(validConsumerPrice(price,'month','prod_unrelated'),false);
 assert.equal(validConsumerPrice({...price,active:false},'month','prod_sourdough'),false);
});

test('invoice and Checkout events resolve a subscription reference without trusting event status',()=>{
 assert.equal(auxiliarySubscriptionId({type:'checkout.session.completed',data:{object:{mode:'subscription',subscription:'sub_123'}}}),'sub_123');
 assert.equal(auxiliarySubscriptionId({type:'checkout.session.completed',data:{object:{mode:'payment',subscription:'sub_123'}}}),null);
 assert.equal(auxiliarySubscriptionId({type:'invoice.paid',data:{object:{parent:{subscription_details:{subscription:'sub_123'}}}}}),'sub_123');
 assert.equal(auxiliarySubscriptionId({type:'invoice.payment_failed',data:{object:{subscription:'sub_789'}}}),'sub_789');
 assert.equal(auxiliarySubscriptionId({type:'invoice.paid',data:{object:{subscription:'invalid'}}}),null);
});

test('webhook for another app cannot enable Sauerteig premium',()=>{
 const env={STRIPE_PRICE_MONTHLY:'price_123',STRIPE_PRICE_YEARLY:'price_456'};
 const event={type:'customer.subscription.updated',created:1793634000,data:{object:{id:'sub_foo',customer:'cus_foo',status:'active',metadata:{user_id:'11111111-1111-4111-8111-111111111111',app:'bondpop'},items:{data:[{price:{id:'price_123'}}]}}}};
 assert.equal(subscriptionFromEvent(event,env),null);
 assert.equal(subscriptionFromEvent({...event,data:{object:{...event.data.object,metadata:{...event.data.object.metadata,app:'sauerteig'}}}},env)?.status,'active');
});

test('subscription event returned by Stripe is verified for expected id before fulfilling',async()=>{
 const old=globalThis.fetch;
 const env={STRIPE_SECRET_KEY:'sk_test_fake'};
 const obj={id:'sub_wrong',object:'subscription'};
 globalThis.fetch=async()=>({ok:true,json:async()=>obj});
 try {
  await assert.rejects(resolveBillingEvent({type:'invoice.paid',created:1793634000,data:{object:{subscription:'sub_expected'}}},env),/Ungültiger Stripe-Abostatus/);
 }finally{globalThis.fetch=old;}
});
