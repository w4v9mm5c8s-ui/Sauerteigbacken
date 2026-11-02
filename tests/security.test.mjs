import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('server restricts public static paths',()=>{const source=readFileSync(new URL('../server.mjs',import.meta.url),'utf8');assert.match(source,/publicFiles=new Set/);assert.match(source,/!publicFiles.has\(pathname\)/);assert.doesNotMatch(source,/publicFiles=new Set\(\[[^\]]*server\.mjs/)});
test('no secrets are hardcoded into frontend',()=>{for(const p of ['app.js','index.html','style.css','planner.js']){const s=readFileSync(new URL('../'+p,import.meta.url),'utf8');assert.doesNotMatch(s,/sk-proj-[A-Za-z0-9_-]{12}/)}});

test('all app module imports and artwork are in public allowlist',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const server=readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
 const imports=[...app.matchAll(/from '\.\/([^']+)'/g)].map(x=>'/'+x[1]);
 const assets=['/art-loaf.svg','/art-starter.svg','/art-tools.svg','/flour-table.json','/knowledge-data.json','/resources.json','/source-conflicts.json','/historical-recipes.json'];
 for(const path of [...imports,...assets])assert.ok(server.includes("'"+path+"'"),'Missing static asset '+path);
});
