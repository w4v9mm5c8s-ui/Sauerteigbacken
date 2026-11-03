# Abgleich der Sauerteig-PDF mit der eigenständigen Render-App
Stand: 03.11.2026 · Quellen: Sauerteigbrot.pdf, 41 Seiten, sowie 32-seitige Vorfassung.
Dieser Nachweis betrifft ausschließlich den Code im GitHub-Repository `Sauerteigbacken`. 
Ein bestandener automatisierter Test ist keine reale Backprobe und kein iPhone-End-to-End-Test.

## Inhalte je PDF-Seite

| PDF-Seiten | Umsetzung / Quellmodule | Status |
|---|---|---|
| 1–4 Grundlagen, Begriffe | `knowledge-data.json` (97 Einträge), Suche / Glossar | integriert, Textgenauigkeit stichprobengeprüft |
| 5–6 Ausrüstung und Mehle | Wissensbibliothek; `flour-table.json` | integriert |
| 7–8 27 Mehlsorten | `flour-table.json`, `flour-mix.js`, `flour-table.js` | integriert; 10 alte Mehlkürzel werden ohne Datenmigration in Vollnamen übersetzt |
| 9–12 Starter, Fütterungen und Peak-Tabelle | `starter-tracking.js`, `pdf-baking.js`, `pdf-tools-ui.js` | integriert; individuelle Reifeprognosen benötigen gemessene Fütterungen |
| 13–15 Kneten, Falten, Stockgare | PDF-Lektionen, Lehrgrafiken, `planner.js` | integriert; Knet-/Faltmethode nur rezeptbezogener Vorschlag |
| 16–17 Stockgare-Tabellen | `estimateFermentation`, Mehlfaktoren geteilt durch 100 | integriert; gilt genau nur bei den dokumentierten Referenzbedingungen |
| 18–21 Formen, Stückgare, Kühlschrank | Lektionen; Temperatur-/Mehlfaktoren; `planning-ui.js` | Referenzwerte integriert; praktische Kalibrierung offen |
| 22–23 Gärkörbchen und Größen | `checkBanneton`, rund und oval; Einbindung in Planer | integriert für 500–1500 g |
| 24 Dampfen, Backphasen, Kerntemperatur | `standardBakePhases`, optionaler PDF-Modus in `planner.js` | integriert für geeignete Standardbrote, keine pauschale Anwendung auf Spezialgebäcke |
| 25–27 Drei Beispiel-Zeitpläne | `pdf-recipes.js`, `PDF_EXAMPLE_PLANS` | als Quellenreferenz integriert; keine ungesicherten Termine |
| 28–30 Altbrot, Saaten, Quell-/Brühstück | `waterBalance`, `PDF_SOAKER_RATIOS`; Hauptteigwasser = Gesamtwasser minus Vorstufenwasser | integriert mit Validierung; bei unklaren Altbrot-Verhältnissen bewusste Auswahl |
| 31–34 FAQ und Backprobleme | Wissensbibliothek und KI-Buddy | Inhalte integriert; KI-Livefunktion erfordert einen echten Test |
| 35 KI-Buddy | `server.mjs`, `app.js` | technische Funktion vorbereitet; Authentifizierung und Fotoanalyse auf realem Gerät noch nicht abgenommen |
| 36 Bücher, Blogs und Kanäle | `resources.json` (21 Ressourcen) | integriert |
| 37–41 Neun PDF-Rezepte | `pdf-recipes.js`, via PDF-Rezeptbibliothek erreichbar | Originalmengen sichtbar; fehlende Zeit-/Mengenangaben nicht erfunden |
| übrige App-Rezepte | `recipes.json` (26) + `historical-recipes.json` (10) | zusätzlich vorhanden, nicht als wortgleiche PDF-Rezepte ausgegeben |

## Testnachweise

- `tests/pdf-completeness.test.mjs`: Tabellen, Wasserbilanz, Backphasen, Rezeptquellen.
- `tests/legacy-flour-compat.test.mjs`: alle 26 Rezepte nutzen auflösbare Mehlbezeichnungen.
- `tests/plan.test.mjs`: Ausweichtermine, Schlaf-/Abwesenheitsfenster, Laugen und Kühlschrank.
- `tests/offline-shell.test.mjs`: Service-Worker-Cache ohne private API-Antworten.
- `tests/auth-full-flow.test.mjs`: Authentifizierungszustände und Rücksprungverarbeitung (Mock-/Unit-Tests).

## Was ausdrücklich nicht als vollständig abgenommen gilt

1. Realer iPhone-Safari-Test mit Anmeldung, E-Mail-Bestätigung, Wiederherstellung und Kontolöschung.
2. KI-Buddy und Bild-/Fotoanalyse mit echtem Account und fehlerhaften Netzverbindungen.
3. Mehrgeräte-Synchronisation, Push-Benachrichtigungen bei geschlossener App und Berechtigungskonflikte.
4. Fachliche Validierung der gesamten Zeit-/Temperaturtabellen mit realen Brot-/Starterversuchen.
5. Unklare Rezeptvorlagen (z. B. PDF-Salz nur in TL, 2× versus 3× Altbrotwasser): Entscheidung/Prüfung erforderlich.
6. Rechts- und Zahlungsfreigaben (Impressum, Datenschutz, Stripe-Live-Setup).

**Wichtig:** PDF-Tabellen sind nicht automatisch allgemein gültige Prognosemodelle. Der Teigzustand, Starteraktivität, Ofentyp und die tatsächliche Temperatur gehen einem festen Zeitwert vor.
