import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const origin='https://backen-mit-sauerteig.onrender.com';

function setup(seed,network){
 const handlers={},items=new Map(Object.entries(seed)),requests=[];
 const cache={
  match:async key=>items.get(key)?.clone()||undefined,
  put:async(key,response)=>{items.set(key,response);return undefined},
  addAll:async()=>undefined
 };
 const context={
  self:{location:{origin},addEventListener:(type,handler)=>{handlers[type]=handler},skipWaiting:()=>{},clients:{claim:async()=>{}}},
  caches:{open:async()=>cache,keys:async()=>[],delete:async()=>true},
  fetch:async(...args)=>{requests.push(args[0].url||args[0]);return network(...args)},
  URL,Request,Response,Set,Promise,console
 };
 vm.runInNewContext(source,context);
 async function request(path){
  let promise,waits=[];const event={
   request:new Request(origin+path),
   respondWith:val=>{promise=val},
   waitUntil:p=>waits.push(p)
  };
  handlers.fetch(event);
  if(!promise)return {unhandled:true};
  const response=await promise;
  await Promise.allSettled(waits);
  return {response,requests,items};
 }
 return {request,items};
}

test('cached homepage opens without a network wait while Render wakes',async()=>{
 const cached=new Response('<main id="main">Lokale Backstube</main>',{headers:{'Content-Type':'text/html'}});
 const sw=setup({'/index.html':cached},async()=>new Response('APPLICATION LOADING',{status:503,headers:{'Content-Type':'text/html'}}));
 const res=await sw.request('/');
 assert.match(await res.response.text(),/Lokale Backstube/);
 assert.equal(res.requests.length,1);
 assert.match(await sw.items.get('/index.html').text(),/Lokale Backstube/);
});

test('cached SVG remains a vector if Render returns a loading HTML document',async()=>{
 const cached=new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>',{headers:{'Content-Type':'image/svg+xml'}});
 const sw=setup({'/art-hero.svg':cached},async()=>new Response('<h1>APPLICATION LOADING</h1>',{status:200,headers:{'Content-Type':'text/html'}}));
 const res=await sw.request('/art-hero.svg');
 assert.match(await res.response.text(),/<svg/);
 assert.match(await sw.items.get('/art-hero.svg').text(),/<svg/);
});

test('private API requests are never served from the public offline cache',async()=>{
 const sw=setup({},async()=>new Response('{}'));
 const res=await sw.request('/api/config');
 assert.deepEqual(res,{unhandled:true});
});

test('service-worker script retains a dedicated new cache version',()=>{
 assert.match(source,/sauerteig-public-v23/);
 assert.match(source,/response\.ok/);
 assert.match(source,/isRealAsset/);
});
