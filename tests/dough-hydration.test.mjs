import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateDough,waterForDoughHydration} from '../calculators.js';
test('recipe hydration includes actual flour and water from liquid or stiff starter',()=>{
 for(const starterHydration of [50,100,125]){
  const hydration=calculateDough(500,350,10,120,starterHydration).hydration;
  assert.equal(waterForDoughHydration(500,120,starterHydration,hydration),350);
 }
 assert.equal(waterForDoughHydration(500,120,100,75),360);
 assert.equal(waterForDoughHydration(500,120,100,1),null);
});
