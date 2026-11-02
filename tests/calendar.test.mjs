import test from 'node:test';
import assert from 'node:assert/strict';
import {bakeCalendar} from '../calendar.js';
test('calendar exports baking tasks and alarms only for active steps',()=>{
 const now=Date.now()+3600000;
 const text=bakeCalendar({id:'bake123',steps:[{title:'Starter füttern',at:now,active:true,detail:'Füttern'},{title:'Kühlschrankgare',at:now+3600000,active:false,detail:'Abgedeckt ruhen lassen'}]});
 assert.match(text,/BEGIN:VCALENDAR/);
 assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,2);
 assert.equal((text.match(/BEGIN:VALARM/g)||[]).length,1);
 assert.match(text,/TRIGGER:-PT10M/);
 assert.match(text,/SUMMARY:Sauerteig: Starter füttern/);
});
test('calendar safely escapes line breaks and delimiters',()=>{
 const text=bakeCalendar({steps:[{title:'Test, Brot; x',at:Date.now()+60000,active:true,detail:'erste Zeile\nzweite Zeile'}]});
 assert.ok(text.includes('Test\\, Brot\\; x'));
 assert.ok(text.includes('erste Zeile\\nzweite Zeile'));
});
test('empty plan cannot be exported',()=>assert.throws(()=>bakeCalendar({steps:[]})));
