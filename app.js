import {recipeResearchView} from './recipe-research.js';
import {recipeNeeds,inventoryBalance,consumeInventory,addMissingShopping,inventoryView,chatView,conflictView,resolveCloudChoices} from './workflow-tools.js';
import {enablePush,schedulePush,cancelPush,disablePush,cancelBakePush,scheduleReminder,scheduleBakeReminders,listReminders} from './push-client.js';
import {lessonView} from './interactive-lessons.js';
import {pdfPlanRecipes} from './pdf-recipe-plans.js';
import {doughWeight} from './dough-weight.js';
import {estimateStarterPeak,estimateFermentation,checkBanneton,waterBalance,PDF_SOAKER_RATIOS,seedWaterRatio,calculateStarterFeed} from './pdf-baking.js';
import {pdfToolsView,pdfToolCalculation} from './pdf-tools-ui.js';
import {pdfRecipesView} from './pdf-recipes.js';
import {readBackup,makeBackup} from './backup.js';
import {AUTH_REDIRECT_URL,normalizedAuthEmail,validateAuthFields,readableAuthError,parseAuthReturn,authView} from './auth-ui.js';
import {recipeCards,recipePicker,filterRecipeLibrary,recipeCategoryOptions,recipePhotoPath} from './recipe-gallery.js';
import {homeView,bakingDaysView} from './home.js';
import {bakeCalendar} from './calendar.js';
import {billingView} from './billing-ui.js';
import {actualBakeDurations} from './bake-metrics.js';
import {historicalView} from './historical.js';
import {uploadBakePhoto,signedBakePhoto,deleteBakePhoto} from './photos.js';
import {communityView,renderCommunityRows} from './community-ui.js';
import {resourcesView,conflictsView} from './resources.js';
import {flourSuggestion,waterTempSuggestion} from './flour-table.js';
import {onboardingView,onboardingSteps} from './onboarding.js';
import {starterListView,starterForecast,personalStartersPreview} from './starter-tracking.js';
import {bakeChoiceView,flourBlendRow,recipeBuilderView,readBlendEntries,readBlendQuantities,readBlendRecipe,blendSummary} from './recipe-builder.js';
import {flourBlendSuggestion} from './flour-mix.js';
import {canonicalFlourName} from './flour-table.js';
import {parseOwnRecipe,recipeToRaw} from './own-recipe-parser.js';
import {planningView,readPlanningForm,planFlourRow} from './planning-ui.js';
import {statsView,statsCsv} from './stats.js';
import {icon} from './icons.js';
import {pantryView} from './pantry.js';
import {hubView} from './hub.js';
import {calculatorView,calculateDough,calculateFeed} from './calculators.js';
import {knowledgeView,problemsView,setKnowledgeCards,knowledgeResults} from './knowledge.js';
import {ownRecipesView,normalizeExtractedRecipe} from './own-recipes.js';
import {backtagView} from './backtag.js';
import {makePlan,rescheduleRemaining} from './planner.js';
let cloudConflict=null,inventoryRecipe=null,inventoryScale=1;
let historicalRecipes=[],communityRows=[],resources=[],sourceConflicts=[],flourTable=[],recipes=[],current=null,tab='start',user=null,token='',refreshToken='',cfg={},scale=1,moderator=false,editingOwn=null,onboardingStep=0,planOrigin='recipeSelect',blendDraft=null,authMode='login',authEmail='',authError='',authNotice='',authRecovery=false,authPending=false;
const $=s=>document.querySelector(s),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const actionIcons={favorites:'heart',plan:'calendar',hub:'bread',recipes:'library',community:'users',shopping:'basket',knowledge:'book',starters:'flask',pantry:'wheat',buddy:'chat',own:'book',history:'history',stats:'chart',calculator:'calculator',problem:'help',import:'upload'};
const button=(label,action)=>'<button data-act="'+action+'">'+(actionIcons[action]?icon(actionIcons[action],18)+' ':'')+escape(label)+'</button>';
const box=s=>'<section class="card">'+s+'</section>';
const signInGate=message=>box('<h2>Anmeldung erforderlich</h2><p>'+escape(message)+'</p>'+button('Zum Konto und Anmelden','account'));

