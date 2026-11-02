import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('signed-out users can go directly to the account rather than dead-end login text',()=>{
 assert.match(code,/const signInGate=/);
 assert.match(code,/button\('Zum Konto und Anmelden','account'\)/);
 assert.match(code,/import:\(\)=>user\?ownRecipesView.*:signInGate/);
});
test('sign-in gate escapes displayed messages',()=>{
 assert.match(code,/signInGate=message=>box\('<h2>Anmeldung erforderlich<\/h2><p>'\+escape\(message\)/);
});
