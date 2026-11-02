import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let failures=[];
for(const viewport of [{width:375,height:812},{width:390,height:844},{width:430,height:932}]){
 const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const page=await context.newPage();page.on('pageerror',e=>failures.push(viewport.width+' JavaScript: '+e.message));
 await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
 await page.waitForSelector('.home-hero');
 if(!await page.locator('.home-hero').isVisible())failures.push('Homepage hero missing '+viewport.width);
 const heroImage=await page.locator('.hero-watercolor').evaluate(img=>({loaded:img.complete&&img.naturalWidth>0,width:img.getBoundingClientRect().width})).catch(()=>({loaded:false,width:0}));
 if(!heroImage.loaded||heroImage.width<60)failures.push('Watercolor hero not loaded '+viewport.width);
 if(!await page.locator('nav [data-tab="hub"] .ui-icon').isVisible())failures.push('Bottom nav SVG missing '+viewport.width);
 await page.locator('[data-tab="hub"]').click();
 await page.getByRole('button',{name:/Rezeptbibliothek/}).first().click();
 if(!await page.locator('.recipe-banner img').evaluate(img=>img.complete&&img.naturalWidth>0).catch(()=>false))failures.push('Recipe watercolor missing '+viewport.width);
 await page.locator('[data-act^="recipe:"]').first().click();
 await page.getByRole('button',{name:/Backtag planen/}).click();
 for(const id of ['roomTemp','flourTemp','starterTemp','proofMode','loaves','flourPerLoaf','finish'])if(!await page.locator('#'+id).count())failures.push(id+' missing '+viewport.width);
 const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 if(size.scroll>size.client+2)failures.push('Horizontal overflow '+viewport.width+' '+JSON.stringify(size));
 await page.screenshot({path:'screenshots/iphone-'+viewport.width+'.png',fullPage:true});
 await context.close();
}
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Mobile Chromium layout smoke checks passed at 375, 390 and 430px');
