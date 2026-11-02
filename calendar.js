const icsEscape=s=>String(s??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;').slice(0,450);
const stamp=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
export function bakeCalendar(record){
 if(!record||!Array.isArray(record.steps)||!record.steps.length)throw Error('Kein Backplan vorhanden');
 const id=String(record.id||'bake').replace(/[^a-zA-Z0-9-]/g,'').slice(0,50);
 const now=stamp(Date.now());
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sauerteig Buddy//Backplan DE//','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Sauerteig Buddy'];
 for(let i=0;i<record.steps.length;i++){
  const step=record.steps[i],start=Number(step.at);
  if(!Number.isFinite(start))continue;
  const title=String(step.title||''),detail=String(step.detail||'Backschritt');
  lines.push('BEGIN:VEVENT','UID:'+id+'-'+i+'@sauerteig-buddy','DTSTAMP:'+now,'DTSTART:'+stamp(start),'DTEND:'+stamp(start+Math.max(5,Number(step.duration)||10)*60000),'SUMMARY:'+icsEscape('Sauerteig: '+title),'DESCRIPTION:'+icsEscape(detail));
  if(step.active)lines.push('BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY','DESCRIPTION:'+icsEscape('Bald: '+title),'END:VALARM');
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR');
 return lines.join('\r\n')+'\r\n';
}
