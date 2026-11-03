/** Vom Nutzer bereitgestellte PDF S. 37–41: Rezeptwerte ohne ergänzte Fantasiemengen.
 * Das ist eine originalgetreue Mengenreferenz, nicht automatisch ein validierter Backplan.
 */
export const PDF_SOURCE_RECIPES=[
 {id:'pdf-weizen550',title:'Weizenbrot Type 550',page:37,yield:'1 Laib',ingredients:['500 g Weizenmehl Type 550','320 g Wasser','10 g Salz','170 g reifes Weizen-Anstellgut'],method:['Nach einem geeigneten Weizenbrot-Backplan führen.'],note:'Auf dieser PDF-Seite stehen die Zutaten, aber kein vollständiger Zeitplan.'},
 {id:'pdf-ruch-altbrot',title:'Ruchbrot mit Weizenprotein und Altbrot',page:37,yield:'1 Laib (die PDF nennt ca. 500 g, obwohl die Zutatenmasse höher ist)',ingredients:['450 g Ruchmehl','50 g Weizenprotein','380 g Wasser','10 g Salz','25 g Altbrot','75 g Quellwasser für das Altbrot','100 g reifer Weizensauerteig (100 % Hydration)'],method:['Altbrot mit gesondertem Quellwasser vorquellen lassen.','Die Quellwasserbilanz prüfen: PDF nennt 380 g Wasser und 75 g separat.'],note:'PDF-Gewichts-/Hydrationsangaben sind nicht widerspruchsfrei. Vor automatischer Planung prüfen.'},
 {id:'pdf-roggen1150',title:'Roggenbrot Type 1150',page:37,yield:'1 Laib',ingredients:['500 g Roggenmehl Type 1150','440 g Wasser','10 g Salz','220 g reifes Roggen-Anstellgut'],method:['Roggengeeignete Teigführung wählen; Faltplan für Weizen nicht automatisch übernehmen.'],note:'Nur Grundmengen in dieser Quelle; keine gesicherten Garzeiten.'},
 {id:'pdf-manitoba-walnuss',title:'Manitoba-Brot mit Walnussfüllung',page:38,yield:'1 Laib',ingredients:['500 g Manitobamehl','360 g Wasser','10 g Salz','180 g reifes Weizen-Anstellgut','100 g Walnüsse als Füllung'],method:['Teig nach Rezept entwickeln.','Walnüsse erst beim Formen nach der Stockgare einarbeiten, nicht mitkneten.'],note:'Walnüsse sind Füllung, kein Bestandteil des Rohteiggewichts vor dem Formen.'},
 {id:'pdf-dinkel-koerner',title:'Dinkelbrot mit Körnern',page:38,yield:'1 Laib',ingredients:['500 g Dinkelmehl Type 630','240–250 g Wasser','10 g Salz','160 g reifes Weizen-Anstellgut','30 g Sonnenblumenkerne','30 g Kürbiskerne','20 g Sesam','90 g Wasser für das Quellstück'],method:['Saaten vorquellen lassen.','Quellwasser in der Gesamtwasserbilanz berücksichtigen.'],note:'Wassermenge als Bereich im PDF; gewünschte Teigkonsistenz und Gesamtbilanz prüfen.'},
 {id:'pdf-proteinbrot',title:'Proteinbrot',page:38,yield:'1 Laib',ingredients:['250 g Weizenmehl Type 550','120 g Weizenprotein','80 g Lupinenmehl','50 g Hanfsamen, geschält','30 g Leinsamen, geschrotet','120 g aktives Weizen-Anstellgut','208 g Wasser','10 g Salz','20 g Flohsamenschalen','210 g Quellwasser'],method:['Bindung und Wassermengen sorgfältig prüfen, Saaten und Flohsamenschalen quellen lassen.'],note:'PDF nennt 208 g Wasser und 210 g separates Quellwasser; bei Hydration nicht doppelt erfassen.'},
 {id:'pdf-airfryer',title:'Weizenbrot aus dem Airfryer',page:39,yield:'1 kleines Brot',ingredients:['300 g Weizenmehl Type 550','180 g Wasser','100 g reifes Weizen-Anstellgut','6 g Salz'],method:['Geräteanleitung auf sicheren Umgang mit Wasser und Dampf prüfen.','Auf 200 °C vorheizen und Teigling leicht befeuchten.','Vier Abschnitte mit je 3–4 Minuten bei ca. 200 °C und leichtem Befeuchten zwischen den Phasen.','Vorsichtig umdrehen und bei 180 °C weitere 10–15 Minuten backen.','Bräunung und nach Möglichkeit Kerntemperatur um 97 °C prüfen.'],note:'PDF enthält ein gerätespezifisches Verfahren; nicht automatisch als normales Ofenprogramm verwenden.'},
 {id:'pdf-joghurt',title:'Sauerteig-Joghurtbrötchen',page:40,yield:'9 Semmeln',ingredients:['400 g Weizenmehl Type 500','80 g Weizenvollkornmehl','220 g Wasser','80 g Joghurt','50 g aktiver Sauerteigstarter','1½ TL Salz'],method:['Mehle, Wasser und Joghurt 30 Minuten autolysieren.','Starter und Salz einarbeiten; 4–6 Stunden Stockgare bei Raumtemperatur.','Nach 30 Minuten falten; noch 2–3 Faltvorgänge im Abstand von ca. 30 Minuten.','Nach sichtbarem Aufgang über Nacht in den Kühlschrank stellen.','In neun Stücke teilen, formen, 1–2 Stunden ruhen lassen.','Auf 250 °C vorheizen, nach dem Einschießen auf 230 °C senken.','10 Minuten mit Dampf und weitere 10 Minuten ohne Dampf backen.'],note:'Die PDF enthält 1½ TL Salz, keine Grammzahl. Keine Grammzahl erfinden.'},
 {id:'pdf-toast',title:'Sauerteig-Toastbrot',page:41,yield:'1 Kastenform',ingredients:['500 g Weizenmehl Type 550','60 g weiche Butter','15 g Honig','9 g Salz','50 g aktives Weizen-Anstellgut','270 g Milch (leicht warm)'],method:['Mehl, Milch, Honig etwa 30 Minuten stehen lassen.','Starter, Salz und Butter einarbeiten.','3,5–4,5 Stunden bei 24–25 °C führen, anfangs insgesamt 3–4 Mal falten.','In fünf Stücke teilen, aufrollen und nebeneinander in die gefettete Kastenform legen.','2–4 Stunden Stückgare, bis knapp über den Formrand.','Bei 190–200 °C etwa 40–50 Minuten backen, gegebenenfalls abdecken.','Kerntemperatur etwa 96 °C prüfen.'],note:'Milch wird als Milch erfasst und nicht fälschlich als reines Wasser gerechnet.'}
];
export const PDF_EXAMPLE_PLANS=[
 {id:'pdf-same-day',title:'Backen an einem Tag',page:25,reference:'500 g Weizenmehl 550 · 320 g Wasser · 10 g Salz · 170 g reifer Starter',events:[
  ['07:00','Starter aus dem Kühlschrank nehmen, 1:1:1 füttern (57 g Starter, 57 g Mehl, 57 g Wasser)'],
  ['13:00','Mehl und Wasser autolysieren (ca. 30–60 Minuten)'],
  ['13:45','Reifen Starter und Salz einarbeiten'],
  ['14:15–16:15','Zweimal Stretch & Fold, anschließend Coil Folds nach Teigzustand'],
  ['17:45','Formen und Stückgare beobachten'],
  ['19:30','Backen nach dem mehrstufigen Standardprogramm']
 ],note:'21 °C, individuelle Reifezeichen haben Vorrang. Die Zeitangaben sind Beispiele, keine Zusage.'},
 {id:'pdf-overnight-proof',title:'Kühlschrankgare über Nacht',page:26,reference:'500 g Weizenmehl 550 · 320 g Wasser · 10 g Salz · 170 g reifer Starter',events:[
  ['07:00','Starter 1:1:1 füttern, bei 21 °C Reife beobachten'],
  ['13:30','Autolyse vorbereiten'],
  ['14:15','Hauptteig mischen und salzen'],
  ['14:45–16:45','Faltphase durchführen'],
  ['18:15','Formen und abgedeckt bei ca. 7 °C in die kalte Stückgare stellen'],
  ['Folgetag 07:15','Backen; zuvor Ofen gut vorheizen']
 ],note:'Die PDF nennt etwa 12 Stunden bei 7 °C. Real gemessene Kühlschranktemperatur und Reife entscheiden.'},
 {id:'pdf-overnight-starter',title:'Starter über Nacht ansetzen',page:27,reference:'500 g Weizenmehl 550 · 320 g Wasser · 10 g Salz · 170 g reifer Starter',events:[
  ['Vorabend 20:00','Starter 1:5:5 füttern (17 g Starter, 85 g Mehl, 85 g Wasser)'],
  ['Morgen 08:30','Autolyse, aber nur falls Starter reif ist'],
  ['09:15','Starter und Salz in den Hauptteig'],
  ['09:45–11:45','Faltphase und Ruhe'],
  ['13:15','Formen und Stückgare beobachten'],
  ['15:00','Backen nach Rezept']
 ],note:'Widerspruch in der PDF: Die 1:5:5-Reifetabelle nennt bei 21 °C ungefähr 21 Stunden, der Beispieltagesplan setzt aber nach 12,5 Stunden an. Deshalb nicht automatisch als sicheren Zeitplan verwenden.'}
];
export function pdfRecipesView(esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))){
 return '<section class="pdf-recipe-intro"><span class="studio-overline">AUS DER ORIGINAL-PDF</span><h2>Alle Rezeptvorlagen der PDF</h2><p>Neun Originalvorlagen von S. 37–41. Im Backplaner sind fehlende Werte ergänzt, mit Quellen und klar gekennzeichneten Planungsannahmen. Hier bleiben die Originalangaben zum Vergleich erhalten.</p></section>'+
 '<section class="pdf-sample-plans"><h3>Drei Beispiel-Zeitpläne (PDF S. 25–27)</h3><p>Wiedergegebene Quellenbeispiele, keine automatisch errechneten, verbindlichen Termine.</p>'+
 PDF_EXAMPLE_PLANS.map(plan=>'<details class="card pdf-recipe"><summary><strong>'+esc(plan.title)+'</strong><small>PDF S. '+plan.page+'</small></summary><p>'+esc(plan.reference)+'</p><ol>'+plan.events.map(([when,what])=>'<li><strong>'+esc(when)+':</strong> '+esc(what)+'</li>').join('')+'</ol><p class="pdf-recipe-note">'+esc(plan.note)+'</p></details>').join('')+'</section>'+
 PDF_SOURCE_RECIPES.map(r=>'<details class="card pdf-recipe"><summary><strong>'+esc(r.title)+'</strong><small>PDF S. '+r.page+' · '+esc(r.yield)+'</small></summary><h3>Zutaten</h3><ul>'+r.ingredients.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h3>Schritte / Hinweise</h3><ol>'+r.method.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><p class="pdf-recipe-note">'+esc(r.note)+'</p><button data-act="pdfPlan:'+r.id+'">Mit diesem Rezept einen Backtag planen</button></details>').join('')+
 '<p class="pdf-source-note">Die vollständigen PDF-Originalseiten werden nicht als öffentlich zugängliche Datei kopiert. Die Rezepte hier sind anhand ihrer Originalmengen aufbereitet und nicht als testgebacken markiert.</p>';
}
