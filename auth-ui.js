export const AUTH_REDIRECT_URL = 'https://backen-mit-sauerteig.onrender.com/';

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function normalizedAuthEmail(input){return String(input??'').trim().toLocaleLowerCase('de-DE')}
export function validateAuthFields(mode,{email='',password='',confirmation=''}={}){
 if(mode==='newPassword'){
  if(String(password).length<8)return 'Bitte ein neues Passwort mit mindestens 8 Zeichen eingeben.';
  if(password!==confirmation)return 'Die beiden Passwörter stimmen nicht überein.';
  return null;
 }
 if(!emailPattern.test(normalizedAuthEmail(email)))return 'Bitte eine gültige E-Mail-Adresse eingeben.';
 if(mode==='login'&& !password)return 'Bitte dein Passwort eingeben.';
 if(mode==='signup'){
  if(String(password).length<8)return 'Bitte ein Passwort mit mindestens 8 Zeichen eingeben.';
  if(password!==confirmation)return 'Die beiden Passwörter stimmen nicht überein.';
 }
 return null;
}
export function readableAuthError(err){
 const message=String(err?.message||err||'').toLowerCase(),code=String(err?.code||'').toLowerCase();
 if(/anonymous/.test(message)||code.includes('anonymous'))return 'Bitte melde dich mit einer gültigen E-Mail-Adresse an. Die anonyme Anmeldung wird nicht verwendet.';
 if(/email_not_confirmed|email not confirmed|not confirmed/.test(code+' '+message))return 'Deine E-Mail-Adresse ist noch nicht bestätigt. Öffne die Bestätigungsmail oder fordere einen neuen Link an.';
 if(/invalid_credentials|invalid login credentials|invalid grant/.test(code+' '+message))return 'E-Mail-Adresse oder Passwort sind nicht korrekt. Du kannst dein Passwort zurücksetzen.';
 if(/user_already_exists|already registered|already exists/.test(code+' '+message))return 'Unter dieser Adresse besteht bereits ein Konto. Bitte melde dich an oder setze dein Passwort zurück.';
 if(/otp_expired|expired|invalid.*link|token.*invalid/.test(code+' '+message))return 'Dieser E-Mail-Link ist abgelaufen oder bereits verwendet worden. Fordere einen neuen Link an.';
 if(/over_email_send_rate_limit|email_rate_limit_exceeded|email.*rate|rate limit|429/.test(code+' '+message))return 'Es wurden zu viele E-Mails angefordert. Bitte versuche es später erneut.';
 if(/network|failed to fetch|load failed|server|timeout/.test(code+' '+message))return 'Die Serververbindung ist gerade unterbrochen. Bitte versuche es erneut.';
 if(/password.*weak|weak_password/.test(code+' '+message))return 'Das Passwort erfüllt die Sicherheitsanforderungen noch nicht.';
 if(/signup_disabled|signups not allowed/.test(code+' '+message))return 'Registrierungen sind in der Supabase-Projektkonfiguration deaktiviert.';
 return 'Die Anmeldung konnte nicht abgeschlossen werden. Bitte prüfe deine Eingaben und versuche es erneut.';
}
export function parseAuthReturn(hash='',search=''){
 const fragment=new URLSearchParams(String(hash).replace(/^#/,'')),query=new URLSearchParams(String(search).replace(/^\?/,''));
 const type=(fragment.get('type')||query.get('type')||'').toLowerCase();
 const errorCode=fragment.get('error_code')||query.get('error_code')||fragment.get('error')||query.get('error')||'';
 const errorDescription=fragment.get('error_description')||query.get('error_description')||'';
 if(errorCode)return {kind:'error',type,errorCode,errorDescription};
 const accessToken=fragment.get('access_token')||query.get('access_token'),refreshToken=fragment.get('refresh_token')||query.get('refresh_token');
 if(accessToken&&refreshToken)return {kind:'session',type,accessToken,refreshToken};
 const tokenHash=query.get('token_hash')||fragment.get('token_hash'),verifiedType=type;
 if(tokenHash&&['signup','email','recovery','invite','magiclink'].includes(verifiedType))return {kind:'verify',type:verifiedType,tokenHash};
 const code=query.get('code')||fragment.get('code');
 if(code)return {kind:'unsupported-code',type};
 return {kind:'none',type};
}
function passwordInput(id,label,autocomplete='current-password'){
 return '<label class="auth-password-label" for="'+id+'">'+label+'</label><div class="auth-password-wrap"><input id="'+id+'" name="'+id+'" type="password" '+(autocomplete==='current-password'?'':'minlength="8" ')+'autocomplete="'+autocomplete+'" required><button type="button" data-act="authToggle:'+id+'" aria-label="Passwort anzeigen" aria-controls="'+id+'" aria-pressed="false">Anzeigen</button></div>';
}
function formButton(label){
 return '<button class="auth-submit primary" type="submit">'+label+'</button>';
}
export function authView(mode='login',{email='',error='',notice=''}={},esc=x=>String(x)){
 const safeEmail=esc(normalizedAuthEmail(email));
 const message=(error?'<p class="auth-feedback auth-error" role="alert">'+esc(error)+'</p>':'')+(notice?'<p class="auth-feedback auth-notice" role="status">'+esc(notice)+'</p>':'');
 const emailField='<label for="email">E-Mail-Adresse</label><input id="email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="254" required value="'+safeEmail+'" placeholder="name@beispiel.de">';
 const nav=(...items)=>'<div class="auth-links">'+items.map(([title,action])=>'<button type="button" data-act="authMode:'+action+'">'+title+'</button>').join('')+'</div>';
 if(mode==='pendingSignup')return '<section class="card auth-card"><span class="studio-overline">E-MAIL-BESTÄTIGUNG</span><h2>Bestätigungsmail prüfen</h2><p>Falls du eine Mail für '+(safeEmail||'deine Adresse')+' erhalten hast, öffne den Bestätigungslink. Anschließend kehrst du automatisch zur App zurück.</p>'+message+(safeEmail?'':'<label for="email">E-Mail-Adresse</label><input id="email" type="email" autocomplete="email" inputmode="email" placeholder="name@beispiel.de">')+'<button class="auth-submit" type="button" data-act="authResend">Bestätigungslink erneut senden</button>'+nav(['Bereits bestätigt? Anmelden','login'],['Andere E-Mail verwenden','signup'])+'</section>';
 if(mode==='pendingReset')return '<section class="card auth-card"><span class="studio-overline">PASSWORT VERGESSEN</span><h2>Postfach prüfen</h2><p>Falls für '+(safeEmail||'diese Adresse')+' ein Konto besteht, erhältst du eine Mail mit einem Link. Dort kannst du ein neues Passwort festlegen.</p>'+message+nav(['Zur Anmeldung','login'],['Neuen Link anfordern','forgot'])+'</section>';
 if(mode==='newPassword')return '<section class="card auth-card"><span class="studio-overline">PASSWORT ZURÜCKSETZEN</span><h2>Neues Passwort festlegen</h2><p>Dein Link wurde erkannt. Lege jetzt ein neues Passwort fest.</p>'+message+'<form id="authForm" data-auth-mode="newPassword">'+passwordInput('password','Neues Passwort','new-password')+passwordInput('confirmPassword','Neues Passwort wiederholen','new-password')+formButton('Passwort speichern')+'</form></section>';
 if(mode==='linkError')return '<section class="card auth-card"><span class="studio-overline">E-MAIL-LINK</span><h2>Link nicht mehr gültig</h2>'+message+'<p>Du kannst einen neuen Bestätigungslink anfordern oder dein Passwort zurücksetzen.</p>'+nav(['Bestätigungslink erneut senden','pendingSignup'],['Passwort zurücksetzen','forgot'],['Zur Anmeldung','login'])+'</section>';
 if(mode==='forgot')return '<section class="card auth-card"><span class="studio-overline">KONTO WIEDERHERSTELLEN</span><h2>Passwort vergessen?</h2><p>Gib deine E-Mail-Adresse ein. Du erhältst einen Link, um ein neues Passwort zu vergeben.</p>'+message+'<form id="authForm" data-auth-mode="forgot">'+emailField+formButton('Link zum Zurücksetzen senden')+'</form>'+nav(['Zur Anmeldung','login'],['Neues Konto erstellen','signup'])+'</section>';
 if(mode==='signup')return '<section class="card auth-card"><span class="studio-overline">DEINE BACKSTUBE</span><h2>Konto erstellen</h2><p>Erstelle dein persönliches Konto, damit deine Starter, Rezepte und Backtage gespeichert werden.</p>'+message+'<form id="authForm" data-auth-mode="signup">'+emailField+passwordInput('password','Passwort (mindestens 8 Zeichen)','new-password')+passwordInput('confirmPassword','Passwort wiederholen','new-password')+formButton('Registrieren')+'</form>'+nav(['Ich habe bereits ein Konto','login'])+'</section>';
 return '<section class="card auth-card"><span class="studio-overline">DEINE BACKSTUBE</span><h2>Anmelden</h2><p>Melde dich an, um deine Rezepte, Starter und Backtage wiederzufinden.</p>'+message+'<form id="authForm" data-auth-mode="login">'+emailField+passwordInput('password','Passwort','current-password')+formButton('Anmelden')+'</form>'+nav(['Passwort vergessen?','forgot'],['Neues Konto erstellen','signup'])+'</section>';
}
