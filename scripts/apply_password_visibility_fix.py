"""Guarded, UI-only password reveal repair. Never reads account credentials."""
from pathlib import Path
import re
p=Path('app.js');s=p.read_text()
if "from './password-visibility.js'" not in s:
    s="import {toggleAuthPassword} from './password-visibility.js';\n"+s
    old="""if(a.startsWith('authToggle:')){
 const id=a.slice('authToggle:'.length);
 const input=document.getElementById(id),button=originElement?.closest('button');
 if(!input||!button)return;
 const visible=input.type==='password';input.type=visible?'text':'password';
 button.textContent=visible?'Verbergen':'Anzeigen';button.setAttribute('aria-label',visible?'Passwort verbergen':'Passwort anzeigen');button.setAttribute('aria-pressed',String(visible));
 return
}"""
    assert s.count(old)==1,'Auth toggle layout changed'
    s=s.replace(old,"""if(a.startsWith('authToggle:')){
 toggleAuthPassword(originElement,a.slice('authToggle:'.length));
 return
}""")
    p.write_text(s)
p=Path('style.css');s=p.read_text()
if '/* Password controls: avoid iOS focus zoom. */' not in s:
    p.write_text(s+'\n/* Password controls: avoid iOS focus zoom. */\n@media(max-width:700px){#authForm input{font-size:16px}}\n')
p=Path('sw.js');s=p.read_text()
if "'/password-visibility.js'" not in s:
    s=re.sub(r"const CACHE='sauerteig-public-v(\d+)[^']*';",lambda m:"const CACHE='sauerteig-public-v"+str(int(m[1])+1)+"-password-reveal';",s,count=1)
    assert "'/auth-ui.js'," in s
    s=s.replace("'/auth-ui.js',","'/auth-ui.js','/password-visibility.js',",1)
    p.write_text(s)
print('PASSWORD_VISIBILITY_FIX_APPLIED')
