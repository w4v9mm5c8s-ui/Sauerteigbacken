import test from 'node:test';
import assert from 'node:assert/strict';
import {validConsumerPrice} from '../billing.mjs';
import {billingView} from '../billing-ui.js';
test('checkout requires an active recurring EUR price including taxes',()=>{
 const p={active:true,currency:'eur',type:'recurring',unit_amount:500,tax_behavior:'inclusive',recurring:{interval:'month'}};
 assert.equal(validConsumerPrice(p,'month'),true);
 assert.equal(validConsumerPrice({...p,tax_behavior:'exclusive'},'month'),false);
 assert.equal(validConsumerPrice({...p,currency:'usd'},'month'),false);
 assert.equal(validConsumerPrice({...p,active:false},'month'),false);
});
test('price appears before a customer selects checkout',()=>{
 const html=billingView({id:'test'}, {enabled:true,plus:false,status:'inactive',plans:[{plan:'monthly',amount:500},{plan:'yearly',amount:5000}]},x=>x);
 assert.match(html,/5,00/);assert.match(html,/50,00/);assert.match(html,/inklusive Umsatzsteuer/);
});
test('guests can compare both tariffs and see Plus features before login',()=>{
 const html=billingView(null,{enabled:true,plans:[{plan:'monthly',amount:490},{plan:'yearly',amount:3990}]});
 for(const text of ['4,90','39,90','Monatsabo','Jahresabo','KI Buddy','Foto','billingLogin'])assert.ok(html.includes(text));
 assert.doesNotMatch(html,/billingCheckout:/);
});
