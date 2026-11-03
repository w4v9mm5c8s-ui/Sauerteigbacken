import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AUTH_REDIRECT_URL,authView,validateAuthFields,parseAuthReturn,readableAuthError} from '../auth-ui.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('auth redirects to deployed HTTPS application, never localhost',()=>{
 assert.equal(AUTH_REDIRECT_URL,'https://backen-mit-sauerteig.onrender.com/');
 assert.doesNotMatch(AUTH_REDIRECT_URL,/localhost/i);
 const app=read('app.js');
 assert.match(app,/signup\?redirect_to='\+encodeURIComponent\(AUTH_REDIRECT_URL\)/);
 assert.match(app,/recover\?redirect_to='\+encodeURIComponent\(AUTH_REDIRECT_URL\)/);
 assert.match(app,/resend\?redirect_to='\+encodeURIComponent\(AUTH_REDIRECT_URL\)/);
});
test('login and registration are separate forms with password reveal controls',()=>{
 const login=authView('login');
 assert.match(login,/id="authForm"/);
 assert.match(login,/autocomplete="current-password"/);
 assert.match(login,/data-act="authToggle:password"/);
 assert.match(login,/Passwort vergessen\?/);
 const signup=authView('signup');
 assert.match(signup,/autocomplete="new-password"/);
 assert.match(signup,/id="confirmPassword"/);
 assert.match(signup,/Passwort wiederholen/);
 assert.match(signup,/id="email"/);
 assert.doesNotMatch(login,/id="confirmPassword"/);
});
test('missing email and password never proceed to a Supabase anonymous signup',()=>{
 assert.match(validateAuthFields('signup',{email:'',password:'abcdefgh',confirmation:'abcdefgh'}),/E-Mail/);
 assert.match(validateAuthFields('login',{email:'a@example.com',password:''}),/Passwort/);
 assert.match(validateAuthFields('signup',{email:'x@example.com',password:'short',confirmation:'short'}),/mindestens 8/);
 assert.match(validateAuthFields('signup',{email:'x@example.com',password:'abcdefgh',confirmation:'abcdefgh1'}),/nicht überein/);
 assert.equal(validateAuthFields('signup',{email:'x@example.com',password:'abcdefgh',confirmation:'abcdefgh'}),null);
});
test('forgot password has only an email field and an actual reset request',()=>{
 const forgot=authView('forgot',{email:'user@example.com'});
 assert.match(forgot,/Passwort vergessen\?/);
 assert.match(forgot,/name="email"/);
 assert.match(forgot,/Link zum Zurücksetzen senden/);
 assert.doesNotMatch(forgot,/type="password"/);
 const pending=authView('pendingReset',{email:'user@example.com'});
 assert.match(pending,/Postfach prüfen/);
});
test('password recovery requires a confirmed recovery session and two matching passwords',()=>{
 const recovery=authView('newPassword');
 assert.match(recovery,/Neues Passwort festlegen/);
 assert.match(recovery,/id="password"/);
 assert.match(recovery,/id="confirmPassword"/);
 assert.match(recovery,/Passwort speichern/);
 assert.equal(validateAuthFields('newPassword',{password:'abcdefgh',confirmation:'abcdefgh'}),null);
 assert.match(validateAuthFields('newPassword',{password:'abcdefgh',confirmation:'abcdefgh2'}),/nicht überein/);
 const source=read('app.js');
 assert.match(source,/authRecovery\|\|!token/);
 assert.match(source,/method:'PUT'/);
 assert.match(source,/body:JSON\.stringify\(\{password\}\)/);
});
test('email callback supports confirmation, recovery and expired-link handling',()=>{
 const confirmed=parseAuthReturn('#access_token=A&refresh_token=R&type=signup');
 assert.equal(confirmed.kind,'session');assert.equal(confirmed.type,'signup');
 const recovery=parseAuthReturn('#access_token=A&refresh_token=R&type=recovery');
 assert.equal(recovery.kind,'session');assert.equal(recovery.type,'recovery');
 assert.equal(parseAuthReturn('','?token_hash=hash&type=signup').kind,'verify');
 const invalid=parseAuthReturn('#error=access_denied&error_code=otp_expired&error_description=expired');
 assert.equal(invalid.kind,'error');assert.equal(invalid.errorCode,'otp_expired');
 assert.match(readableAuthError({code:invalid.errorCode}),/abgelaufen/);
});
test('confirmation can be resent without creating another account',()=>{
 const pending=authView('pendingSignup',{email:'x@example.com'});
 assert.match(pending,/Bestätigungslink erneut senden/);
 assert.match(pending,/data-act="authResend"/);
 const app=read('app.js');
 assert.match(app,/type:'signup'/);
 assert.match(app,/processAuthReturn\(\)/);
 assert.match(app,/clearAuthSession\(\)/);
});
test('server exposes Auth module and caches public code, not private tokens',()=>{
 for(const path of ['server.mjs','sw.js'])assert.match(read(path),/'\/auth-ui\.js'/);
 const sw=read('sw.js');
 assert.match(sw,/sauerteig-public-v33/);
 assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)/);
 const html=read('index.html');
 assert.match(html,/\/app\.js\?v=32/);
});
