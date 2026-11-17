"""WebKit/Chromium UI checks using synthetic values only, no real auth requests.
Tests the actual authView renderer and the same button handler used by app.js.
OS Keychain/strong-password suggestions are not reproduced by Playwright.
"""
import argparse,json
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HTML='''<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><main id="main"></main><script type="module">
import {authView} from '/auth-ui.js';
import {toggleAuthPassword} from '/password-visibility.js';
const mode=new URLSearchParams(location.search).get('mode')||'login';
document.querySelector('#main').innerHTML=authView(mode);
window.__submits=0;
document.addEventListener('submit',e=>{e.preventDefault();window.__submits++;});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b?.dataset.act.startsWith('authToggle:')){e.preventDefault();toggleAuthPassword(b,b.dataset.act.slice('authToggle:'.length));}});
</script></body></html>'''

def main():
    p=argparse.ArgumentParser();p.add_argument('--base',required=True);p.add_argument('--engine',choices=['chromium','webkit'],required=True);a=p.parse_args()
    if urlparse(a.base).hostname not in {'localhost','127.0.0.1'}:raise SystemExit('Local fixture only')
    with sync_playwright() as pw:
        browser=getattr(pw,a.engine).launch(headless=True,args=['--no-sandbox'] if a.engine=='chromium' else [])
        context=browser.new_context(viewport={'width':390,'height':844},has_touch=True)
        page=context.new_page();errors=[];writes=[]
        page.on('pageerror',lambda err:errors.append(str(err)))
        page.on('request',lambda req:writes.append(req.url) if req.method!='GET' else None)
        page.route('**/__password_ui__*',lambda route:route.fulfill(status=200,content_type='text/html',body=HTML))
        for mode,count in [('login',1),('signup',2),('newPassword',2)]:
            page.goto(a.base+'/__password_ui__?mode='+mode,wait_until='domcontentloaded')
            page.locator('.auth-password-wrap').first.wait_for(state='visible')
            assert page.locator('.auth-password-wrap').count()==count
            for i in range(count):
                wrapper=page.locator('.auth-password-wrap').nth(i)
                field=wrapper.locator('input');button=wrapper.locator('button')
                value='Synthetic-NotARealPassword-'+str(i)+'!'
                field.fill(value)
                original_auto=field.get_attribute('autocomplete')
                # Regression condition: masking persists even after type=text.
                field.evaluate("el=>el.style.setProperty('-webkit-text-security','disc','important')")
                button.click()
                assert field.get_attribute('type')=='text'
                assert field.evaluate('el=>getComputedStyle(el).webkitTextSecurity')=='none'
                assert field.input_value()==value
                assert button.inner_text()=='Verbergen'
                assert button.get_attribute('aria-pressed')=='true'
                assert field.get_attribute('autocomplete')==original_auto
                for j in range(count):
                    if j!=i:assert page.locator('.auth-password-wrap input').nth(j).get_attribute('type')=='password'
                button.click()
                assert field.get_attribute('type')=='password'
                assert field.input_value()==value
                assert button.inner_text()=='Anzeigen'
                assert button.get_attribute('aria-pressed')=='false'
            assert page.evaluate('window.__submits')==0
            print(a.engine+' '+mode+' REVEAL_HIDE_AND_FIELD_ISOLATION_OK',flush=True)
        assert not errors,errors
        assert not writes,'Password visibility must not submit anything'
        Path('password-evidence').mkdir(exist_ok=True)
        page.screenshot(path='password-evidence/'+a.engine+'-reset-hidden.png',full_page=True)
        Path('password-evidence/'+a.engine+'.json').write_text(json.dumps({'engine':a.engine,'modes':['login','signup','newPassword'],'tested_fields':5,'synthetic_values':True,'network_writes':0,'keychain_tested':False}))
        browser.close()
if __name__=='__main__':main()
