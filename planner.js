const blocked=(d,from,to)=>{const h=d.getHours()*60+d.getMinutes(),a=from.split(':').map(Number),b=to.split(':').map(Number),x=a[0]*60+a[1],y=b[0]*60+b[1];return x>y?h>=x||h<y:h>=x&&h<y};
export function makePlan(r,want,from,to,ready,preheatMinutes=45,absenceStart=null,absenceEnd=null,options={}){
 const preheat=Math.max(15,Math.min(120,Number(preheatMinutes)||45));
 const stock=(r.stock[0]+r.stock[1])*30,warmProof=(r.proof[0]+r.proof[1])*30,bake=r.bake.reduce((s,x)=>s+x.min,0),lye=/Laugen/.test(r.title);
 const coldProof=r.cold?.[0]>0?(r.cold[0]+r.cold[1])*30:null;
 const mode=options.mode||'auto';const modes=mode==='warm'?[warmProof]:mode==='cold'&&coldProof?[coldProof]:coldProof?[warmProof,coldProof]:[warmProof];
 const starterHours=Number.isFinite(Number(options.starterHours))&&Number(options.starterHours)>0?Number(options.starterHours):9;
 const folds=Number.isInteger(Number(options.foldCount))?Math.max(0,Math.min(8,Number(options.foldCount))):(r.starter.type==='Weizen'?2:0);
 const interval=Number.isFinite(Number(options.foldInterval))?Math.max(10,Math.min(240,Number(options.foldInterval))):40;
 for(const proof of modes){const cold=proof!==warmProof;
 for(let shift=0;shift<21*1440;shift+=15){
 const finish=+want+shift*60000,oven=finish-bake*60000,shape=oven-(proof+20+(lye?15:0))*60000,mix=shape-stock*60000,auto=mix-(r.autolyse||0)*60000,feed=auto-starterHours*3600000;
 const actions=[...(!ready?[['Starter füttern',feed,10,'Starter nach deinem Fütterungsverhältnis füttern.'],['Starter prüfen',auto-10*60000,5,'Reifezeichen prüfen.']]:[]),...(r.autolyse?[['Autolyse ansetzen',auto,10,'Mehl und Wasser mischen.']]:[]),['Teig mischen',mix,15,'Zutaten nach Rezept mischen.'],['Stockgare prüfen',shape-10*60000,5,'Teigentwicklung prüfen.'],['Formen',shape,20,'Teig nach Rezept formen.'],['Ofen vorheizen',oven-preheat*60000,5,'Auf '+r.bake[0].temp+' °C vorheizen.'],...(cold?[['Kühlschrankgare beginnen',shape+20*60000,5,'Teig abgedeckt in den Kühlschrank stellen. Kühltemperatur und Reife beachten.']]:[['Stückgare prüfen',oven-(lye?25:10)*60000,5,'Teigreife prüfen.']])];
 if(cold)actions.push(['Aus dem Kühlschrank nehmen',oven-30*60000,5,'Teigzustand prüfen. Ob direkt kalt gebacken wird, richtet sich nach dem Rezept.']);
 if(lye)actions.push(['Mit Bäckerlauge behandeln',oven-15*60000,15,'Nur lebensmitteltaugliche Bäckerlauge nach Herstelleranleitung verwenden. Schutzbrille und laugenfeste Handschuhe tragen.']);
 const rests=[['Stockgare',mix+15*60000,stock-15],[cold?'Kühlschrankgare':'Stückgare',shape+20*60000,proof]];
 if(r.soaker){const at=mix-(r.soaker.hours*60+10)*60000;actions.push(['Quellstück ansetzen',at,10,'Zutaten mit Quellwasser vermischen.']);rests.push(['Quellstück quellen lassen',at+10*60000,r.soaker.hours*60])}
 for(let i=1;i<=folds&&i*interval<stock-20;i++)actions.push(['Teig falten ('+i+'/'+folds+')',mix+i*interval*60000,5,'Behutsam falten.']);
 let t=oven;for(const p of r.bake){actions.push(['Backphase starten',t,2,p.temp+' °C für '+p.min+' Minuten.']);rests.push(['Backen lassen',t+2*60000,p.min-2]);t+=p.min*60000}
 rests.push(['Auskühlen lassen',finish,60]);
 if(actions.some(a=>(options.earliestStart&&a[1]<+options.earliestStart)||a[1]<Date.now()+60000||Array.from({length:a[2]},(_,i)=>blocked(new Date(a[1]+i*60000),from,to)||Boolean(absenceStart&&absenceEnd&&a[1]+i*60000>=+absenceStart&&a[1]+i*60000<+absenceEnd)).some(Boolean)))continue;
 const steps=[...actions.map(a=>({title:a[0],at:a[1],detail:a[3]||'',active:true})),...rests.map(a=>({title:a[0],at:a[1],detail:'Ruhezeit – Teigzustand beachten.',active:false}))].sort((a,b)=>a.at-b.at);
 return {finish,steps,shift,cold,assumptions:'Starterreife ('+starterHours+' h) und Vorheizen ('+preheat+' min) sind Richtwerte, keine garantierten Zeiten.'};
 }}return null;
}