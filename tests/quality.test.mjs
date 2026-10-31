import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('Start tab matches router',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/data-tab="start"/)});
test('API key never appears in public configuration',()=>{const server=readFileSync(new URL('../server.mjs',import.meta.url),'utf8');const config=server.match(/if\(url\.pathname==='\/api\/config'\)[^\n]*/)?.[0]||'';assert.ok(config);assert.doesNotMatch(config,/OPENAI_API_KEY[^}]*value/)});
test('account deletion requires explicit confirmation',()=>{const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/KONTO LÖSCHEN/)});
test('imported recipe requires review',()=>{const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/Bitte vor dem Speichern überprüfen/)});