const note=t=>{const x=$('#toast');x.textContent=t;x.style.display='block';setTimeout(()=>x.style.display='none',4000)};
async function request(url,method='GET',data,retry=true){const owner=user?.id;const r=await fetch(url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})});const j=await r.json().catch(()=>({}));if(user?.id!==owner)throw Error('Das Konto wurde gewechselt. Bitte erneut versuchen.');if(r.status===401&&retry&&refreshToken){await renewSession();return request(url,method,data,false)}if(!r.ok)throw Error(j.error||j.error_description||j.msg||'Fehler');return j}
const AUTH_SESSION_KEY='sauerteig-session';
function saveAuthSession(){const saved=JSON.stringify({token,refreshToken,user});sessionStorage.setItem(AUTH_SESSION_KEY,saved);localStorage.setItem(AUTH_SESSION_KEY,saved)}
function clearAuthSession(){sessionStorage.removeItem(AUTH_SESSION_KEY);localStorage.removeItem(AUTH_SESSION_KEY);sessionStorage.removeItem('sauerteig-recovery-pending')}
function readAuthSession(){try{return JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY)||localStorage.getItem(AUTH_SESSION_KEY)||'null')}catch{return null}}
let authConfigPromise=null;
async function ensureAuthConfig(){
 if(cfg.supabaseUrl&&cfg.supabaseKey)return cfg;
 if(!authConfigPromise)authConfigPromise=loadApiConfig().then(value=>{cfg=value;return value}).finally(()=>{authConfigPromise=null});
 return authConfigPromise;
}
async function auth(path,data){
 const config=await ensureAuthConfig(),u=config.supabaseUrl+'/auth/v1/'+path;
 let response;
 try{response=await fetch(u,{method:'POST',headers:{apikey:config.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(25000)})}
 catch(e){throw Error('Serververbindung unterbrochen: '+(e.message||'Netzwerkfehler'))}
 const result=await response.json().catch(()=>({}));
 if(!response.ok){const e=new Error(result.error_description||result.msg||result.message||'Authentifizierung fehlgeschlagen');e.code=result.code||result.error_code||result.error||'';throw e}
 return result;
}
let sessionRenewal=null;
async function renewSession(){
 const original=refreshToken,owner=user?.id;
 if(!original)throw Error('Sitzung abgelaufen. Bitte neu anmelden.');
 if(sessionRenewal?.original===original)return sessionRenewal.promise;
 const pending={original,promise:null};
 pending.promise=(async()=>{const j=await auth('token?grant_type=refresh_token',{refresh_token:original});
 if(refreshToken!==original||user?.id!==owner)throw Error('Das Konto wurde gewechselt. Bitte erneut anmelden.');
 if(!j.access_token)throw Error('Sitzung abgelaufen. Bitte neu anmelden.');
 token=j.access_token;refreshToken=j.refresh_token||original;user=j.user||user;saveAuthSession();return j;
 })().finally(()=>{if(sessionRenewal===pending)sessionRenewal=null});sessionRenewal=pending;return pending.promise;
}

async function acceptAuthSession(result){
 if(!result?.access_token||!result?.refresh_token)throw Error('Bestätigungslink enthält keine gültige Sitzung.');
 const config=await ensureAuthConfig();
 const check=await fetch(config.supabaseUrl+'/auth/v1/user',{headers:{apikey:config.supabaseKey,Authorization:'Bearer '+result.access_token},signal:AbortSignal.timeout(20000)});
 if(!check.ok)throw Error('Die Sitzung konnte nicht bestätigt werden.');
 const verifiedUser=await check.json();
 if(!verifiedUser?.id)throw Error('Die Benutzerinformationen konnten nicht geladen werden.');
 token=result.access_token;refreshToken=result.refresh_token;user=verifiedUser;
 saveAuthSession();
}
async function submitAuthForm(){
 if(authPending)return;
 const mode=authMode,email=normalizedAuthEmail($('#email')?.value||authEmail);
 const password=$('#password')?.value||'',confirmation=$('#confirmPassword')?.value||'';
 authEmail=email;
 const validation=validateAuthFields(mode,{email,password,confirmation});
 if(validation){authError=validation;authNotice='';render();return}
 authError='';authNotice='';
 const submitButton=document.querySelector('#authForm button[type="submit"]');
 authPending=true;if(submitButton){submitButton.disabled=true;submitButton.textContent='Wird verarbeitet …'}
 try{
  if(mode==='login'){
   const result=await auth('token?grant_type=password',{email,password});
   await acceptAuthSession(result);
   authMode='login';authRecovery=false;tab='account';authNotice='Erfolgreich angemeldet.';
   await syncOnLogin();await refreshBilling();render();return
  }
  if(mode==='signup'){
   const result=await auth('signup?redirect_to='+encodeURIComponent(AUTH_REDIRECT_URL),{email,password});
   if(result.access_token&&result.refresh_token){
    await acceptAuthSession(result);authMode='login';tab='account';authRecovery=false;authNotice='Konto erstellt und angemeldet.';
    await syncOnLogin();await refreshBilling()
   }else{
    authMode='pendingSignup';tab='account';authNotice='Die Bestätigungsmail wurde angefordert. Prüfe auch den Spamordner.'
   }
   render();return
  }
  if(mode==='forgot'){
   await auth('recover?redirect_to='+encodeURIComponent(AUTH_REDIRECT_URL),{email});
   authMode='pendingReset';tab='account';authNotice='Falls ein Konto existiert, wird eine E-Mail versendet.';
   render();return
  }
  if(mode==='newPassword'){
   if(!authRecovery||!token)throw Error('Der Passwort-Link wurde noch nicht bestätigt oder ist abgelaufen.');
   const config=await ensureAuthConfig();
   const response=await fetch(config.supabaseUrl+'/auth/v1/user',{
    method:'PUT',headers:{apikey:config.supabaseKey,Authorization:'Bearer '+token,'Content-Type':'application/json'},
    body:JSON.stringify({password}),signal:AbortSignal.timeout(20000)
   });
   const result=await response.json().catch(()=>({}));
   if(!response.ok){const error=new Error(result.msg||result.message||'Passwort konnte nicht geändert werden.');error.code=result.code||result.error;throw error}
   authRecovery=false;sessionStorage.removeItem('sauerteig-recovery-pending');authMode='login';tab='account';authNotice='Dein neues Passwort wurde gespeichert. Du bist angemeldet.';
   saveAuthSession();render();return
  }
 }catch(e){authError=readableAuthError(e);authNotice='';render()}
 finally{authPending=false}
}
async function resendAuthConfirmation(){
 if(authPending)return;
 const email=normalizedAuthEmail($('#email')?.value||authEmail);
 authEmail=email;
 const validation=validateAuthFields('forgot',{email});
 if(validation){authError=validation;render();return}
 authPending=true;
 try{
  await auth('resend?redirect_to='+encodeURIComponent(AUTH_REDIRECT_URL),{email,type:'signup'});
  authMode='pendingSignup';authError='';authNotice='Ein neuer Bestätigungslink wurde angefordert. Prüfe dein Postfach und den Spamordner.';
 }catch(e){authError=readableAuthError(e);authNotice=''}
 finally{authPending=false;render()}
}
function scrubAuthReturnFromAddress(){
 try{const next=new URL(location.href);next.hash='';
  for(const key of ['access_token','refresh_token','token_hash','token','type','error','error_code','error_description','code'])next.searchParams.delete(key);
  history.replaceState(null,'',next.pathname+next.search)
 }catch{}
}
async function processAuthReturn(){
 const callback=parseAuthReturn(location.hash,location.search);
 if(callback.kind==='none')return false;
 if(callback.kind==='error'){
  authMode='linkError';authError=readableAuthError({code:callback.errorCode,message:callback.errorDescription});authNotice='';tab='account';
  scrubAuthReturnFromAddress();return true
 }
 if(callback.kind==='unsupported-code'){
  authMode='linkError';authError='Dieser Link stammt aus einem nicht unterstützten Bestätigungsablauf. Fordere bitte einen neuen Bestätigungs- oder Passwort-Link an.';authNotice='';tab='account';
  scrubAuthReturnFromAddress();return true
 }
 try{
  const result=callback.kind==='verify'?
   await auth('verify',{type:callback.type,token_hash:callback.tokenHash}):
   {access_token:callback.accessToken,refresh_token:callback.refreshToken};
  await acceptAuthSession(result);
  authRecovery=callback.type==='recovery';
  if(authRecovery)sessionStorage.setItem('sauerteig-recovery-pending','1');else sessionStorage.removeItem('sauerteig-recovery-pending');
  authMode=authRecovery?'newPassword':'login';tab='account';authError='';
  authNotice=authRecovery?'':'E-Mail-Adresse bestätigt. Du bist jetzt angemeldet.';
  scrubAuthReturnFromAddress();
  if(!authRecovery){await syncOnLogin();await refreshBilling()}
 }catch(e){
  authMode='linkError';authError=readableAuthError(e);authNotice='';tab='account';scrubAuthReturnFromAddress()
 }
 return true;
}
function localDateInput(d){const pad=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())}
function render(){document.body.dataset.page=tab;document.querySelectorAll('[data-icon]').forEach(e=>{e.innerHTML=icon(e.dataset.icon,24)});const activeNav=['start','hub','buddy','account'].includes(tab)?tab:['shopping','pantry','starters','onboarding','billing'].includes(tab)?'account':'hub';document.querySelectorAll('nav button').forEach(b=>{const active=b.dataset.tab===activeNav;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('#pageTitle').textContent=({start:'Start',recipes:current?.title||'Rezepte',plan:'Dein Backplan',buddy:'KI-Buddy',account:'Ich',billing:'Sauerteig Plus',shopping:'Einkaufsliste',starters:'Meine Starter',community:'Community-Backbuch',hub:'Womit legen wir los?',bakingDays:'Meine Backtage',recipeSelect:'Rezept auswählen',bakeChoice:'Jetzt backen',recipeBuilder:'Eigenes Rezept berechnen',onboarding:'Einrichtung',calculator:'Rechner',pdfTools:'PDF-Backwissen & Rechner',pdfRecipes:'Rezepte aus der PDF',knowledge:'Wissen',favorites:'Favoriten',historical:'Historische Rezepte',resources:'Weiterführende Quellen',conflicts:'Quellenkonflikte',problem:'Problem lösen',stats:'Meine Backstatistik',import:'Rezept importieren',history:'Meine Brote',pantry:'Meine Mehle & Vorrat',inventory:'Vorrat abgleichen',cloudConflict:'Cloud-Konflikt lösen',moderation:'Community prüfen',own:'Meine Rezepte',backtag:'Dein Backtag'})[tab]||'Backen mit Sauerteig';$('#main').innerHTML=(tab==='start'?'':'<button class="back-button" data-act="back">'+icon('arrow-left',18)+' Zurück</button>')+pages[tab]();if(tab==='backtag'){updateTimer();loadStepPhoto()}if(tab==='recipeBuilder'){restoreBlendDraft();refreshBlendPreview()}if(tab==='plan'){const profile=user?local().recipeProfiles?.[current?.id]:null;if(profile?.flours?.length)$('#planFlours').innerHTML=profile.flours.map((f,i)=>planFlourRow(f,i,flourTable,escape)).join('');for(const [id,v] of Object.entries(profile?.values||{})){const el=document.getElementById(id);if(el){if(el.type==='checkbox')el.checked=!!v;else el.value=v}}try{const draft=JSON.parse(sessionStorage.getItem('sauerteig-plan-draft-'+(current?.id||'new'))||'{}');for(const [id,v] of Object.entries(draft)){const el=document.getElementById(id);if(el){if(el.type==='checkbox')el.checked=!!v;else el.value=v}}}catch{} updatePdfPlanningHints()} }
const activeKey=()=>user?.id?'sourdough-active-'+user.id:'sourdough-active-guest';
const getActive=()=>{try{return JSON.parse(localStorage.getItem(activeKey())||'null')||(user?local().activeBake:null)}catch{return user?local().activeBake:null}};
const setActive=v=>{if(v)localStorage.setItem(activeKey(),JSON.stringify(v));else localStorage.removeItem(activeKey());if(user){const d=local();d.activeBake=v;save(d)}};
let screenWakeLock=null;
const timerKey=()=>{const b=getActive();return b?activeKey()+'-timer-'+(b.id||b.title)+'-'+b.index:null};function updateTimer(){const el=document.getElementById('timerDisplay'),key=timerKey();if(!el||!key)return;const end=Number(localStorage.getItem(key)||0);if(!end){const paused=Number(localStorage.getItem(key+'-paused')||0);el.textContent=paused?'Pausiert: '+Math.ceil(paused/60)+' Min. verbleibend':'Kein Timer aktiv';return}const left=Math.max(0,Math.ceil((end-Date.now())/1000));el.textContent=left?Math.floor(left/60)+' Min. '+String(left%60).padStart(2,'0')+' Sek. verbleibend':'Timer abgelaufen';if(!left){localStorage.removeItem(key);if('Notification' in window&&Notification.permission==='granted'){try{new Notification('Sauerteig Buddy',{body:'Dein Timer ist abgelaufen.'})}catch{}}}}setInterval(updateTimer,1000);
const parkedKey=()=>activeKey()+'-parallel';const getParked=()=>{try{return JSON.parse(localStorage.getItem(parkedKey())||'null')||(user?local().parallelBakes:[])||[]}catch{return user?local().parallelBakes||[]:[]}};const setParked=v=>{localStorage.setItem(parkedKey(),JSON.stringify(v));if(user){const d=local();d.parallelBakes=v;save(d)}};
let billingStatus={enabled:false,plus:false,status:'unavailable'};
async function refreshBilling(){if(!user)return;try{const status=await request('/api/billing/status');const plans=status.enabled?await request('/api/billing/plans'):{enabled:false,plans:[]};billingStatus={...status,enabled:status.enabled&&plans.enabled,plans:plans.plans||[]};if(tab==='billing')render()}catch{billingStatus={enabled:false,plus:false,status:'unavailable'}}}
const recipesForPlanning=()=>[...recipes,...pdfPlanRecipes(),...(user?(local().ownRecipes||[]).map(x=>x.recipe).filter(Boolean):[])];
const pages={
bakeChoice:()=>bakeChoiceView(),
recipeBuilder:()=>recipeBuilderView(flourTable,escape,user?(local().starters||[]):[]),
billing:()=>billingView(user,billingStatus,escape),
onboarding:()=>onboardingView(onboardingStep,escape),
hub:()=>hubView(button,!!user,local().history.length,(local().ownRecipes||[]).length),
calculator:()=>calculatorView(),
pdfTools:()=>pdfToolsView(flourTable,escape),
pdfRecipes:()=>pdfRecipesView(escape),
historical:()=>historicalView(historicalRecipes,escape),
favorites:()=>user?box('<div class="illustrated-section"><div><span class="hero-kicker">DEINE LIEBLINGSREZEPTE</span><h2>Deine Favoriten</h2></div><img src="/art-heart.svg" alt="" width="130" height="118" loading="lazy"></div>'+(local().favorites||[]).map(id=>[...recipes,...(local().ownRecipes||[]).map(x=>x.recipe).filter(Boolean)].find(r=>r.id===id)).filter(Boolean).map(r=>'<button class="item" data-act="recipe:'+escape(r.id)+'">'+icon('heart',18)+' '+escape(r.title)+'</button>').join('')+(local().communitySaved?.length?'<p class="muted">'+local().communitySaved.length+' gespeicherte Community-Rezepte findest du im Backbuch.</p>':'')+(!(local().favorites||[]).length?'<p class="muted">Noch keine Lieblingsrezepte gespeichert.</p>':'')):signInGate('Diese Funktion speichert persönliche Backdaten. Bitte melde dich an.'),
knowledge:()=>knowledgeView(escape)+'<div class="action-grid">'+button('Weiterführende Quellen','resources')+button('Quellenkonflikte','conflicts')+'</div>',
resources:()=>resourcesView(resources,escape),
conflicts:()=>conflictsView(sourceConflicts,escape),
problem:()=>problemsView(button),
stats:()=>statsView(local().history,escape),
import:()=>user?ownRecipesView(local().ownRecipes||[],escape,editingOwn):signInGate('Zum Importieren und Speichern eigener Rezepte melde dich bitte an.'),
pantry:()=>user?pantryView(local().pantry||[],escape):signInGate('Diese Funktion speichert persönliche Backdaten. Bitte melde dich an.'),
inventory:()=>user&&inventoryRecipe?inventoryView(inventoryRecipe,local().pantry,escape,inventoryScale):signInGate('Bitte anmelden und ein Rezept auswählen.'),
cloudConflict:()=>cloudConflict?conflictView(cloudConflict.local,cloudConflict.cloud,escape):box('<p>Kein Vergleich geöffnet.</p>'),
history:()=>box('<div class="illustrated-section"><div><span class="hero-kicker">DEINE BACKHISTORIE</span><h2>Meine Brote</h2></div><img src="/art-basket.svg" alt="" width="150" height="115" loading="lazy"></div>'+(local().history.length?local().history.map((x,i)=>({...x,index:i})).reverse().map(x=>'<details class="bake-log"><summary>'+escape(x.title)+' · '+escape(x.date)+'</summary><div class="stats-edit"><label>Bewertung (1–5)</label><select data-log="'+x.index+'" data-field="rating"><option value="">Keine</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'" '+(Number(x.rating)===n?'selected':'')+'>'+n+'</option>').join('')+'</select>'+[['flour','Verwendetes Mehl','text'],['hydration','Hydration (%)','number'],['doughTemp','Teigtemperatur (°C)','number'],['stockHours','Stockgare (Stunden)','number'],['proofHours','Stückgare (Stunden)','number'],['totalHours','Gesamtdauer (Stunden)','number'],['ovenSpring','Ofentrieb (1–5)','number'],['crumb','Krume (1–5)','number'],['crust','Kruste (1–5)','number'],['taste','Geschmack (1–5)','number']].map(([key,label,type])=>'<label>'+label+'</label><input data-log="'+x.index+'" data-field="'+key+'" type="'+type+'" '+(type==='number'?'step="0.1" min="0"':'')+' value="'+escape(x[key]??'')+'">').join('')+'</div>'+(Object.entries(x.stepLogs||{}).filter(([i,v])=>v.photoPath).map(([i,v])=>'<button data-act="historyPhoto:'+x.index+':'+i+'">Foto zu Schritt '+(Number(i)+1)+' ansehen</button>').join(''))+'<div id="historyPhotoPreview'+x.index+'"></div></details>').join(''):'<p class="muted">Noch kein Brot dokumentiert.</p>')),

start:()=>homeView({signed:!!user,active:getActive(),parked:getParked(),history:user?local().history:[],favorites:user?(local().favorites||[]):[],recipes,escape}),
bakingDays:()=>bakingDaysView({active:getActive(),parked:getParked(),escape}),
recipeSelect:()=>recipePicker(recipesForPlanning(),escape),
recipes:()=>current?button('← Alle Rezepte','clear')+box('<img class="recipe-detail-photo" src="'+recipePhotoPath(current)+'" alt="KI-generiertes Beispielbild" loading="lazy"><h2>'+escape(current.title)+'</h2><p class="muted">'+escape(current.yieldLabel)+' · '+escape(current.category)+'</p><label>Mengenfaktor</label><select id="scale"><option value="1">Normal</option><option value="0.5">Halb</option><option value="2">Doppelt</option></select><h3>Zutaten</h3>'+[...current.flours.map(x=>[canonicalFlourName(x.name),x.grams]),['Wasser',current.water],['Salz',current.salt],[current.starter.type+'starter',current.starter.grams],...current.extras.map(x=>[x.name,x.grams]),...(current.soaker?.items||[]).map(x=>[x.name+' (Quellstück)',x.grams])].map(x=>'<div class="row line"><span>'+escape(x[0])+'</span><strong>'+(x[1]==null?'Menge ergänzen':Math.round(x[1]*scale)+' g')+'</strong></div>').join('')+(current.sourceNote?'<p>'+escape(current.sourceNote)+'</p>':'')+recipeResearchView(current,escape)+'<h3>Zubereitung</h3>'+current.steps.map((s,i)=>'<div class="step">'+(i+1)+'. '+escape(s)+'</div>').join('')+'<p class="muted">Gärzeiten sind Richtwerte. Beurteile den Teigzustand.</p>'+button('Backtag planen','plan')+button('Rezept drucken','printRecipe')+(user?button('Vorrat prüfen','recipeInventory'):'')+(user?button('Zur Einkaufsliste','addShopping')+'<button class="favorite-toggle '+((local().favorites||[]).includes(current.id)?'is-favorite':'')+'" data-act="favorite:'+escape(current.id)+'">'+icon('heart',18)+' '+((local().favorites||[]).includes(current.id)?'Aus Favoriten entfernen':'Als Favorit merken')+'</button>':'')):(box('<div class="illustrated-section"><div><span class="hero-kicker">REZEPTSAMMLUNG</span><h2>Meine Rezepte</h2></div><div class="recipe-toolbar"><button type="button" data-act="focusRecipeSearch" aria-label="Rezepte suchen">'+icon('search',20)+'</button><button type="button" data-act="own" aria-label="Eigenes Rezept hinzufügen">'+icon('plus',20)+'</button></div><img src="/design/tile-backtage.png" alt="" loading="lazy" width="70" height="65"></div>','recipe-banner')+box('<label for="search">Rezept suchen</label><input id="search" placeholder="Rezept oder Mehl suchen …">'+recipeCategoryOptions(recipesForPlanning(),escape)+'<div class="pdf-recipe-library-link"><button type="button" data-act="pdfRecipes">PDF-Originalrezepte ansehen</button><small>9 Vorlagen mit Originalmengen und wichtigen Quellenhinweisen</small></div>'+(!recipes.length?'<button class="studio-retry" data-act="reloadCatalog">Rezeptbibliothek erneut laden</button>':'')+'<div id="recipeResults" class="recipe-gallery">'+recipeCards(recipesForPlanning(),escape,'recipe',user?(local().favorites||[]):[])+'</div>')),
plan:()=>planningView(current||recipes[0],escape,new Date(),flourTable,local().starters||[]),
buddy:()=>user?box('<img class="buddy-watercolor" src="/art-buddy.svg" alt="" loading="lazy" decoding="async"><div class="chat" id="messages">'+chatView(local().chatMessages,escape)+'</div><button data-act="clearChat">Gespräch löschen</button><label>Stelle dem KI-Buddy eine Frage</label><textarea id="question" placeholder="Was möchtest du wissen?"></textarea><label>Foto (optional)</label><input id="photo" type="file" accept="image/jpeg,image/png,image/webp"><label><input type="checkbox" id="consent" style="width:auto"> Ich stimme der KI-Auswertung meiner Angaben zu.</label>'+button('Senden','sendBuddy')+'<details><summary>Rezeptfoto importieren</summary><input type="file" id="recipePhoto" accept="image/jpeg,image/png,image/webp">'+button('Rezept auslesen','extract')+'</details>'):box('<p>Für den KI-Buddy ist eine Anmeldung nötig.</p>'+button('Anmelden','account')),
account:()=>user&&!authRecovery?(authNotice?'<p class="auth-feedback auth-notice" role="status">'+escape(authNotice)+'</p>':'')+personalStartersPreview(local().starters,escape)+box('<h2>Angemeldet</h2><p>'+escape(user.email)+'</p>'+'<div class="stack">'+button('Meine Mehle & Vorrat','pantry')+button('Einkaufsliste','shopping')+button('Wissen','knowledge')+button('Sauerteig Plus','billing')+button('Push aktivieren','timerNotify')+button('Push deaktivieren','pushDisable')+button('Push-Test in 1 Minute','pushTest')+button('Meine Erinnerungen','reminders')+'</div>'+button('Cloud-Konflikt vergleichen','compareCloud')+button('Konfliktsicherung exportieren','exportConflictBackup')+button('Cloud-Sicherung','push')+button('Cloud-Daten laden','pull')+button('Daten exportieren','exportData')+'<label for="backupFile">Datensicherung importieren</label><input id="backupFile" type="file" accept=".json,application/json">'+button('Datensicherung laden','importData')+button('Konto und Daten löschen','deleteAccount')+button('Abmelden','logout')):authView(authMode,{email:authEmail,error:authError,notice:authNotice},escape),
shopping:()=>user?box('<div class="illustrated-section"><div><span class="hero-kicker">DEIN EINKAUF</span><h2>Einkaufsliste</h2></div><img src="/design/tile-einkauf.png" alt="" width="150" height="115" loading="lazy"></div><div class="shopping-add"><label for="shopNewName" class="sr-only">Zutat hinzufügen</label><input id="shopNewName" placeholder="Zutat hinzufügen …" maxlength="100"><label for="shopNewGrams" class="sr-only">Menge in Gramm</label><input id="shopNewGrams" type="number" min="1" step="1" placeholder="g" aria-label="Menge in Gramm" style="max-width:64px"><button data-act="addShoppingManual" aria-label="Zutat hinzufügen">+</button></div><div id="shop"></div>'+button('Liste teilen','share')):signInGate('Diese Funktion speichert persönliche Backdaten. Bitte melde dich an.'),
starters:()=>user?box('<img class="section-watercolor" src="/art-starter.svg" alt="Aquarell eines Sauerteigglases"><h2>Meine Starter</h2><div id="starters"></div><label>Name</label><input id="starterName" placeholder="z. B. Wilma">'+'<label>Starterart</label><select id="newStarterType"><option>Weizen</option><option>Roggen</option><option>Dinkel</option></select><label>Verwendetes Mehl (optional)</label><input id="newStarterFlour" maxlength="90" placeholder="z. B. Weizenmehl Type 550"><label>Hydration (%)</label><input id="newStarterHydration" type="number" min="20" max="250" value="100"><label>Fütterungsverhältnis</label><select id="starterRatio"><option>1:2:2</option><option>1:1:1</option><option>1:3:3</option><option>1:5:5</option></select>'+button('Starter hinzufügen','addStarter')):signInGate('Diese Funktion speichert persönliche Backdaten. Bitte melde dich an.'),
backtag:()=>backtagView(getActive(),escape,!!user)+(getParked().length?box('<h3>Weitere laufende Backtage</h3>'+getParked().map((b,i)=>'<button class="item" data-act="switchBake:'+i+'">'+escape(b.title)+' · Schritt '+(b.index+1)+' von '+b.steps.length+'</button>').join('')):''),
own:()=>user?ownRecipesView(local().ownRecipes||[],escape,editingOwn):signInGate('Diese Funktion speichert persönliche Backdaten. Bitte melde dich an.'),
moderation:()=>moderator?box('<h2>Rezeptfreigaben</h2><div id="pendingRecipes"></div>'):box('Kein Zugriff.'),
community:()=>user?communityView(escape,local().communitySaved||[])+(moderator?button('Rezepte prüfen','moderation'):''):signInGate('Diese Funktion speichert persönliche Backdaten. Bitte melde dich an.')
};
const storageKey=()=>user?.id?'sauerteig-user-'+user.id:null;
const normalizeLocal=raw=>{const data=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};return {...data,shopping:Array.isArray(data.shopping)?data.shopping:[],starters:Array.isArray(data.starters)?data.starters:[],history:Array.isArray(data.history)?data.history:[],pantry:Array.isArray(data.pantry)?data.pantry:[],ownRecipes:Array.isArray(data.ownRecipes)?data.ownRecipes:[],favorites:Array.isArray(data.favorites)?data.favorites:[]}};
const local=()=>{try{return normalizeLocal(JSON.parse((storageKey()&&localStorage.getItem(storageKey()))||'{}'))}catch{return normalizeLocal({})}};let syncTimer;
const revisionKey=()=>storageKey()+'-cloud-revision',dirtyKey=()=>storageKey()+'-dirty';
let syncInFlight=Promise.resolve();
function pushLocal(){const owner=user?.id;const run=async()=>{if(!owner||user?.id!==owner)return;const snapshot=local(),result=await request('/api/sync','PUT',{payload:snapshot,revision:Number(localStorage.getItem(revisionKey())||0)});if(user?.id!==owner)return;localStorage.setItem(revisionKey(),String(result.revision));if(local().updatedAt===snapshot.updatedAt)localStorage.removeItem(dirtyKey());};syncInFlight=syncInFlight.catch(()=>{}).then(run);return syncInFlight;}
const save=d=>{if(!storageKey())throw Error('Bitte anmelden');d.updatedAt=Date.now();localStorage.setItem(storageKey(),JSON.stringify(d));localStorage.setItem(dirtyKey(),'1');clearTimeout(syncTimer);syncTimer=setTimeout(()=>pushLocal().catch(e=>note(e.message)),1500)};
async function syncOnLogin(){if(!user)return;const syncOwner=user.id;try{moderator=(await request('/api/moderation/me')).moderator===true}catch{moderator=false}try{const response=await request('/api/sync'),cloud=response.payload;if(user?.id!==syncOwner)return;const mine=local(),revision=Number(localStorage.getItem(revisionKey())||0);if(localStorage.getItem(dirtyKey())==='1'&&response.revision!==revision){note('Änderungen auf zwei Geräten. Unter Ich → Cloud-Konflikt vergleichen kannst du den gewünschten Stand je Bereich wählen.');return}if(localStorage.getItem(dirtyKey())==='1'){await pushLocal();return}localStorage.setItem(revisionKey(),String(response.revision||0));if(cloud){localStorage.setItem(storageKey(),JSON.stringify(normalizeLocal(cloud)));if(cloud.activeBake)localStorage.setItem(activeKey(),JSON.stringify(cloud.activeBake));else localStorage.removeItem(activeKey());if(cloud.parallelBakes)localStorage.setItem(parkedKey(),JSON.stringify(cloud.parallelBakes));else localStorage.removeItem(parkedKey())}else if(mine.updatedAt)await pushLocal()}catch(e){note(e.message||'Cloud-Abgleich derzeit nicht möglich')}}
function activeAt(date,from,to){const h=date.getHours()*60+date.getMinutes(),a=from.split(':').map(Number),b=to.split(':').map(Number),x=a[0]*60+a[1],y=b[0]*60+b[1];return x>y?(h>=x||h<y):(h>=x&&h<y)}
function readImage(file){return new Promise((ok,no)=>{if(!file)return ok(null);if(file.size>12000000)return no(Error('Bild zu groß (max. 12 MB)'));const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{try{const size=Math.min(1,1280/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*size));canvas.height=Math.max(1,Math.round(img.height*size));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',0.76);if(data.length>2100000)throw Error('Bild nach Verkleinerung noch zu groß');ok(data)}catch(e){no(e)}finally{URL.revokeObjectURL(url)}};img.onerror=()=>{URL.revokeObjectURL(url);no(Error('Bild konnte nicht gelesen werden'))};img.src=url})}
async function action(a,originElement=null){try{
if(a.startsWith('lesson:')){const [,id,step]=a.split(':');document.getElementById('lessonStage').innerHTML=lessonView(id,step);const done=document.querySelector('[data-lesson-done]');if(done)done.checked=localStorage.getItem('sourdough-lesson-'+id)==='1';document.getElementById('lessonStage').scrollIntoView({block:'nearest'});return}
if(['pdfFeed','pdfGare','pdfBasket','pdfWaterBalance','pdfStandardBake'].includes(a)){
 const values={};document.querySelectorAll('input[id^="pdf"],select[id^="pdf"]').forEach(node=>values[node.id]=node.value);
 const id={pdfFeed:'pdfFeedResult',pdfGare:'pdfGareResult',pdfBasket:'pdfBasketResult',pdfWaterBalance:'pdfWaterResult',pdfStandardBake:'pdfBakeResult'}[a];
 const output=document.getElementById(id);if(output){try{output.innerHTML=pdfToolCalculation(a,values,flourTable,escape)}catch(e){output.textContent=e.message||'Bitte Eingaben prüfen.'}}return
}

if(a.startsWith('problem:')){const topic=a.slice(8);tab='buddy';render();if(user){$('#question').value='Hilf mir bei folgendem Sauerteigproblem: '+topic}else note('Bitte anmelden, um den KI-Buddy zu nutzen.');return}
if(a.startsWith('communitySave:')){const id=a.slice(14),d=local();d.communitySaved=d.communitySaved||[];d.communitySaved=d.communitySaved.includes(id)?d.communitySaved.filter(x=>x!==id):[...d.communitySaved,id];save(d);showCommunity();return}
if(a.startsWith('communityReport:')){const reason=prompt('Warum möchtest du dieses Rezept melden?');if(!reason)return;if(reason.trim().length<5)throw Error('Bitte den Grund genauer beschreiben');await request('/api/community/report','POST',{id:a.slice(16),reason});note('Meldung eingereicht');return}
if(a==='recipeInventory'||a==='bakeInventory'){if(!user)throw Error('Bitte anmelden');inventoryRecipe=a==='bakeInventory'?getActive()?.ingredients:current;inventoryScale=a==='bakeInventory'?1:scale;tab='inventory';render();return}
if(a==='shoppingMissing'){const d=local();d.shopping=addMissingShopping(d.shopping,inventoryBalance(recipeNeeds(inventoryRecipe,inventoryScale),d.pantry));save(d);note('Fehlmengen ergänzt; vorhandene offene Einkaufspositionen berücksichtigt.');return}
if(a==='consumePantry'){const b=getActive();if(!b||JSON.stringify(b.ingredients)!==JSON.stringify(inventoryRecipe)||inventoryScale!==1)throw Error('Bitte den Vorrat direkt im gestarteten Backtag prüfen.');if(b.inventoryConsumedAt)throw Error('Für diesen Backtag wurde der Vorrat bereits abgezogen.');const d=local(),next=consumeInventory(recipeNeeds(inventoryRecipe),d.pantry);if(!confirm('Zutaten dieses Backtags jetzt vom Vorrat abziehen?'))return;d.pantry=next;b.inventoryConsumedAt=new Date().toISOString();localStorage.setItem(activeKey(),JSON.stringify(b));d.activeBake=b;save(d);render();note('Vorrat aktualisiert');return}
if(a.startsWith('pantryEdit:')){const i=Number(a.split(':')[1]),d=local(),row=d.pantry[i];if(!row)return;const value=prompt('Neuer Vorrat in Gramm für '+row.name,String(row.amount));if(value===null)return;const amount=Number(value.replace(',','.'));if(!Number.isFinite(amount)||amount<0||amount>1000000)throw Error('Bitte gültige Menge eingeben');row.amount=amount;save(d);render();return}
if(a==='clearChat'){if(!confirm('Gespeichertes KI-Gespräch löschen?'))return;const d=local();d.chatMessages=[];save(d);render();return}
if(a.startsWith('communityImport:')){if(!user)throw Error('Bitte anmelden');const row=communityRows.find(x=>x.id===a.slice(16));if(!row)throw Error('Rezept nicht gefunden');const d=local();d.ownRecipes.push({title:row.title,ingredients:row.ingredients,steps:row.instructions,bakeTemp:'',bakeMin:'',stockHours:'',proofHours:'',sourceCommunityId:row.id});editingOwn=d.ownRecipes.length-1;save(d);tab='own';render();note('Übernommen. Bitte Mengen und Garzeiten prüfen und ergänzen, dann speichern und planen.');return}
if(a==='compareCloud'){const owner=user?.id,response=await request('/api/sync');if(user?.id!==owner)return;cloudConflict={local:structuredClone(local()),cloud:normalizeLocal(response.payload),revision:response.revision,owner};tab='cloudConflict';render();return}
if(a==='resolveCloud'){if(!cloudConflict||cloudConflict.owner!==user?.id)throw Error('Bitte Vergleich erneut öffnen');const choices=Object.fromEntries([...document.querySelectorAll('[data-conflict-field]')].map(x=>[x.dataset.conflictField,x.value]));const resolved=resolveCloudChoices(cloudConflict.local,cloudConflict.cloud,choices);localStorage.setItem(storageKey()+'-conflict-backup',JSON.stringify(cloudConflict));clearTimeout(syncTimer);await syncInFlight.catch(()=>{});if(JSON.stringify(local())!==JSON.stringify(cloudConflict.local))throw Error('Lokale Daten haben sich geändert. Bitte Vergleich erneut öffnen.');const response=await request('/api/sync','PUT',{payload:resolved,revision:cloudConflict.revision});localStorage.setItem(storageKey(),JSON.stringify(resolved));localStorage.setItem(revisionKey(),String(response.revision));localStorage.removeItem(dirtyKey());if(resolved.activeBake)localStorage.setItem(activeKey(),JSON.stringify(resolved.activeBake));else localStorage.removeItem(activeKey());localStorage.setItem(parkedKey(),JSON.stringify(resolved.parallelBakes||[]));cloudConflict=null;tab='account';render();note('Ausgewählte Stände gespeichert');return}
if(a==='exportConflictBackup'){const content=localStorage.getItem(storageKey()+'-conflict-backup');if(!content)throw Error('Noch keine Konfliktsicherung vorhanden.');const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='sauerteig-konfliktsicherung.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}
if(a==='saveRecipeProfile'){if(!user)throw Error('Bitte anmelden');readPlanningForm(current,id=>document.getElementById(id));const d=local(),values={};for(const el of document.querySelectorAll('#main input[id],#main select[id]'))if(!['datetime-local','time'].includes(el.type))values[el.id]=el.type==='checkbox'?el.checked:el.value;d.recipeProfiles=d.recipeProfiles||{};d.recipeProfiles[current.id]={values,flours:[...document.querySelectorAll('[data-plan-flour-row]')].map(row=>({name:row.querySelector('.plan-flour-name').value,grams:Number(row.querySelector('.plan-flour-grams').value)}))};save(d);note('Eigene Rezeptvorgaben gespeichert');return}
if(a==='pantryAdd'){const name=$('#pantryName').value.trim(),amount=Number($('#pantryAmount').value);if(!name||!Number.isFinite(amount)||amount<0)throw Error('Bitte gültigen Vorrat eingeben');const d=local();d.pantry=d.pantry||[];d.pantry.push({name,amount});save(d);render();return}
if(a.startsWith('pantryDelete:')){const d=local();d.pantry=d.pantry||[];d.pantry.splice(Number(a.split(':')[1]),1);save(d);render();return}
if(a.startsWith('historyPhoto:')){const [,index,step]=a.split(':'),path=local().history[Number(index)]?.stepLogs?.[step]?.photoPath;if(!path)throw Error('Foto nicht gefunden');const url=await signedBakePhoto(cfg,token,path);if(!url)throw Error('Foto derzeit nicht abrufbar');const el=document.getElementById('historyPhotoPreview'+index),img=document.createElement('img');img.src=url;img.alt='Backfoto';img.className='bake-photo';el.replaceChildren(img);return}
if(a==='statsExport'){const blob=new Blob([statsCsv(local().history)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='sauerteig-backstatistik.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}
if(a==='exportCalendar'){const record=getActive();if(!record)throw Error('Kein Backtag vorhanden');const blob=new Blob([bakeCalendar(record)],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='sauerteig-backplan.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);note('Kalenderdatei erstellt');return}
if(a==='printRecipe'){window.print();return}
if(a==='calcDough'){const n=id=>Number(document.getElementById(id).value);const v=calculateDough(n('calcFlour'),n('calcWater'),n('calcSalt'),n('calcStarter'),n('calcStarterHyd'));$('#calcDoughResult').innerHTML='<p class="success">Teig: '+Math.round(v.total)+' g · Hydration: '+v.hydration.toFixed(1)+' % · Salz: '+v.saltPercent.toFixed(1)+' %</p>';return}
if(a==='calcFeed'){const p=calculateFeed(Number($('#calcFeedTotal').value),$('#calcFeedRatio').value);$('#calcFeedResult').innerHTML='<p class="success">'+p[0]+' g Anstellgut · '+p[1]+' g Mehl · '+p[2]+' g Wasser</p>';return}
if(a==='onboardingSkip'||a==='onboardingNext'){if(a==='onboardingSkip'||onboardingStep>=onboardingSteps-1){const d=local();d.onboarded=true;save(d);onboardingStep=0;tab='start'}else onboardingStep++;render();return}
if(a.startsWith('billingCheckout:')){if(!billingStatus.enabled)throw Error('Zahlung ist noch nicht freigeschaltet');const plan=a.split(':')[1];const j=await request('/api/billing/checkout','POST',{plan});location.assign(j.url);return}
if(a==='billingPortal'){const j=await request('/api/billing/portal','POST',{});location.assign(j.url);return}
if(a==='focusRecipeSearch'){document.getElementById('search')?.focus();return}
if(a==='reloadCatalog'){try{const r=await fetch('/recipes.json',{cache:'no-store'});if(!r.ok)throw Error();const list=await r.json();if(!Array.isArray(list))throw Error();recipes=list;render();note('Rezepte geladen')}catch{note('Rezepte noch nicht erreichbar. Bitte erneut versuchen.')}return}
if(a==='newPlan'){current=null;tab='bakeChoice';render();window.scrollTo(0,0);return}
if(a==='planFromRecipe'){current=null;planOrigin='recipeSelect';tab='recipeSelect';render();window.scrollTo(0,0);return}
if(a==='newRecipe'){blendDraft=null;tab='recipeBuilder';render();window.scrollTo(0,0);return}
if(a.startsWith('pdfPlan:')){current=pdfPlanRecipes().find(r=>r.id===a.slice(8));planOrigin='recipes';tab='plan';render();return}
if(a.startsWith('selectForPlan:')){const recipe=recipesForPlanning().find(r=>r.id===a.slice(14));if(!recipe)throw Error('Rezept nicht gefunden');current=recipe;planOrigin='recipeSelect';tab='plan';render();window.scrollTo(0,0);return}
if(a==='back'){if(tab==='backtag'){const b=getActive();if(b&&b.index>0){b.index--;setActive(b);render();return}tab='plan'}
else if(tab==='plan')tab=planOrigin==='recipeBuilder'?'recipeBuilder':planOrigin==='own'?'own':planOrigin==='recipes'?'recipes':'recipeSelect';
else if(tab==='recipeBuilder'||tab==='recipeSelect')tab='bakeChoice';
else if(tab==='bakeChoice')tab='hub';
else if(tab==='starters')tab='account';
else if(tab==='recipes'&&current)current=null;
else tab='start';
render();window.scrollTo(0,0);return}
if(pages[a]){if(a==='recipes')current=null;if(a==='plan')planOrigin='recipes';tab=a;render();window.scrollTo(0,0);if(a==='shopping')shop();if(a==='starters')starters();if(a==='community')community();if(a==='moderation')loadPending();if(a==='billing')refreshBilling();return}
if(a==='clear'){current=null;tab='recipes';render();return}
if(a.startsWith('recipe:')){current=recipesForPlanning().find(x=>x.id===a.slice(7));if(!current){note('Rezept noch nicht verfügbar. Öffne die Rezeptbibliothek erneut.');return}scale=1;tab='recipes';render();window.scrollTo(0,0);return}
if(a==='blendAdd'){
 const container=$('#blendRows'),rows=container?.querySelectorAll('[data-flour-row]');
 if(!container||!rows)throw Error('Mehlauswahl nicht verfügbar');
 if(rows.length>=16)throw Error('Maximal 16 Mehlsorten möglich');
 container.insertAdjacentHTML('beforeend',flourBlendRow(flourTable,escape,'','',rows.length));
 refreshBlendPreview();captureBlendDraft();return
}
if(a==='blendRemove'){
 const container=$('#blendRows'),row=originElement?.closest('[data-flour-row]');
 if(!container||!row)return;
 if(container.querySelectorAll('[data-flour-row]').length<=1)throw Error('Mindestens eine Mehlsorte muss bleiben');
 row.remove();refreshBlendPreview();captureBlendDraft();return
}
if(a==='planFlourAdd'){
 const container=$('#planFlours');if(!container)return;
 const items=[...container.querySelectorAll('[data-plan-flour-row]')];
 if(items.length>=16)throw Error('Maximal 16 Mehlsorten möglich');
 const n=Math.max(-1,...items.map(row=>Number(row.querySelector('.plan-flour-preset')?.id.replace('flourPreset',''))).filter(Number.isFinite))+1;
 container.insertAdjacentHTML('beforeend',planFlourRow({name:'',grams:0},n,flourTable,escape));return
}
if(a==='planFlourRemove'){
 const container=$('#planFlours'),row=originElement?.closest('[data-plan-flour-row]');
 if(!container||!row)return;
 if(container.querySelectorAll('[data-plan-flour-row]').length<=1)throw Error('Mindestens eine Mehlsorte muss bleiben');
 row.remove();refreshPlanBlendPreview();return
}
if(a==='blendSave'||a==='blendPlan'){
 captureBlendDraft();
 const {raw,suggested}=readBlendRecipe(document,flourTable);
 const parsed=parseOwnRecipe(raw);parsed.starter.hydration=suggested.starterHydration;
 if(a==='blendSave'){
  if(!user)throw Error('Für das Speichern melde dich bitte unter „Ich“ an. Die Berechnung ist auch ohne Konto möglich.');
  const data=local();data.ownRecipes=data.ownRecipes||[];
  data.ownRecipes.push({...raw,recipe:parsed});save(data);
  blendDraft=null;editingOwn=null;tab='own';render();note('Dein Rezept wurde gespeichert');return
 }
 current=parsed;planOrigin='recipeBuilder';tab='plan';render();window.scrollTo(0,0);return
}
if(a==='calculate'){
 const data=readPlanningForm(current||recipes[0],id=>document.getElementById(id));
 const profile=local().starters?.[Number(document.getElementById('starterProfile')?.value)];data.options.starterObservations=profile?.logs||[];data.options.occupied=[getActive(),...getParked()].filter(Boolean).flatMap(b=>b.steps.slice(b.index||0).filter(s=>s.active).map(s=>({at:s.at,minutes:s.minutes||5})));
 const p=makePlan(data.recipe,data.finish,data.from,data.to,data.ready,data.preheat,data.awayFrom,data.awayTo,data.options);
 const out=$('#planResult');
 if(!p){out.innerHTML='<p class="warning">Unter diesen Vorgaben konnte innerhalb von 21 Tagen kein sicherer Zeitplan berechnet werden. Passe die Schlaf- oder Abwesenheitszeiten an oder wähle eine geeignete Kühlschrankgare.</p>';return}
 const sum=doughWeight(data.recipe);
 out.innerHTML='<h3>Dein Backplan</h3><p class="muted">'+(p.shift?'Nächster passender Fertigtermin: '+new Date(p.finish).toLocaleString('de-DE'):'Dein Wunschtermin passt.')+'</p><p class="success">'+data.loaves+' fertige Brote · '+Math.round(sum)+' g roher Teig'+(data.estimatedFinishedWeight?' · ca. '+Math.round(data.estimatedFinishedWeight*data.loaves)+' g fertiges Brot (Schätzung)':'')+' · '+(p.cold?'Kühlschrankgare':'Stückgare')+'</p><div class="steps">'+p.steps.map((x,i)=>'<div class="step"><strong>'+new Date(x.at).toLocaleString('de-DE')+' · '+escape(x.title)+'</strong><p class="muted small">'+escape(x.detail)+'</p></div>').join('')+'</div><p class="muted small">'+escape(p.assumptions)+'</p>'+button('Backtag übernehmen','saveBake');
 window.lastPlan={...p,constraints:{...data.options,awayFrom:data.awayFrom,awayTo:data.awayTo},recipe:data.name,ingredients:data.recipe,temperatures:data.temperatures,estimatedFinishedWeight:data.estimatedFinishedWeight,bakeLoss:data.bakeLoss,starterHydration:data.starterHydration,loaves:data.loaves,createdAt:new Date().toISOString(),sleepFrom:data.from,sleepTo:data.to};
 return
}
if(a==='saveBake'){const requestedReminders=Boolean($('#planReminders')?.checked);if(!window.lastPlan)throw Error('Bitte erst einen Plan berechnen');if(window.lastPlan.shift&&!confirm('Der Backtermin musste auf '+new Date(window.lastPlan.finish).toLocaleString('de-DE')+' verschoben werden. Diesen Termin übernehmen?'))return;const previous=getActive();if(previous){const parked=getParked();parked.push(previous);setParked(parked)}setActive({title:window.lastPlan.recipe,constraints:window.lastPlan.constraints,steps:window.lastPlan.steps,index:0,finish:window.lastPlan.finish,id:Date.now(),ingredients:window.lastPlan.ingredients,temperatures:window.lastPlan.temperatures,starterHydration:window.lastPlan.starterHydration,loaves:window.lastPlan.loaves,createdAt:window.lastPlan.createdAt,sleepFrom:window.lastPlan.sleepFrom,sleepTo:window.lastPlan.sleepTo,logs:{}});if(requestedReminders){try{const b=getActive();await scheduleBakeReminders(cfg,token,user?.id,b);if(!user)throw Error('Bitte anmelden');b.remindersEnabled=true;setActive(b)}catch(e){note('Backtag gespeichert; Erinnerungen noch nicht aktiv: '+e.message)}}tab='backtag';render();return}
if(a==='reminders'){const owner=user?.id;const rows=await listReminders(cfg,token,owner);if(user?.id!==owner)return;$('#main').innerHTML='<section class="card"><h2>Erinnerungen auf diesem Gerät</h2>'+rows.map(r=>'<div class="item"><span>'+escape(r.message)+' · '+new Date(r.due_at).toLocaleString('de-DE')+(r.repeat_hours?' · alle '+r.repeat_hours+' h':'')+' · '+escape(r.state)+'</span><button data-act="removeReminder:'+escape(r.timer_key)+'">Entfernen</button></div>').join('')+'<button data-act="account">Zum Konto</button></section>';return}
if(a.startsWith('removeReminder:')){await cancelPush(cfg,token,user?.id,a.slice(15));note('Erinnerung entfernt');tab='account';render();return}
if(a==='bakeReminders'){const owner=user?.id,b=getActive();if(!user||!b)throw Error('Bitte anmelden und einen Backtag starten.');const count=await scheduleBakeReminders(cfg,token,owner,b);if(user?.id!==owner)return;b.remindersEnabled=true;setActive(b);note(count+' Arbeitsschritte als Erinnerung gespeichert');return}
if(a.startsWith('starterReminder:')){const owner=user?.id;const i=Number(a.split(':')[1]),d=local(),st=d.starters[i];if(!st)throw Error('Starter nicht gefunden');const interval=Number($('#starterReminderHours'+i).value),delay=Number($('#starterReminderFirst'+i).value);if(!Number.isInteger(interval)||interval<1||interval>8760||!Number.isFinite(delay)||delay<=0||delay>8760)throw Error('Bitte gültige Stunden angeben');st.id=st.id||crypto.randomUUID();await scheduleReminder(cfg,token,user.id,'starter-feed-'+st.id,Date.now()+delay*3600000,'Starter '+st.name+' füttern',interval);if(user?.id!==owner)return;st.reminderHours=interval;save(d);note('Wiederkehrende Fütterungserinnerung gespeichert');return}
if(a.startsWith('starterPeak:')){const owner=user?.id;const i=Number(a.split(':')[1]),d=local(),st=d.starters[i];if(!st)throw Error('Starter nicht gefunden');const hours=Number($('#starterPeakHours'+i).value);if(!Number.isFinite(hours)||hours<=0||hours>72)throw Error('Bitte Reifezeit bis 72 Stunden angeben');st.id=st.id||crypto.randomUUID();await scheduleReminder(cfg,token,user.id,'starter-peak-'+st.id,Date.now()+hours*3600000,'Reife von '+st.name+' prüfen. Der Teigzustand entscheidet.');if(user?.id!==owner)return;save(d);note('Reife-Erinnerung gespeichert');return}
if(a==='pushTest'){if(!user)throw Error('Bitte zuerst anmelden.');const scheduled=await schedulePush(cfg,token,user.id,'push-test',Date.now()+60000);if(!scheduled)throw Error('Bitte zuerst Push aktivieren.');note('Testnachricht geplant. Schließe die App; Zustellung kann etwa zwei Minuten dauern.');return}
if(a==='stepPhotoDelete'){const owner=user?.id,b=getActive(),index=b?.index,path=b?.logs?.[index]?.photoPath;if(!path)return;if(!confirm('Dieses Schrittfoto endgültig entfernen?'))return;await deleteBakePhoto(cfg,token,owner,path);if(user?.id!==owner)return;delete b.logs[index].photoPath;setActive(b);render();note('Foto entfernt');return}
if(a==='cancelBake'){const owner=user?.id,b=getActive();if(!b)return;if(!confirm('Diesen Backtag abbrechen? Er wird nicht als fertiges Brot gespeichert.'))return;const prefix=activeKey()+'-timer-'+(b.id||b.title)+'-';await cancelBakePush(cfg,token,owner,prefix,true);await cancelBakePush(cfg,token,owner,'bake-step-'+b.id+'-',true);if(user?.id!==owner)return;for(const key of Object.keys(localStorage))if(key.startsWith(prefix))localStorage.removeItem(key);const parked=getParked();setActive(parked.shift()||null);setParked(parked);tab=getActive()?'backtag':'bakingDays';render();note('Backtag abgebrochen');return}
if(a==='stepPhotoUpload'){const photoOwner=user?.id;if(!user)throw Error('Bitte anmelden, um Fotos zu speichern');const b=getActive();if(!b)throw Error('Kein Backtag vorhanden');const data=await readImage($('#stepPhoto')?.files?.[0]);if(!data)throw Error('Bitte Foto auswählen');if(user?.id!==photoOwner)throw Error('Das Konto wurde gewechselt. Bitte Foto erneut auswählen.');const path=await uploadBakePhoto(cfg,token,photoOwner,b.id,b.index,data);if(user?.id!==photoOwner)throw Error('Das Konto wurde gewechselt.');b.logs=b.logs||{};b.logs[b.index]={...b.logs[b.index],photoPath:path};setActive(b);await loadStepPhoto();note('Foto sicher gespeichert');return}
if(a==='stepSave'||a==='stepDelay'){
 const b=getActive();if(!b)throw Error('Kein Backtag vorhanden');
 if(a==='stepSave'){
 const temperature=$('#stepTemp')?.value,rise=$('#stepRise')?.value,noteText=$('#stepNote')?.value||'';
 if(temperature!==''&&(Number(temperature)<0||Number(temperature)>50)||rise!==''&&(Number(rise)<0||Number(rise)>500))throw Error('Bitte gültige Messwerte eingeben');
 b.logs=b.logs||{};b.logs[b.index]={...b.logs[b.index],temperature:temperature===''?null:Number(temperature),rise:rise===''?null:Number(rise),note:noteText.slice(0,3000),recordedAt:new Date().toISOString()};
 setActive(b);note('Messwerte gespeichert');return
 }
 const delay=Number($('#delayMinutes')?.value);if(!Number.isFinite(delay)||delay<1||delay>1440)throw Error('Bitte 1 bis 1440 Minuten eingeben');
 b.steps=rescheduleRemaining(b.steps,b.index,delay,b.sleepFrom||'22:00',b.sleepTo||'07:00',{...b.constraints,occupied:getParked().flatMap(x=>x.steps.slice(x.index||0).filter(s=>s.active))});b.finish=b.steps.findLast(x=>x.title==='Auskühlen lassen')?.at||b.finish;setActive(b);if(b.remindersEnabled)await scheduleBakeReminders(cfg,token,user?.id,b);render();note('Zeitplan aktualisiert');return
}
if(a.startsWith('timerPreset:')){const value=Number(a.slice(12));if($('#timerMinutes'))$('#timerMinutes').value=value;return}
if(a==='timerPause'){await cancelPush(cfg,token,user?.id,timerKey());const key=timerKey(),end=Number(localStorage.getItem(key)||0);if(end){localStorage.setItem(key+'-paused',String(Math.max(1,Math.ceil((end-Date.now())/1000))));localStorage.removeItem(key)}updateTimer();return}
if(a==='timerResume'){const key=timerKey(),seconds=Number(localStorage.getItem(key+'-paused')||0);if(seconds){const end=Date.now()+seconds*1000;await schedulePush(cfg,token,user?.id,key,end);localStorage.setItem(key,String(end));localStorage.removeItem(key+'-paused')}updateTimer();return}
if(a==='keepAwake'){if(!('wakeLock' in navigator))throw Error('Display-Wachhalten wird auf diesem Gerät nicht unterstützt');if(screenWakeLock){await screenWakeLock.release();screenWakeLock=null;note('Display-Wachhalten beendet')}else{screenWakeLock=await navigator.wakeLock.request('screen');note('Display bleibt nach Möglichkeit aktiv')}return}
if(a==='timerNotify'){await enablePush(cfg,token,user?.id);note('Push aktiviert. Erinnerungen können auch bei geschlossener App eintreffen; Zustellung kann sich verzögern.');return}
if(a==='pushDisable'){await disablePush(cfg,token,user?.id);note('Push deaktiviert und Erinnerungen gelöscht.');return}
if(a==='timerStart'){const n=Number($('#timerMinutes')?.value);if(!Number.isInteger(n)||n<1||n>1440)throw Error('Bitte 1 bis 1440 Minuten wählen');const end=Date.now()+n*60000;await schedulePush(cfg,token,user?.id,timerKey(),end);localStorage.setItem(timerKey(),String(end));localStorage.removeItem(timerKey()+'-paused');updateTimer();return}
if(a==='timerStop'){await cancelPush(cfg,token,user?.id,timerKey());if(timerKey()){localStorage.removeItem(timerKey());localStorage.removeItem(timerKey()+'-paused')}updateTimer();return}
if(a.startsWith('switchBake:')){const i=Number(a.slice(11)),parked=getParked(),selected=parked.splice(i,1)[0];if(!selected)return;const active=getActive();if(active)parked.push(active);setActive(selected);setParked(parked);tab='backtag';render();return}
if(a==='backPrevious'||a==='backNext'||a.startsWith('backJump:')){const b=getActive();if(!b)throw Error('Kein Backtag vorhanden');if(a==='backPrevious')b.index=Math.max(0,b.index-1);if(a.startsWith('backJump:'))b.index=Math.max(0,Math.min(b.steps.length-1,Number(a.split(':')[1])));if(a==='backNext'){if(b.remindersEnabled)await cancelPush(cfg,token,user?.id,'bake-step-'+b.id+'-'+b.index);b.logs=b.logs||{};b.logs[b.index]={...b.logs[b.index],completedAt:new Date().toISOString()};if(b.index===b.steps.length-1){if(user){const d=local();d.history.push({title:b.title,date:new Date().toLocaleDateString('de-DE'),finishedAt:new Date().toISOString(),rating:null,flour:b.ingredients?.flours?.map(f=>f.name).join(', ')||null,hydration:b.ingredients?.waterBalance?.hydration??(b.ingredients?Math.round((b.ingredients.water+b.ingredients.starter.grams*(b.starterHydration||100)/(100+(b.starterHydration||100)))/(b.ingredients.flours.reduce((n,f)=>n+f.grams,0)+b.ingredients.starter.grams*100/(100+(b.starterHydration||100)))*1000)/10:null),plannedAt:b.finish,startedAt:b.createdAt,roomTemp:b.temperatures?.room??null,plannedStockHours:b.ingredients?.stock?.[0]??null,plannedProofHours:b.ingredients?.proof?.[0]??null,stepLogs:b.logs||{},...actualBakeDurations(b.steps,b.logs||{}),actualTotalHours:b.createdAt?Math.round((Date.now()-new Date(b.createdAt).getTime())/360000)/10:null});save(d)}const parked=getParked();setActive(parked.pop()||null);setParked(parked);tab=getActive()?'backtag':'start';note('Backtag abgeschlossen');render();return}b.index++}setActive(b);render();return}
if(a.startsWith('favorite:')){if(!user){tab='account';render();note('Zum Speichern von Favoriten bitte anmelden');return}const id=a.slice(9),d=local();d.favorites=d.favorites||[];d.favorites=d.favorites.includes(id)?d.favorites.filter(x=>x!==id):[...d.favorites,id];save(d);render();return}
if(a.startsWith('recipeCat:')){const value=a.slice('recipeCat:'.length),select=document.getElementById('recipeCategory');if(select){select.value=value;refreshRecipeResults()}return}
if(a==='addShoppingManual'){const name=String(document.getElementById('shopNewName')?.value||'').trim(),grams=Number(document.getElementById('shopNewGrams')?.value);if(!name||!Number.isFinite(grams)||grams<=0||grams>100000){note('Bitte Zutat und gültige Menge in Gramm eingeben');return}const d=local(),entry=d.shopping.find(x=>String(x.name).toLocaleLowerCase('de-DE')===name.toLocaleLowerCase('de-DE'));if(entry)entry.grams=(Number(entry.grams)||0)+Math.round(grams);else d.shopping.push({name,grams:Math.round(grams),done:false});save(d);const input=document.getElementById('shopNewName'),amount=document.getElementById('shopNewGrams');if(input)input.value='';if(amount)amount.value='';shop();note('Zutat hinzugefügt');return}
if(a==='addShopping'){const d=local(),r=current;for(const x of [...r.flours.map(x=>[x.name,x.grams]),['Wasser',r.water],['Salz',r.salt],['Starter',r.starter.grams],...r.extras.map(x=>[x.name,x.grams]),...(r.soaker?.items||[]).map(x=>[x.name,x.grams])]){let row=d.shopping.find(y=>y.name===x[0]);if(row)row.grams+=Math.round(x[1]*scale);else d.shopping.push({name:x[0],grams:Math.round(x[1]*scale)})}save(d);note('Zutaten hinzugefügt');return}
if(a.startsWith('starterUpdate:')){const i=Number(a.slice(14)),d=local(),st=d.starters[i],name=$('#starterEditName'+i).value.trim(),hydration=Number($('#starterEditHydration'+i).value);if(!st||!name||hydration<20||hydration>250)throw Error('Bitte gültige Starterdaten eingeben');st.name=name;st.hydration=hydration;st.type=$('#starterEditType'+i)?.value||st.type;st.flourName=$('#starterEditFlour'+i)?.value.trim().slice(0,90)||'';save(d);starters();note('Starter aktualisiert');return}
if(a.startsWith('starterDelete:')){const i=Number(a.slice(14));if(!confirm('Diesen Starter wirklich löschen?'))return;const d=local();if(d.starters[i]?.id){await cancelPush(cfg,token,user?.id,'starter-feed-'+d.starters[i].id,true);await cancelPush(cfg,token,user?.id,'starter-peak-'+d.starters[i].id,true);}d.starters.splice(i,1);save(d);starters();return}
if(a.startsWith('starterRecord:')){const i=Number(a.slice(14)),d=local(),st=d.starters[i];if(!st)throw Error('Starter nicht gefunden');const temperature=Number($('#starterLogTemp'+i).value),peakHours=Number($('#starterLogHours'+i).value),ratio=$('#starterLogRatio'+i).value;if(temperature<5||temperature>40||peakHours<0.5||peakHours>72||!Number.isFinite(peakHours))throw Error('Bitte gültige Temperatur und Peakzeit eingeben');st.logs=st.logs||[];st.logs.push({date:new Date().toLocaleDateString('de-DE'),temperature,peakHours,ratio});st.ratio=ratio;save(d);starters();note('Startermessung gespeichert');return}
if(a.startsWith('feed:')){
 const i=Number(a.slice(5)),d=local(),st=d.starters?.[i];if(!st)throw Error('Starter nicht gefunden');
 const amount=prompt('Wie viel reifen Starter möchtest du insgesamt herstellen (g)?','180');
 if(amount===null)return;
 const target=Number(amount),parts=(st.ratio||'1:2:2').split(':').map(Number);
 if(!Number.isFinite(target)||target<=0||target>10000||parts.length!==3||parts.some(x=>!Number.isFinite(x)||x<=0))throw Error('Bitte Zielmenge und Fütterungsverhältnis prüfen.');
 const oldStarter=Math.round(target*parts[0]/parts.reduce((a,b)=>a+b,0)*10)/10;
 const fed=calculateStarterFeed({oldStarter,oldHydration:st.hydration,ratio:st.ratio||'1:2:2'});
 const msg='Fütterung nach Verhältnis '+(st.ratio||'1:2:2')+':\n'+fed.oldStarter+' g alter Starter\n'+fed.addedFlour+' g Mehl\n'+fed.addedWater+' g Wasser\nGesamt: '+fed.total+' g\nNeue Hydration: '+fed.newHydration+' % (bei tatsächlich verwendeten Mengen).';
 if(confirm(msg+'\n\nHast du die Fütterung genau so durchgeführt und möchtest sie protokollieren?')){
  st.hydration=fed.newHydration;st.logs=st.logs||[];
  st.logs.push({date:new Date().toLocaleDateString('de-DE'),ratio:st.ratio||'1:2:2',oldStarter:fed.oldStarter,flourAdded:fed.addedFlour,waterAdded:fed.addedWater,hydration:fed.newHydration,temperature:null,peakHours:null});
  save(d);starters();note('Fütterung protokolliert; Hydration aktualisiert.')
 }return
}
if(a==='approve' || a==='reject'){throw Error('Bitte Rezept auswählen')}
if(a.startsWith('moderate:')){const parts=a.split(':');await request('/api/moderation/decision','POST',{id:parts[2],status:parts[1]==='approve'?'published':'rejected'});await loadPending();note('Entscheidung gespeichert');return}
if(a==='ownSave'){
 const raw={title:$('#ownTitle').value,ingredients:$('#ownIngredients').value,steps:$('#ownSteps').value,bakeTemp:$('#ownBakeTemp').value,bakeMin:$('#ownBakeMin').value,stockHours:$('#ownStock').value,proofHours:$('#ownProof').value,starterType:$('#ownStarterType').value};
 const old=editingOwn!==null?local().ownRecipes?.[editingOwn]:null;
 const parsed=parseOwnRecipe({...raw,id:old?.recipe?.id});
 const d=local();d.ownRecipes=d.ownRecipes||[];
 const entry={...old,...raw,recipe:parsed};
 if(editingOwn===null)d.ownRecipes.push(entry);else d.ownRecipes[editingOwn]=entry;
 save(d);editingOwn=null;render();note('Rezept gespeichert');return
}
if(a.startsWith('ownEdit:')){editingOwn=Number(a.slice(8));render();return}
if(a.startsWith('ownDuplicate:')){const d=local(),i=Number(a.slice(13));if(!d.ownRecipes?.[i])return;const copy=structuredClone(d.ownRecipes[i]);copy.title+=' (Kopie)';if(copy.recipe){copy.recipe.title=copy.title;copy.recipe.id='own-'+Date.now()}d.ownRecipes.push(copy);save(d);render();return}
if(a.startsWith('ownPlan:')){const r=local().ownRecipes?.[Number(a.slice(8))]?.recipe;if(!r)throw Error('Bitte zuerst Rezeptangaben vervollständigen');current=r;planOrigin='own';tab='plan';render();return}
if(a.startsWith('ownDelete:')){const d=local();d.ownRecipes=d.ownRecipes||[];d.ownRecipes.splice(Number(a.slice(10)),1);save(d);editingOwn=null;render();return}
if(a==='ownFetchUrl'){const url=$('#ownImportUrl')?.value?.trim();if(!url)throw Error('Bitte Rezeptlink eingeben');const j=await request('/api/recipe-url','POST',{url});$('#ownImportText').value=j.text;if(j.structuredRecipe){$('#ownTitle').value=j.structuredRecipe.title;$('#ownIngredients').value=j.structuredRecipe.ingredients.join('\n');$('#ownSteps').value=j.structuredRecipe.steps.join('\n');note('Rezeptdaten übernommen. Mengen, Gärzeiten und Backtemperatur vor dem Speichern prüfen.')}else note('Rezepttext geladen. Prüfe ihn und starte bei Bedarf die KI-Auswertung.');return}
if(a==='ownImport'){if(!$('#ownImportConsent').checked)throw Error('Bitte KI-Auswertung erlauben');const text=$('#ownImportText').value.trim(),image=await readImage($('#ownImportPhoto').files[0]);if(!text&&!image)throw Error('Bitte Rezepttext oder Foto auswählen');const j=await request('/api/recipe-extract','POST',{text,image});const r=normalizeExtractedRecipe(j.recipe);$('#ownTitle').value=r.title;$('#ownIngredients').value=r.ingredients;$('#ownSteps').value=r.steps;note('Rezept ausgelesen. Bitte vor dem Speichern überprüfen.');return}
if(a==='addStarter'){const name=$('#starterName').value.trim(),hydration=Number($('#newStarterHydration').value);if(!name||!Number.isFinite(hydration)||hydration<20||hydration>250)throw Error('Bitte Name und gültige Starter-Hydration eingeben');const d=local();d.starters.push({name,type:$('#newStarterType').value,flourName:$('#newStarterFlour')?.value.trim().slice(0,90)||'',hydration,ratio:$('#starterRatio').value,logs:[]});save(d);render();starters();return}
if(a.startsWith('authMode:')){
 authEmail=normalizedAuthEmail($('#email')?.value||authEmail);
 authMode=a.slice('authMode:'.length);authError='';authNotice='';tab='account';render();return
}
if(a.startsWith('authToggle:')){
 const id=a.slice('authToggle:'.length);
 const input=document.getElementById(id),button=originElement?.closest('button');
 if(!input||!button)return;
 const visible=input.type==='password';input.type=visible?'text':'password';
 button.textContent=visible?'Verbergen':'Anzeigen';button.setAttribute('aria-label',visible?'Passwort verbergen':'Passwort anzeigen');button.setAttribute('aria-pressed',String(visible));
 return
}
if(a==='authSubmit'){await submitAuthForm();return}
if(a==='authResend'){await resendAuthConfirmation();return}
if(a==='login'||a==='signup'||a==='reset'){
 authMode=a==='reset'?'forgot':a==='signup'?'signup':'login';authError='';authNotice='';tab='account';render();return
}
if(a==='importData'){if(!user)throw Error('Bitte anmelden');const data=await readBackup(document.getElementById('backupFile')?.files?.[0]);if(!confirm('Die importierten Daten ersetzen deine bisherigen persönlichen Backdaten. Möchtest du fortfahren?'))return;if(data.activeBake)localStorage.setItem(activeKey(),JSON.stringify(data.activeBake));else localStorage.removeItem(activeKey());if(data.parallelBakes?.length)localStorage.setItem(parkedKey(),JSON.stringify(data.parallelBakes));else localStorage.removeItem(parkedKey());save(data);note('Datensicherung importiert. Cloud-Abgleich wird gestartet.');tab='account';render();return}
if(a==='exportData'){const snapshot=makeBackup(local(),getActive(),getParked());const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const link=document.createElement('a');link.href=u;link.download='sauerteig-daten.json';link.click();setTimeout(()=>URL.revokeObjectURL(u),5000);return}
if(a==='deleteAccount'){if(prompt('Zum endgültigen Löschen deines Kontos und deiner Daten schreibe: KONTO LÖSCHEN')!=='KONTO LÖSCHEN')return;const r=await fetch(cfg.supabaseUrl+'/functions/v1/delete-sourdough-account',{method:'POST',headers:{Authorization:'Bearer '+token,apikey:cfg.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({confirm:'KONTO LÖSCHEN'})});if(!r.ok){const j=await r.json().catch(()=>({}));throw Error(j.error||'Konto konnte nicht gelöscht werden. Bitte später erneut versuchen.')}const deletedOwner=user.id;for(const key of Object.keys(localStorage))if(key===storageKey()||key.startsWith('sourdough-active-'+deletedOwner)||key==='sourdough-push-device-'+deletedOwner||key===revisionKey()||key===dirtyKey()||key===storageKey()+'-conflict-backup')localStorage.removeItem(key);clearTimeout(syncTimer);clearAuthSession();user=null;token='';refreshToken='';moderator=false;billingStatus={enabled:false,plus:false,status:'unavailable'};render();note('Konto gelöscht');return}
if(a==='logout'){clearTimeout(syncTimer);try{await fetch(cfg.supabaseUrl+'/auth/v1/logout',{method:'POST',headers:{apikey:cfg.supabaseKey,Authorization:'Bearer '+token}})}catch{}user=null;token='';refreshToken='';billingStatus={enabled:false,plus:false,status:'unavailable'};clearAuthSession();render();return}
if(a==='push'){await pushLocal();note('Cloud-Sicherung abgeschlossen');return}
if(a==='pull'){const pullOwner=user?.id;if(localStorage.getItem(dirtyKey())==='1'&&!confirm('Lokale Änderungen durch die Cloud-Version ersetzen? Exportiere vorher eine Sicherung, wenn du sie behalten möchtest.'))return;const j=await request('/api/sync');if(user?.id!==pullOwner)return;if(j.payload){clearTimeout(syncTimer);localStorage.setItem(storageKey(),JSON.stringify(normalizeLocal(j.payload)));localStorage.setItem(revisionKey(),String(j.revision||0));localStorage.removeItem(dirtyKey());await syncOnLogin();render();note('Cloud-Daten geladen')}return}
if(a==='sendBuddy'){if(!$('#consent').checked)throw Error('Bitte der KI-Auswertung zustimmen');const question=$('#question').value,image=await readImage($('#photo').files[0]);const active=getActive();const context=active?'\nAktueller Backtag: '+active.title+'\nAktueller Schritt: '+(active.steps?.[active.index]?.title||'')+'\nRaumtemperatur: '+(active.temperatures?.room??'unbekannt')+' °C\nLetzte Beobachtung: '+(active.logs?.[active.index]?.note||'keine'):'';const j=await request('/api/buddy','POST',{question:question+context,image,history:(local().chatMessages||[]).slice(-12)});const d=local();d.chatMessages=[...(d.chatMessages||[]),{role:'user',content:question||(image?'Foto besprechen':'Frage'),at:new Date().toISOString()},{role:'assistant',content:j.answer,at:new Date().toISOString()}].slice(-80);save(d);if(tab==='buddy'){render();}return}
if(a==='extract'){const image=await readImage($('#recipePhoto').files[0]);const j=await request('/api/recipe-extract','POST',{image});alert('KI-Auslesung – bitte Angaben prüfen:\n'+JSON.stringify(j.recipe,null,2));return}
if(a==='submit'){await request('/api/community','POST',{title:$('#ctitle').value,ingredients:$('#cingredients').value,instructions:$('#cinstructions').value,author:$('#cauthor').value,flour:$('#cflour').value,difficulty:$('#cdifficulty').value,breadType:$('#cbreadType').value,starterType:$('#cstarterType').value,hydration:$('#chydration').value,totalHours:$('#ctotalHours').value});note('Zur Prüfung eingereicht');return}
if(a.startsWith('check:')){const d=local(),i=Number(a.slice(6));if(d.shopping[i]){d.shopping[i].done=!d.shopping[i].done;save(d);shop()}return}
if(a==='share'){const s=local().shopping.map(x=>x.name+' '+x.grams+' g').join('\n');if(navigator.share)await navigator.share({text:s});else{await navigator.clipboard.writeText(s);note('Kopiert')}return}
}catch(e){note(e.message||'Fehler')}}
function shop(){const target=$('#shop');if(!target)return;const entries=local().shopping;if(!entries.length){target.innerHTML='<p class="muted">Noch keine Zutaten. Füge oben eine Zutat hinzu oder übernimm sie aus einem Rezept.</p>';return}const grouped=[['Mehle & Getreide',[]],['Saaten & Körner',[]],['Sonstiges',[]]];for(const [index,entry] of entries.entries()){const name=String(entry.name||'').toLocaleLowerCase('de-DE');const group=/mehl|weizen|roggen|dinkel|hafer|emmer|einkorn|getreide|schrot/.test(name)?0:/kern|saat|sesam|leinsamen|mohn|sonnenblume|kürbis/.test(name)?1:2;grouped[group][1].push({entry,index})}target.innerHTML=grouped.filter(group=>group[1].length).map(([title,items])=>'<section class="shopping-category"><h3>'+title+'</h3>'+items.map(({entry,index})=>'<div class="shopping-item"><label><input type="checkbox" data-act="check:'+index+'" '+(entry.done?'checked':'')+'> <span>'+escape(entry.name||'Zutat')+'</span></label><strong>'+Math.max(0,Number(entry.grams)||0)+' g</strong></div>').join('')+'</section>').join('')}
function starters(){$('#starters').innerHTML=starterListView(local().starters,escape)}
async function loadPending(){try{const j=await request('/api/moderation/pending');$('#pendingRecipes').innerHTML=j.recipes.map(x=>'<div class="card"><h3>'+escape(x.title)+'</h3><p>'+escape(x.ingredients)+'</p><p>'+escape(x.instructions)+'</p>'+button('Freigeben','moderate:approve:'+x.id)+button('Ablehnen','moderate:reject:'+x.id)+'</div>').join('')||'<p>Keine offenen Rezepte.</p>'}catch(e){note(e.message)}}
async function loadStepPhoto(){const el=$('#stepPhotoPreview'),b=getActive();if(!el||!b)return;const path=b.logs?.[b.index]?.photoPath;if(!path)return;const url=await signedBakePhoto(cfg,token,path);if(url){const img=document.createElement('img');img.src=url;img.alt='Foto zum Backschritt';img.className='bake-photo';el.replaceChildren(img)}}
function showCommunity(){const el=$('#community');if(!el)return;el.innerHTML=renderCommunityRows(communityRows,escape,local().communitySaved||[],$('#communitySearch')?.value||'',$('#communityFlour')?.value||'',$('#communityDifficulty')?.value||'',$('#communitySort')?.value||'new',$('#communitySavedOnly')?.checked||false,{breadType:$('#communityBreadType')?.value||'',starterType:$('#communityStarter')?.value||'',minHyd:$('#communityHydMin')?.value||'',maxHyd:$('#communityHydMax')?.value||'',maxHours:$('#communityMaxHours')?.value||''})}
async function community(){try{const j=await request('/api/community');communityRows=j.recipes||[];showCommunity()}catch{$('#community').textContent='Community gerade nicht erreichbar'}}
document.addEventListener('change',e=>{if(e.target.dataset.lessonDone)localStorage.setItem('sourdough-lesson-'+e.target.dataset.lessonDone,e.target.checked?'1':'0')});
document.addEventListener('input',e=>{if(['communitySearch','communityBreadType','communityHydMin','communityHydMax','communityMaxHours'].includes(e.target.id))showCommunity()});
document.addEventListener('change',e=>{if(['communityFlour','communityDifficulty','communitySort','communitySavedOnly','communityStarter'].includes(e.target.id))showCommunity()});
document.addEventListener('submit',e=>{if(e.target.id==='authForm'){e.preventDefault();action('authSubmit')}});
document.addEventListener('input',e=>{if(e.target.id==='email'&&e.target.closest('#authForm'))authEmail=normalizedAuthEmail(e.target.value)});
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]')?.dataset.act||e.target.closest('[data-tab]')?.dataset.tab;if(a)action(a,e.target)});
document.addEventListener('input',e=>{if(e.target.id==='pickRecipeSearch'){const needle=e.target.value.toLocaleLowerCase('de-DE');const found=recipesForPlanning().filter(r=>r.title.toLocaleLowerCase('de-DE').includes(needle));const list=document.getElementById('pickRecipeResults');if(list)list.innerHTML=recipeCards(found,escape,'selectForPlan')}});
const refreshRecipeResults=()=>{const category=document.getElementById('recipeCategory')?.value||'',gallery=document.getElementById('recipeResults');if(gallery)gallery.innerHTML=recipeCards(filterRecipeLibrary(recipesForPlanning(),document.getElementById('search')?.value||'',category),escape,'recipe',user?(local().favorites||[]):[]);document.querySelectorAll('.recipe-category-chip').forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.act==='recipeCat:'+category)))};
document.addEventListener('input',e=>{if(e.target.id==='search')refreshRecipeResults()});
document.addEventListener('change',e=>{if(e.target.id==='recipeCategory')refreshRecipeResults();if(e.target.id==='knowledgeSearch'||e.target.id==='knowledgeCategory'){const q=$('#knowledgeSearch')?.value||'',category=$('#knowledgeCategory')?.value||'Alle';$('#knowledgeResults').innerHTML=knowledgeResults(escape,q,category)}if(['finish','sleepFrom','sleepTo','starterReady','awayFrom','awayTo','awayFrom2','awayTo2','recurringFrom','recurringTo','recurringDay0','recurringDay1','recurringDay2','recurringDay3','recurringDay4','recurringDay5','recurringDay6','preheat'].includes(e.target.id)){const draft={};for(const id of ['finish','sleepFrom','sleepTo','starterReady','awayFrom','awayTo','awayFrom2','awayTo2','recurringFrom','recurringTo','recurringDay0','recurringDay1','recurringDay2','recurringDay3','recurringDay4','recurringDay5','recurringDay6','preheat']){const el=document.getElementById(id);if(el)draft[id]=el.type==='checkbox'?el.checked:el.value}sessionStorage.setItem('sauerteig-plan-draft-'+(current?.id||'new'),JSON.stringify(draft))}});
document.addEventListener('change',e=>{if(e.target.dataset.log!==undefined){const d=local(),i=Number(e.target.dataset.log),field=e.target.dataset.field;if(d.history[i]&&['rating','flour','hydration','doughTemp','stockHours','proofHours','totalHours','ovenSpring','crumb','crust','taste'].includes(field)){d.history[i][field]=e.target.value===''?null:field==='flour'?e.target.value:Number(e.target.value);save(d);note('Backprotokoll gespeichert')}}});
document.addEventListener('change',e=>{if(e.target.dataset.rating!==undefined){const d=local(),i=Number(e.target.dataset.rating);if(d.history[i]){d.history[i].rating=e.target.value?Number(e.target.value):null;save(d);note('Bewertung gespeichert')}}});
document.addEventListener('change',e=>{
 const id=e.target.id;
 if(id==='starterProfile'&&e.target.value!==''){const st=local().starters?.[Number(e.target.value)];if(st){$('#starterType').value=st.type||'Weizen';$('#starterHydration').value=st.hydration||100;$('#feedRatio').value=st.ratio||'1:2:2';const temp=Number($('#roomTemp')?.value||22),f=starterForecast(st.logs||[],st.ratio||'1:2:2',temp);if(f){$('#starterHours').value=f.hours;note('Persönliche Reifezeit aus '+f.count+' Messungen übernommen')}else note('Noch keine verlässliche persönliche Reifeprognose vorhanden')}}
 if(id==='roomTemp'){const flour=$('#flourTemp');if(flour&&(!flour.dataset.custom||flour.dataset.custom==='false'))flour.value=e.target.value}
 if(id==='flourTemp')e.target.dataset.custom='true';
 if(/^flourPreset\d+$/.test(id)){
 const i=Number(id.replace('flourPreset','')),name=e.target.value,row=flourTable.find(x=>x.name===name);
 if(row){$('#flourName'+i).value=row.name;const n=Number($('#flourAmount'+i).value),suggestion=flourSuggestion(flourTable,name,n);if(suggestion&&document.querySelectorAll('[id^="flourPreset"]').length===1){$('#waterAmount').value=suggestion.water;$('#starterAmount').value=suggestion.starter;$('#starterType').value=suggestion.starterType==='roggen'?'Roggen':'Weizen';note('Wasser und Starter aus der Mehltabelle vorgeschlagen')}}
 }
 if(['targetTemp','flourTemp','starterTemp'].includes(id)){
 const target=Number($('#targetTemp')?.value),flour=Number($('#flourTemp')?.value),starter=Number($('#starterTemp')?.value||$('#roomTemp')?.value);
 const value=waterTempSuggestion(target,flour,starter);
 if($('#waterSuggestion'))$('#waterSuggestion').textContent=value===null?'':'Wassertemperatur als grobe Orientierung: '+value+' °C';
 }
 if(/^flourAmount\d+$/.test(id)){const rows=[...document.querySelectorAll('[id^="flourAmount"]')],total=rows.reduce((a,x)=>a+Number(x.value||0),0);if($('#flourPerLoaf')&&total>0)$('#flourPerLoaf').value=total}
});
document.addEventListener('change',e=>{if(e.target.id==='scale'){scale=Number(e.target.value);render();$('#scale').value=String(scale)}});

function captureBlendDraft(){
 const root=$('#blendRows');if(!root)return;
 const ids=['blendSaltPct','blendHydration','blendWater','blendStarter','blendSalt','blendStarterType','blendSavedStarter','blendTitle','blendSteps','blendBakeTemp','blendBakeMin','blendStockHours','blendProofHours'];
 const values={};for(const id of ids){const el=document.getElementById(id);if(el)values[id]=el.value}
 blendDraft={rows:readBlendEntries(document),values,auto:!!$('#blendAuto')?.checked,
  manualStarter:$('#blendStarterType')?.dataset.userSelected==='1',
  details:!!$('#blendRecipeDetails')?.open};
}
function restoreBlendDraft(){
 const saved=blendDraft,root=$('#blendRows');if(!saved||!root)return;
 if(saved.rows.length&&flourTable.length)root.innerHTML=saved.rows.map((row,i)=>flourBlendRow(flourTable,escape,row.name,row.grams,i)).join('');
 for(const [id,value] of Object.entries(saved.values||{})){const el=document.getElementById(id);if(el)el.value=value}
 if($('#blendAuto'))$('#blendAuto').checked=saved.auto;
 if($('#blendStarterType'))$('#blendStarterType').dataset.userSelected=saved.manualStarter?'1':'';
 if($('#blendRecipeDetails'))$('#blendRecipeDetails').open=saved.details;
}
function refreshBlendPreview(){
 const el=$('#blendResult');if(!el)return;
 const auto=$('#blendAuto')?.checked;
 for(const id of ['blendWater','blendStarter','blendSalt']){const field=document.getElementById(id);if(field)field.readOnly=!!auto}
 try{
  const mixture=flourBlendSuggestion(flourTable,readBlendEntries(document),{saltPercent:Number($('#blendSaltPct')?.value),starterHydration:Number($('#blendHydration')?.value)});
  if(auto){
   $('#blendWater').value=mixture.water;
   $('#blendStarter').value=mixture.starter;
   $('#blendSalt').value=mixture.salt;
   if($('#blendStarterType')?.dataset.userSelected!=='1')$('#blendStarterType').value=mixture.suggestedStarter.charAt(0).toUpperCase()+mixture.suggestedStarter.slice(1);
  }
  const water=Number($('#blendWater')?.value),starter=Number($('#blendStarter')?.value),salt=Number($('#blendSalt')?.value);
  el.innerHTML=blendSummary(mixture,water,starter,salt);
 }catch(e){el.textContent=e.message||'Bitte Mehlmengen prüfen.'}
}
function updatePdfPlanningHints(){
 if(!document.getElementById('planFlours'))return;
 const n=id=>Number(document.getElementById(id)?.value??0),v=id=>document.getElementById(id)?.value||'';
 try{
  const flours=[...document.querySelectorAll('#planFlours [data-plan-flour-row]')].map(r=>({name:(r.querySelector('.plan-flour-name')?.value||'').trim(),grams:Number(r.querySelector('.plan-flour-grams')?.value)})).filter(x=>x.name&&x.grams>0);
  if(!flours.length)return;
  const mass=flours.reduce((sum,x)=>sum+x.grams,0);
  const peak=estimateStarterPeak({ratio:v('feedRatio')||'1:2:2',temperature:n('roomTemp'),type:v('starterType')});
  const hint=document.getElementById('pdfStarterPeakHint'),starterHours=document.getElementById('starterHours');
  if(hint)hint.textContent=peak.hours===null?peak.warning:'PDF S. 12: Peak ungefähr '+peak.hours+' ± '+peak.uncertainty+' h bei '+peak.temperature+' °C. Reifezeichen haben Vorrang.';
  if(starterHours&&peak.hours===null&&starterHours.dataset.pdfAuto==='1')starterHours.value='';
  if(starterHours&&peak.hours!==null&&(!starterHours.value||starterHours.dataset.pdfAuto==='1')){starterHours.value=peak.hours;starterHours.dataset.pdfAuto='1'}
  const stock=estimateFermentation({kind:'stock',temperature:n('roomTemp'),flours,flourTable,starterHydration:n('starterHydration'),starterGrams:n('starterAmount'),flourTotal:mass});
  const proof=estimateFermentation({kind:'proof',temperature:n('roomTemp'),flours,flourTable});
  const result=document.getElementById('pdfTimingReference');
  if(result)result.textContent='PDF-Stockgare: '+(stock.hours??'außerhalb Tabelle')+' h; Stückgare: '+(proof.hours??'außerhalb Tabelle')+' h. '+(stock.warning||stock.reason||'Teigzustand prüfen.');
  if(document.getElementById('planAutoTimes')?.checked){if(stock.valid&&stock.hours!==null)document.getElementById('stockHours').value=stock.hours;if(proof.hours!==null)document.getElementById('proofHours').value=proof.hours}
  const seedItems=current?.soaker?.items||[],seedMass=seedItems.reduce((sum,x)=>sum+x.grams,0),seedWater=seedMass?Number(current.soaker.water)||0:0;
  const extras=(current?.extras||[]).filter(x=>!['belag','blech','fuellung','füllung','bad','topping','garnitur','dekoration','deko'].includes(x.role)).reduce((sum,x)=>sum+x.grams,0);
  const raw=mass+n('waterAmount')+n('starterAmount')+n('saltAmount')+n('altbrot')+n('soakerAmount')+seedMass+extras;
  const weight=n('finishedWeight')>0?n('finishedWeight')/(1-n('bakeLoss')/100):raw*n('flourPerLoaf')/mass;
  const shape=v('basketShape'),basket=shape!=='none'?checkBanneton(weight,shape):null;
  const b=document.getElementById('basketHint');if(b)b.textContent=basket?.size?'PDF S. 23: '+basket.size.join('–')+' cm '+(shape==='round'?'Durchmesser':'Länge'):basket?.warning||'Kein Gärkörbchen erforderlich.';
  const soaker=n('soakerAmount'),name=v('soakerKind'),autoSoaker=document.getElementById('autoSoakerWater');
  if(autoSoaker?.checked){
   const absorption=seedWaterRatio(name);
   if(soaker>0&&absorption!==null){document.getElementById('soakerWater').value=Math.round(soaker*absorption*10)/10}
   else if(soaker===0&&document.getElementById('soakerWater'))document.getElementById('soakerWater').value=0;
  }
  const ratio=soaker?n('soakerWater')/soaker:0;
  const balance=waterBalance({flours,totalWater:n('waterAmount'),starter:n('starterAmount'),starterHydration:n('starterHydration'),
   altbrot:n('altbrot'),altbrotRatio:n('altbrotRatio')||3,
   soakers:[...seedItems.map(x=>({...x,ratio:seedWater/seedMass})),...(soaker?[{name:v('soakerKind'),grams:soaker,ratio}]:[])],brewFlour:n('brewFlour'),brewWater:n('brewWater')});
  const target=document.getElementById('pdfWaterCheck');if(target)target.textContent='Wasserbilanz: '+balance.mainWater+' g im Hauptteig, '+balance.reserve+' g für Vorstufen, insgesamt '+balance.totalRecipeWater+' g.';
 }catch(e){const target=document.getElementById('pdfWaterCheck');if(target)target.textContent=e.message||'Bitte Werte prüfen.'}
}
function refreshPlanBlendPreview(){
 const container=$('#planFlours'),preview=$('#doughPreview');
 if(!container||!preview)return;
 const rows=[...container.querySelectorAll('[data-plan-flour-row]')];
 const entries=rows.map(row=>({name:(row.querySelector('.plan-flour-name')?.value||row.querySelector('.plan-flour-preset')?.value||'').trim(),grams:Number(row.querySelector('.plan-flour-grams')?.value)})).filter(x=>x.grams>0);
 const total=entries.reduce((a,x)=>a+x.grams,0);
 if(total>0&&$('#flourPerLoaf'))$('#flourPerLoaf').value=Math.round(total*10)/10;
 try{
  if(!entries.length)throw Error('Bitte mindestens eine Mehlmenge eingeben.');
  const hydration=Number($('#starterHydration')?.value)||100;
  const mixture=flourBlendSuggestion(flourTable,entries,{starterHydration:hydration});
  if($('#planAutoIngredients')?.checked){
   if($('#waterAmount'))$('#waterAmount').value=mixture.water;
   if($('#starterAmount'))$('#starterAmount').value=mixture.starter;
   if($('#saltAmount'))$('#saltAmount').value=mixture.salt;
   if($('#starterType'))$('#starterType').value=mixture.suggestedStarter.charAt(0).toUpperCase()+mixture.suggestedStarter.slice(1);
  }
  const water=Number($('#waterAmount')?.value),starter=Number($('#starterAmount')?.value),salt=Number($('#saltAmount')?.value);
  preview.textContent='Mehl '+mixture.flourTotal+' g · Wasser '+water+' g · Starter '+starter+' g · Salz '+salt+' g · Teig ca. '+(Math.round((mixture.flourTotal+water+starter+salt)*10)/10)+' g. Mengen nach Mehltabelle; Gärzeiten bleiben rezeptabhängig.';
 }catch(e){preview.textContent='Automatischer Vorschlag nicht möglich: '+(e.message||'Mehlsorten prüfen')+'. Mengen können manuell eingegeben werden.'}
}
document.addEventListener('input',e=>{
 if(e.target.closest('#blendRows')||['blendSaltPct','blendHydration','blendWater','blendStarter','blendSalt'].includes(e.target.id)){refreshBlendPreview();captureBlendDraft()}
 if(e.target.closest('#planFlours')&&e.target.classList.contains('plan-flour-grams')){refreshPlanBlendPreview();updatePdfPlanningHints()}
 if(e.target.id==='soakerWater'&&e.isTrusted&&document.getElementById('autoSoakerWater'))document.getElementById('autoSoakerWater').checked=false;
 if(['roomTemp','starterAmount','starterHydration','altbrot','soakerAmount','soakerWater','waterAmount','brewFlour','brewWater','loaves'].includes(e.target.id))updatePdfPlanningHints();
 if(e.target.id==='starterHours'&&e.isTrusted)e.target.dataset.pdfAuto='0';
 
 if(e.target.closest('#blendRecipeDetails'))captureBlendDraft();
});
document.addEventListener('change',e=>{
 if(e.target.id==='blendAuto'){refreshBlendPreview();captureBlendDraft()}
 if(e.target.id==='blendSavedStarter'){
  const st=local().starters?.[Number(e.target.value)];
  if(e.target.value!==''&&st){
   if($('#blendStarterType')){$('#blendStarterType').value=st.type||'Weizen';$('#blendStarterType').dataset.userSelected='1'}
   if($('#blendHydration'))$('#blendHydration').value=st.hydration||100;
  }
  refreshBlendPreview();captureBlendDraft();
 }
 if(e.target.id==='blendStarterType')e.target.dataset.userSelected='1';
 if(e.target.closest('#blendRows')||e.target.closest('#blendRecipeDetails')){refreshBlendPreview();captureBlendDraft()}
 if(e.target.closest('#planFlours')){
  if(e.target.classList.contains('plan-flour-preset')){
   const row=e.target.closest('[data-plan-flour-row]');if(e.target.value&&row)row.querySelector('.plan-flour-name').value=e.target.value;
  }
  if(e.target.classList.contains('plan-flour-name')){
   const row=e.target.closest('[data-plan-flour-row]');const select=row?.querySelector('.plan-flour-preset');if(select&&select.value!==e.target.value)select.value='';
  }
  refreshPlanBlendPreview();
 }
 if(e.target.id==='planAutoIngredients'&&e.target.checked)refreshPlanBlendPreview();
 if(['planAutoTimes','feedRatio','starterType','soakerKind','autoSoakerWater','altbrotRatio','basketShape','pdfBakeStandard'].includes(e.target.id))updatePdfPlanningHints();
});

async function loadApiConfig(){
 const delays=[0,3000,6000,11000,18000,26000];
 for(const delay of delays){
  if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
  try{
   const response=await fetch('/api/config',{cache:'no-store',signal:AbortSignal.timeout(8000)});
   if(response.ok){const json=await response.json();if(json&&json.supabaseUrl&&json.supabaseKey)return json}
  }catch{}
 }
 throw Error('Der Server ist noch nicht erreichbar');
}
(async()=>{try{render();try{const response=await fetch('/recipes.json',{cache:'no-cache'});if(response.ok){const list=await response.json();if(Array.isArray(list))recipes=list;}}catch{console.warn('Rezeptdaten aktuell nicht verfügbar')}try{flourTable=await(await fetch('/flour-table.json')).json()}catch{}try{resources=await(await fetch('/resources.json')).json();sourceConflicts=await(await fetch('/source-conflicts.json')).json();historicalRecipes=await(await fetch('/historical-recipes.json')).json()}catch{}try{setKnowledgeCards(await(await fetch('/knowledge-data.json')).json())}catch{}render();cfg=await loadApiConfig();const incoming=parseAuthReturn(location.hash,location.search);
if(incoming.kind!=='none'){
 await processAuthReturn();
}else{
 const saved=readAuthSession();
 if(saved?.refreshToken&&saved?.user){
  token=saved.token||'';refreshToken=saved.refreshToken;user=saved.user;
  try{await renewSession();await syncOnLogin();if(sessionStorage.getItem('sauerteig-recovery-pending')==='1'){authRecovery=true;authMode='newPassword';tab='account'}}
  catch(e){token='';refreshToken='';user=null;clearAuthSession();authMode='login';sessionStorage.removeItem('sauerteig-recovery-pending');authNotice='Bitte erneut anmelden.'}
 }
}
if(user&&!authRecovery){
 await refreshBilling();
 const returned=new URLSearchParams(location.search).get('billing');
 if(returned==='success'||returned==='cancel'){tab='billing';history.replaceState(null,'',location.pathname);note(returned==='success'?'Zahlung wird geprüft. Dein Abo wird nach Bestätigung aktiviert.':'Zahlung abgebrochen.')}
}
render()}catch(e){console.warn('Sauerteig-Server aktuell nicht erreichbar:',e?.message||e);note('Serververbindung unterbrochen. Die Backstube bleibt geöffnet.')}})();

if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});reg.update().catch(()=>{});navigator.serviceWorker.addEventListener('controllerchange',()=>{try{if(!authRecovery&&!sessionStorage.getItem('sauerteig-sw-upgrade-v39')){sessionStorage.setItem('sauerteig-sw-upgrade-v39','1');location.reload()}}catch{}})}catch(e){console.warn('Offline-Modus nicht verfügbar',e)}})}
