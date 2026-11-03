const text=(x,y,label)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="15" fill="#513d32">'+label+'</text>';
const dough=(cx,cy,rx=65,ry=28)=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#e6c49b" stroke="#8d6445" stroke-width="3"/>';
const arrow=(path)=>'<path d="'+path+'" fill="none" stroke="#a34e67" stroke-width="4" marker-end="url(#lessonArrow)"/>';
export function lessonDiagram(id,step){
 let body='',caption='';
 if(id==='kneten'){
  if(step===0){body='<path d="M65 65 Q70 155 180 155 Q290 155 295 65Z" fill="#f5e7d8" stroke="#8d6445" stroke-width="3"/>'+dough(180,95,85,22)+arrow('M110 35 L145 70')+arrow('M250 35 L215 70');caption='Mehl und Wasser zusammenführen';}
  if(step===1){body=dough(180,108,100,35)+arrow('M80 55 Q180 5 255 70')+'<path d="M125 80 Q180 125 240 80" fill="none" stroke="#8d6445" stroke-width="4"/>';caption='Falten und drücken, Struktur aufbauen';}
  if(step===2){body='<path d="M65 45 Q180 85 295 45 L270 150 Q180 110 90 150Z" fill="#f5dfbe" stroke="#8d6445" stroke-width="3"/><ellipse cx="180" cy="97" rx="52" ry="25" fill="#fff9ed" stroke="#c49e73" stroke-dasharray="5 4"/>'+arrow('M80 95 L30 95')+arrow('M280 95 L330 95');caption='Dünne, durchscheinende Teighaut';}
  if(step===3){body='<path d="M55 125 Q65 70 130 110 Q170 40 205 115 Q285 60 310 140Z" fill="#e6c49b" stroke="#8d6445" stroke-width="3"/>'+text(180,55,'Struktur bricht zusammen');caption='Schmierigkeit und Spannungsverlust beobachten';}
 }else if(id==='falten'){
  body=dough(180,112,95,40);
  if(step===0){body+='<path d="M55 65 Q180 25 305 65" fill="none" stroke="#8d6445" stroke-dasharray="8 5"/>';caption='Abgedeckt ruhen lassen';}
  if(step===1){body+='<path d="M140 110 Q95 10 165 20 Q220 55 205 105" fill="#e6c49b" stroke="#8d6445" stroke-width="3"/>'+arrow('M95 20 Q80 85 150 105');caption='Eine Seite dehnen und zur Mitte legen; rundum wiederholen';}
  if(step===2){body='<path d="M65 150 Q95 160 125 85 Q180 5 235 85 Q265 160 295 150" fill="#e6c49b" stroke="#8d6445" stroke-width="4"/>'+arrow('M160 130 L160 45')+arrow('M200 130 L200 45');caption='Von unten anheben; Enden falten sich unter';}
  if(step===3){body+=arrow('M75 65 Q180 15 285 65');caption='Glatte gespannte Oberfläche; behutsam arbeiten';}
 }else if(id==='formen'){
  body=dough(180,110,step===1?70:100,step===1?43:30);
  if(step===0){body+='<path d="M65 45 L100 110 M295 45 L260 110" stroke="#8d6445" stroke-width="8"/>';caption='Behutsam lösen; Gasblasen erhalten';}
  if(step===1){body+=arrow('M75 145 Q110 170 140 135')+arrow('M285 145 Q250 170 220 135');caption='Oberfläche spannen, Naht unten sammeln';}
  if(step===2){body+='<path d="M50 120 Q55 20 180 35 Q305 20 310 120" fill="none" stroke="#a34e67" stroke-width="5" stroke-dasharray="10 5"/>';caption='Abdecken gegen Austrocknung';}
  if(step===3){body+='<path d="M165 25 V80 Q180 105 195 80 V25" fill="#f4d4bd" stroke="#8d6445" stroke-width="3"/>'+arrow('M225 75 L225 40');caption='Delle beobachten: langsames Zurückfedern ist ein Hinweis';}
 }else if(id==='korb'){
  body='<path d="M65 90 Q75 165 180 165 Q285 165 295 90" fill="#ead4ba" stroke="#8d6445" stroke-width="4"/>'+dough(180,90,95,35);
  if(step===0){body+=arrow('M65 30 L295 30');caption='Korbgröße anhand der Rohteigmasse wählen';}
  if(step===1){body+='<path d="M130 85 L150 100 L170 85 L190 100 L210 85 L230 100" fill="none" stroke="#8d6445" stroke-width="3"/>';caption='Naht oben im Korb → nach dem Stürzen unten';}
  if(step===2){body+='<path d="M130 135 L150 145 L170 135 L190 145 L210 135 L230 145" fill="none" stroke="#8d6445" stroke-width="3" stroke-dasharray="4 4"/>';caption='Naht unten im Korb → nach dem Stürzen oben';}
  if(step===3){body+='<path d="M45 90 Q180 5 315 90" fill="none" stroke="#a34e67" stroke-width="5"/>';caption='Korb und Teig abdecken';}
 }else if(id==='ofen'){
  body='<path d="M40 20 V155 H325" stroke="#8d6445" fill="none" stroke-width="2"/><path d="M45 45 H105 V70 H180 V115 H320" stroke="#a34e67" fill="none" stroke-width="5"/>'+text(72,32,'250 °C')+text(143,58,'230 °C')+text(255,103,'210 °C');
  const x=[75,140,195,285][step];body+='<circle cx="'+x+'" cy="'+[45,70,115,115][step]+'" r="10" fill="#513d32"/>';caption=['Vorheizen gemäß Rezept und Gerät','Einschießen und Dampf nach Geräteanleitung','Dampf ablassen und Temperatur senken','Bräunung und Kerntemperatur prüfen'][step];
 }else if(id==='quell'){
  if(step<3){body='<path d="M75 75 L95 155 H265 L285 75Z" fill="#d6e5ed" stroke="#8d6445" stroke-width="3"/>';for(let i=0;i<12;i++)body+='<ellipse cx="'+(110+i%4*45)+'" cy="'+(100+Math.floor(i/4)*18)+'" rx="9" ry="5" fill="#99734f"/>';if(step===2)body+='<path d="M130 65 Q115 45 130 25 M180 65 Q165 45 180 25 M230 65 Q215 45 230 25" fill="none" stroke="#a34e67" stroke-width="3"/>';caption=['Saaten und Wasser getrennt abwiegen','Altbrotfaktor aus der gewählten Quelle verwenden','Brühstück vor Zugabe ausreichend abkühlen'][step];}
  else{body=text(180,50,'Gesamtwasser')+text(180,90,'− Quellwasser − Brühwasser')+'<path d="M50 108 H310" stroke="#8d6445"/>'+text(180,140,'= Wasser für den Hauptteig');caption='Reserviertes Wasser nicht doppelt zugeben';}
 }else{
  const height=[24,45,75,95][step];body='<path d="M110 30 V160 H250 V30" fill="#fff9ed" stroke="#8d6445" stroke-width="4"/><path d="M112 158 V'+(158-height)+' Q180 '+(145-height)+' 248 '+(158-height)+' V158Z" fill="#e6c49b"/><path d="M100 128 H260" stroke="#a34e67" stroke-width="3" stroke-dasharray="6 5"/>';if(step>=2)for(let i=0;i<8;i++)body+='<circle cx="'+(130+i%4*30)+'" cy="'+(125-Math.floor(i/4)*22)+'" r="4" fill="#fff9ed"/>';caption=['Ausgangsmenge wiegen','Mehl und Wasser zugeben; Stand markieren','Temperatur und Volumenzunahme beobachten','Höchsten Stand und Zeit dokumentieren'][step];
 }
 return '<figure><svg viewBox="0 0 360 190" role="img" aria-label="'+caption+'"><defs><marker id="lessonArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#a34e67"/></marker></defs>'+body+'</svg><figcaption>'+caption+'</figcaption></figure>';
}
