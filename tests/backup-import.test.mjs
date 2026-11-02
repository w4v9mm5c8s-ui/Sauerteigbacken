import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateBackup,makeBackup} from '../backup.js';
const sample={history:[{title:'Landbrot',date:'01.11.2026'}],shopping:[{name:'Mehl',grams:500}],starters:[{name:'Wilma'}],ownRecipes:[],favorites:[]};
test('personal bake backup can be restored with new timestamp',()=>{const backup=validateBackup(sample);assert.equal(backup.history.length,1);assert.ok(backup.updatedAt>0);assert.notEqual(backup,sample)});
test('malformed backups do not overwrite account data',()=>{for(const x of [null,[],{}, {history:[],shopping:[],starters:'none'}])assert.throws(()=>validateBackup(x))});
test('oversized and invalid nested collections are rejected',()=>{assert.throws(()=>validateBackup({...sample,favorites:'not-array'}));assert.throws(()=>validateBackup({...sample,history:Array(2001).fill({})}))});
test('the UI requires confirmation before replacing local data',()=>{const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/readBackup\(document\.getElementById/);assert.match(app,/confirm\('Die importierten Daten ersetzen/);assert.match(app,/importData/);});

test('backup contains full active and parallel baking day progress',()=>{
 const active={title:'Weizenbrot',index:3,steps:[{title:'Mischen',at:1783000000000},{title:'Backen',at:1783001000000}]};
 const parked={title:'Roggenbrot',index:1,steps:[{title:'Ruhe',at:1783002000000}]};
 const backup=makeBackup(sample,active,[parked]);
 assert.equal(backup.activeBake.index,3);
 assert.equal(backup.parallelBakes[0].title,'Roggenbrot');
 assert.equal(backup.backupVersion,1);
 assert.equal(typeof backup.exportedAt,'string');
});
test('invalid baking session entries cannot be restored',()=>{
 assert.throws(()=>validateBackup({...sample,activeBake:{title:'Brot',steps:[{title:'Bad',at:'no time'}]}}));
 assert.throws(()=>validateBackup({...sample,parallelBakes:[{title:'Missing recipe'}]}));
 assert.throws(()=>validateBackup({...sample,parallelBakes:Array(25).fill({title:'Brot',steps:[{title:'B',at:1783000000000}]})}));
});
test('backup import restores active and parallel local storage keys',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(app,/makeBackup\(local\(\),getActive\(\),getParked\(\)\)/);
 assert.match(app,/localStorage\.setItem\(activeKey\(\),JSON\.stringify\(data\.activeBake\)\)/);
 assert.match(app,/localStorage\.setItem\(parkedKey\(\),JSON\.stringify\(data\.parallelBakes\)\)/);
});
