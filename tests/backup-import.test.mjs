import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBackup} from '../backup.js';
const sample={history:[{title:'Landbrot',date:'01.11.2026'}],shopping:[{name:'Mehl',grams:500}],starters:[{name:'Wilma'}],ownRecipes:[],favorites:[]};
test('personal bake backup can be restored with new timestamp',()=>{const backup=validateBackup(sample);assert.equal(backup.history.length,1);assert.ok(backup.updatedAt>0);assert.notEqual(backup,sample)});
test('malformed backups do not overwrite account data',()=>{for(const x of [null,[],{}, {history:[],shopping:[],starters:'none'}])assert.throws(()=>validateBackup(x))});
test('oversized and invalid nested collections are rejected',()=>{assert.throws(()=>validateBackup({...sample,favorites:'not-array'}));assert.throws(()=>validateBackup({...sample,history:Array(2001).fill({})}))});
test('the UI requires confirmation before replacing local data',()=>{const app=(await import('node:fs')).readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/readBackup\(document\.getElementById/);assert.match(app,/confirm\('Die importierten Daten ersetzen/);assert.match(app,/importData/);});
