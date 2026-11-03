import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const renewal=app.slice(app.indexOf('let sessionRenewal='),app.indexOf('async function acceptAuthSession'));
function fixture(){let resolve,calls=0,saves=0;const context=vm.createContext({user:{id:'a'},token:'old',refreshToken:'refresh-a',auth:()=>{calls++;return new Promise(r=>resolve=r)},saveAuthSession:()=>saves++});vm.runInContext(renewal,context);return {context,get calls(){return calls},get saves(){return saves},finish:()=>resolve({access_token:'new',refresh_token:'new-refresh',user:{id:'a'}})};}
test('concurrent requests share one refresh and save once',async()=>{const f=fixture(),a=f.context.renewSession(),b=f.context.renewSession();assert.equal(f.calls,1);f.finish();await Promise.all([a,b]);assert.equal(f.saves,1);assert.equal(f.context.token,'new');});
test('a refresh completing after logout cannot restore the account',async()=>{const f=fixture(),pending=f.context.renewSession();f.context.user=null;f.context.refreshToken='';f.context.token='';f.finish();await assert.rejects(pending,/Konto wurde gewechselt/);assert.equal(f.saves,0);assert.equal(f.context.user,null);});
test('a refresh completing after account switch cannot overwrite the new account',async()=>{const f=fixture(),pending=f.context.renewSession();f.context.user={id:'b'};f.context.refreshToken='refresh-b';f.finish();await assert.rejects(pending,/Konto wurde gewechselt/);assert.equal(f.context.user.id,'b');assert.equal(f.saves,0);});
test('an old API response is rejected after account switch without retry',async()=>{let resolve,calls=0;const context=vm.createContext({user:{id:'a'},token:'a',refreshToken:'a',fetch:()=>new Promise(r=>resolve=r),renewSession:()=>calls++});vm.runInContext(app.slice(app.indexOf('async function request('),app.indexOf('const AUTH_SESSION_KEY')),context);const pending=context.request('/api/sync');context.user={id:'b'};resolve({status:401,ok:false,json:async()=>({})});await assert.rejects(pending,/Konto wurde gewechselt/);assert.equal(calls,0);});
