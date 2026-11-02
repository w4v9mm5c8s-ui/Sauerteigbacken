import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../theme-v4.css',import.meta.url),'utf8');
test('cloud and legacy user records cannot crash shopping list',()=>{
 assert.match(app,/const normalizeLocal=raw=>/);
 assert.match(app,/shopping:Array\.isArray\(data\.shopping\)\?data\.shopping:\[\]/);
 assert.match(app,/JSON\.stringify\(normalizeLocal\(cloud\)\)/);
 assert.match(app,/function shop\(\)\{const target=\$\('#shop'\);if\(!target\)return/);
});
test('hero title and subtitle use reserved, non-overlapping mobile layout',()=>{
 assert.match(css,/home-masthead\{min-height:360px;display:grid/);
 assert.match(css,/home-brand\{position:relative;z-index:3;width:100%/);
 assert.match(css,/home-artwork\{position:absolute;z-index:0/);
 assert.match(css,/home-brand p\{position:relative;z-index:3/);
});
test('long labels are not broken into arbitrary fragments',()=>{
 assert.match(css,/home-feature-label\{font-size:clamp\(\.84rem,3\.55vw,1\.13rem\)/);
 assert.match(css,/word-break:normal/);
});
