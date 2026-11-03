// Ergänzungen zu den PDF-Rezepten, recherchiert am 03.11.2026.
// Übertragene Planungswerte sind keine nachgebackenen Originalrezept-Angaben.
const sources={
 starter:{label:'The Perfect Loaf: flüssiger Starter (100 %)',url:'https://www.theperfectloaf.com/best-sourdough-recipe/'},
 wheat:{label:'The Perfect Loaf: Weizenbrot, warme Gare und Backen',url:'https://www.theperfectloaf.com/easy-no-knead-sourdough-bread/'},
 soak:{label:'Plötzblog: Quellzeiten und Wasseraufnahme',url:'https://www.ploetzblog.de/baeckerlatein/quellstueck/id=61261942c30e586ffcd80b5d'},
 rye:{label:'Kochmaus: Roggenbrot mit 500 g Roggenmehl und 200 g Sauerteig',url:'https://kochmaus.de/rezepte/roggenbrot/'},
 spelt:{label:'The Perfect Loaf: Dinkel-Mischbrot als Vergleich',url:'https://www.theperfectloaf.com/spelt-sourdough/'},
 walnut:{label:'The Perfect Loaf: Walnuss-Sauerteigbrot als Vergleich',url:'https://www.theperfectloaf.com/fresh-milled-whole-wheat-walnut-sourdough/'},
 salt:{label:'King Arthur Baking: Gewicht von Tafelsalz',url:'https://www.kingarthurbaking.com/learn/ingredient-weight-chart'}
};
const oven=()=>[{temp:230,min:20,detail:'Mit Dampf nach Geräteanleitung backen.'},{temp:230,min:30,detail:'Dampf ablassen bzw. Topfdeckel abnehmen. Bräunung und Garzustand prüfen; bei Bedarf länger backen.'}];
const wheatSigns='Stockgare: sichtbar aufgegangen, luftig und mit Blasen am Rand. Stückgare: Fingerdruck federt langsam und nicht vollständig zurück. Teigzustand hat Vorrang vor der Uhr.';
const data={
 'pdf-weizen550':{stock:[4,4],proof:[1.75,1.75],roomTemp:21,autolyse:45,foldCount:4,foldInterval:30,refs:['wheat'],note:'Stockgare 4 h und Stückgare 1¾ h aus dem passenden PDF-Beispielplan S. 25 bei 21 °C. Backprogramm aus einem vergleichbaren Weizenbrot übertragen. Starter-Hydration ist eine ergänzte Vorgabe; die PDF-Gärtabelle S. 16 verwendet dagegen 50 %.'},
 'pdf-ruch-altbrot':{stock:[4,5],proof:[1.5,2.5],roomTemp:24,soak:12,refs:['wheat','soak'],note:'Übertragene Planungsannahme: 4–5 h Stockgare und 1½–2½ h Stückgare bei 24 °C; geringere Startermenge und anderes Mehl als im Vergleichsrezept. 12 h Quellzeit gekühlt. Altbrot fein mahlen; 75 g Wasser sind in den 455 g Gesamtwasser enthalten. Die 3-fache Wassermenge stammt aus der PDF, nicht aus dem kalten Quellstück-Vergleich.'},
 'pdf-roggen1150':{coolMinutes:720,stock:[2,3],proof:[.5,.5],roomTemp:22,foldCount:0,bake:[{temp:230,min:15,detail:'In einer gefetteten Kastenform anbacken.'},{temp:190,min:45,detail:'Fertig backen, bei Bedarf verlängern. Vor dem Anschneiden mindestens 12 Stunden auskühlen lassen.'}],refs:['rye'],shapeDetail:'Mit feuchten Händen in eine gefettete Kastenform geben und glattstreichen. Nicht dehnen und falten.',signs:'Sichtbarer Aufgang und Risse an der Oberfläche. Roggenteig nicht mit dem Weizen-Fingertest beurteilen.',note:'Aus einem nahen Vergleichsrezept mit 500 g Roggenmehl und 200 g Sauerteig übertragen: 2–3 h Stockgare, 30 min Stückgare, 60 min Backen. Hier 220 g Starter und anderes Wasserverhältnis; 22 °C ist unsere Planungsannahme für Zimmertemperatur, keine Messangabe der Quelle.'},
 'pdf-manitoba-walnuss':{stock:[3.5,4.5],proof:[1.5,2.5],roomTemp:24,foldCount:3,foldInterval:30,refs:['walnut','wheat'],note:'4 h Stockgare bei 23–24 °C im Walnuss-Vergleich; hier als Bereich 3½–4½ h übernommen. Stückgare 1½–2½ h aus dem Weizen-Vergleich abgeleitet. Abweichende Mehle und Starteranteile; Walnüsse weiterhin wie in deiner PDF erst beim Formen einlegen.'},
 'pdf-dinkel-koerner':{stock:[3.5,4.5],proof:[1.5,2.5],roomTemp:24,foldCount:2,foldInterval:30,soak:12,refs:['spelt','wheat','soak'],note:'Planungsannahme für Dinkel mit Saaten: 3½–4½ h Stockgare, 1½–2½ h Stückgare bei 24 °C. Die Vergleichsquelle ist ein Dinkel-Mischbrot, kein identisches Rezept. Nur schonend falten. Quellstück 12 h gekühlt; Gesamtwasser enthält die 90 g Quellwasser.'},
 'pdf-proteinbrot':{stock:[4,6],proof:[1,2],roomTemp:24,foldCount:2,foldInterval:30,soak:12,refs:['wheat','soak'],note:'Versuchsrezept – nicht probegebacken. Kein identischer belastbarer Rezeptbeleg gefunden. 4–6 h Stockgare, 1–2 h Stückgare und 50 min Backen sind ausdrücklich eigene Planungsannahmen auf Basis der Weizen-Vergleichsmethode. Quellstück 12 h gekühlt. Die PDF-Menge von 210 g Quellwasser kann bei 20 g Flohsamenschalen und Leinsamen zu knapp sein: Konsistenz prüfen, zusätzliches Wasser abwiegen und als erhöhtes Gesamtwasser speichern.',shapeDetail:'In eine gefettete Kastenform geben. Wegen der stark bindenden Zutaten Konsistenz und Aufgang besonders sorgfältig prüfen.'},
 'pdf-airfryer':{stock:[3.5,4.5],proof:[1.5,2.5],roomTemp:24,refs:['wheat'],note:'Warme Gare aus dem Weizen-Vergleich übertragen: 3½–4½ h Stockgare und 1½–2½ h Stückgare bei 24 °C. Das fünfstufige Airfryer-Backprogramm bleibt unverändert aus der PDF; tatsächliche Garzeit hängt vom Gerät ab.'},
 'pdf-joghurt':{salt:9,coldBulkHours:12,fridgeTemp:4,roomTemp:22,refs:['salt'],note:'9 g gelten für 1½ gestrichene TL feines Tafelsalz: King Arthur nennt 18 g pro EL, daraus 6 g pro TL. Grobes Salz hat eine andere Dichte. „Über Nacht“ aus der PDF wird als eigene Planungsannahme mit 12 h bei 4 °C konkretisiert; kein identischer externer Rezeptbeleg. Warme Garzeiten und Backprogramm bleiben aus der PDF.'},
 'pdf-toast':{roomTemp:24,refs:[],note:'Garzeiten, Zutaten und Backprogramm bleiben aus der PDF. Ergänzt ist nur die Vorgabe eines reifen Starters mit 100 % Hydration; bei festem Starter den Wert anpassen.'}
};
export function completePdfRecipe(r){
 const d=data[r.id];if(!d)return r;
 const {refs,note,soak,signs,...values}=d;
 const complete={...r,...values,starter:{hydration:100,...r.starter},bake:d.bake|| (r.bake.length?r.bake:oven()),difficulty:r.id==='pdf-proteinbrot'?'Versuchsrezept':'Mit ergänzten Planungswerten',needsTiming:false,
 sourceNote:'PDF-Rezept mit ergänzten Planungswerten. '+note,
 research:{date:'2026-11-03',status:'Nicht probegebackene Ergänzung',note,sources:[...new Set(['starter',...refs])].map(key=>({...sources[key]}))},
 stockCheckDetail:signs||wheatSigns,proofCheckDetail:signs||wheatSigns};
 if(r.soaker)complete.soaker={...r.soaker,hours:soak,detail:'Während der gewählten Quellzeit abgedeckt bei 6–8 °C im Kühlschrank lagern. Vor dem Mischen die Teigtemperatur berücksichtigen.'};
 if(r.id==='pdf-joghurt')complete.saltNote='Vorgabe: 9 g feines Tafelsalz; bei anderer Salzart abwiegen.';
 return complete;
}
export function recipeResearchView(r,esc){
 if(!r.research)return '';
 return '<details><summary>Quellen und ergänzte Richtwerte</summary><p>'+esc(r.research.status)+' · '+esc(r.research.date)+'</p><p>Die Originalangaben bleiben in der PDF-Rezeptansicht erhalten. Ergänzungen sind veränderbare Startwerte, keine Garantie für deine Mehle oder deinen Starter.</p><ul>'+r.research.sources.map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.label)+'</a></li>').join('')+'</ul></details>';
}
