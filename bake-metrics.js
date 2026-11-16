export function actualBakeDurations(steps,logs){
 const completed=title=>{const i=steps.findIndex(s=>s.title===title||s.title.startsWith(title));const t=i>=0?logs?.[i]?.completedAt:null;return t?new Date(t).getTime():null};
 const hours=(a,b)=>a!==null&&b!==null&&b>=a?Math.round((b-a)/360000)/10:null;
 const mixed=completed('Teig mischen'),formed=completed('Formen'),baked=completed('Backphase starten')??completed('Ofenladung 1 starten')??completed('Einschießen')??completed('Ofenladung 1: Einschießen');
 return {stockHours:hours(mixed,formed),proofHours:hours(formed,baked)};
}

export function recordedBakeSpan(logs){
 const times=Object.values(logs||{}).filter(row=>row?.completedAt).map(row=>Date.parse(row.completedAt)).filter(Number.isFinite);
 if(times.length<2)return {startedAt:null,totalHours:null};
 const first=Math.min(...times),last=Math.max(...times);
 return {startedAt:new Date(first).toISOString(),totalHours:Math.round((last-first)/360000)/10};
}
