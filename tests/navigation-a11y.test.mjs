import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('bottom nav retains original four user-facing sections',()=>{
 for(const [id,label] of [['start','Start'],['hub','Backen'],['buddy','Buddy'],['account','Ich']]){
  assert.match(html,new RegExp('data-tab="'+id+'"[^>]*>[\\s\\S]*?'+label+'<\\/button>'));
 }
});
test('subpages keep their correct bottom navigation parent active',()=>{
 assert.match(app,/const activeNav=/);
 for(const value of ['shopping','pantry','starters','billing'])assert.match(app,new RegExp("'"+value+"'"));
 assert.match(app,/setAttribute\('aria-current','page'\)/);
});
