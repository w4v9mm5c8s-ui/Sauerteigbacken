import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {pantryView,isFlour} from '../pantry.js';
import {homeView} from '../home.js';
test('flour warnings belong to the pantry',()=>{
 const items=[{name:'Weizenmehl 550',amount:201},{name:'Salz',amount:3},{kind:'flour',name:'Spezialmischung',amount:40,warnAt:40}];
 const html=pantryView(items,String);
 assert.equal(isFlour({name:'w550'}),true);
 assert.match(html,/Nachfüllen · Warngrenze 40 g/);
 for(const page of [homeView(),homeView({signed:true,pantry:items}),readFileSync(new URL('../index.html',import.meta.url),'utf8')]){
  assert.doesNotMatch(page,/Mehlbestand|Spezialmischung|DEINE BACKSTUBE|Natürlich backen|Einfach geplant/i);
 }
});
