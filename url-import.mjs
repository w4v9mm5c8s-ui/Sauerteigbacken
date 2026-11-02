import https from 'node:https';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
function publicIp(ip){if(isIP(ip)===4){const a=ip.split('.').map(Number);return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&a[1]===168||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===192&&a[1]===0||a[0]===198&&a[1]>=18&&a[1]<=19||a[0]===192&&a[1]===0&&a[2]===2||a[0]===198&&a[1]===51&&a[2]===100||a[0]===203&&a[1]===0&&a[2]===113)}const v=ip.toLowerCase();return isIP(ip)===6&&!(/^(::|fc|fd|fe8|fe9|fea|feb|ff|2001:db8)/.test(v)||v.includes('%')||v.startsWith('::ffff:'))}
export async function fetchPublicRecipeUrl(value){
 let url;try{url=new URL(value)}catch{throw Error('Bitte eine gültige HTTPS-Adresse eingeben')}
 if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443'||isIP(url.hostname)||url.hostname==='localhost'||!url.hostname.includes('.')||value.length>2000)throw Error('Nur öffentliche HTTPS-Rezeptseiten sind erlaubt');
 const addresses=await lookup(url.hostname,{all:true,verbatim:true});if(!addresses.length||addresses.some(a=>!publicIp(a.address)))throw Error('Diese Adresse ist nicht erlaubt');
 const address=addresses[0];
 return new Promise((resolve,reject)=>{
 const req=https.request(url,{method:'GET',timeout:9000,maxHeaderSize:16000,headers:{'User-Agent':'SauerteigBuddyRecipeImporter/1.0','Accept':'text/html, text/plain;q=0.9'},lookup:(host,options,cb)=>cb(null,address.address,address.family)},res=>{
 if(res.statusCode!==200){res.resume();return reject(Error(res.statusCode>=300&&res.statusCode<400?'Weiterleitungen werden aus Sicherheitsgründen nicht automatisch geöffnet.':'Rezeptseite konnte nicht geladen werden'))}
 const type=res.headers['content-type']||'';if(!/text\/(html|plain)/i.test(type)){res.resume();return reject(Error('Die Seite enthält keinen lesbaren Rezepttext'))}
 let bytes=0;const parts=[];res.on('data',chunk=>{bytes+=chunk.length;if(bytes>350000){req.destroy(Error('Seite ist zu groß'));return}parts.push(chunk)});res.on('end',()=>{
 const raw=Buffer.concat(parts).toString('utf8');
 const text=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/\s+/g,' ').trim();
 if(text.length<80)return reject(Error('Auf der Seite wurde kein ausreichender Rezepttext gefunden'));
 resolve({text:text.slice(0,14000),source:url.origin+url.pathname})
 })});
 req.on('timeout',()=>req.destroy(Error('Rezeptseite antwortet nicht')));req.on('error',reject);req.end();
 })
}
