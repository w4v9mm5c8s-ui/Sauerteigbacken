import test from 'node:test';
import assert from 'node:assert/strict';
import {backtagView} from '../backtag.js';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const record={title:'Weizenbrot',index:0,steps:[{title:'Falten',at:Date.now()+60000,active:true,detail:'Teig falten'},{title:'Backen',at:Date.now()+3600000,active:true,detail:'Backen'}],logs:{0:{temperature:24.5,rise:40,note:'Bläschen sichtbar'}}};
test('active bake day exposes measurements, schedule adjustments and timer controls',()=>{
 const html=backtagView(record,esc,true);
 for(const id of ['stepTemp','stepRise','stepNote','delayMinutes','timerMinutes','stepPhoto','timerDisplay'])assert.ok(html.includes('id="'+id+'"'),id);
 for(const action of ['stepSave','stepDelay','stepPhotoUpload','timerStart','timerPause','timerResume','timerStop','backPrevious','backNext'])assert.ok(html.includes('data-act="'+action+'"'),action);
 assert.ok(html.includes('24.5'));assert.ok(html.includes('Bläschen sichtbar'));
});
test('guest baking works without offering private photo upload',()=>{
 const html=backtagView(record,esc,false);
 assert.ok(!html.includes('data-act="stepPhotoUpload"'));
 assert.ok(html.includes('data-act="stepSave"'));
});
test('user notes are escaped before insertion into the page',()=>{
 const html=backtagView({...record,logs:{0:{note:'<img src=x onerror=alert(1)>'}}},esc,true);
 assert.ok(!html.includes('<img src=x onerror'));
 assert.ok(html.includes('&lt;img'));
});
