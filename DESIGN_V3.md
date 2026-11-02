# Visuelles Redesign – Sauerteig Buddy (02.11.2026)

Ziel: eigenständige App in Rosé/Beige mit echten Funktionen im Stil der zuvor erstellten Aquarell-Mockup-Vorlage.

## Jetzt implementiert
- Eigene, lokal ausgelieferte SVG-Aquarellszene aus Sauerteigglas, Laib, Mehlschale, Leinen und Ähren: `art-hero.svg`
- Original angelegte SVG-Motive: `art-books.svg`, `art-scale.svg`, `art-calendar.svg`, `art-buddy.svg`, `art-pretzel.svg`
- Zusätzlich bereits vorhandene Originalmotive: `art-loaf.svg`, `art-starter.svg`, `art-tools.svg`, `art-basket.svg`, `art-wheat.svg`
- Startseite mit Markenlogo als Text, Aquarell-Hero, acht 2-spaltigen Funktionskacheln (auf größeren Displays 4), laufendem Backtag, maximal drei tatsächlich gebackenen Broten und nur bei Anmeldung sichtbarem Buddy-Bereich
- Illustrierter Backen-Hub mit zehn Themenbereichen statt einer langen einheitlichen Buttonliste
- Rezeptbibliothek mit passenden Aquarell-Thumbnails für Brot, Laugengebäck und Brötchen
- Wissen, Rechner, Starter, Buddy und Onboarding erhalten zum jeweiligen Inhalt passende Motive
- Gemeinsam verwendetes SVG-Liniensymbolsystem für Navigation und Aktionen
- Responsives CSS mit Safe-Area-Abständen, iOS-Eingabefeldgrößen, sinnvollen Textumbruchregeln und übersichtlichen Kacheln
- Neues Brot planen: vorherige explizite Rezeptauswahl statt stillschweigend erstes Rezept nehmen
- 86 automatisierte Node-Tests bestanden; Render-Deployment `dep-dbkbkkp42hec73f77jv0` live

## Wichtige Grenzen
- Grafiken sind **neu gezeichnete eigenständige SVGs**. Sie sind keine pixelgenau reproduzierten, nicht verfügbaren Ursprungs-PNGs.
- Der im Chat gezeigte Beispielbildschirm war eine Bildidee, keine funktionsfähige Seite. Die neue Startseite übernimmt die Gestaltung, nutzt aber echte Backdaten statt erfundener Beispieldaten.
- Ein echter iPhone-Safari-Screenshotvergleich ist weiterhin offen. CSS-Regressionstests beweisen keine pixelgenaue Darstellung.
- Timer-Push bei geschlossener App, reale E-Mail-/KI-End-to-End-Prüfung und vollständige fachliche Backplanabnahme bleiben separat offen.
- Manueller Browser-Smoketest liegt in `tests/browser-smoke.mjs`, wurde für das neue Design aktualisiert. Kein automatischer GitHub-Actions-Mailworkflow wird wieder eingeschaltet.

## Erweiterung nach visueller Abnahme
- Neue Aquarellmotive: `art-heart.svg` für Favoriten und `art-chart.svg` für Statistik. Beide als lokale, eigenständig gezeichnete SVGs.
- Alle acht Startkacheln nutzen jetzt Aquarelle statt gemischter Standardsymbole.
- Zusätzlich illustrierte Kopfbereiche in Backstatistik, Community-Backbuch, Favoriten, Backhistorie, Einkaufsliste, eigene Rezepte und Vorräte.
- Überlagerte Liniensymbole in illustrierter Backen-Navigation per `.hub-icon.has-art` ausgeblendet.
- Sichtbare iOS-Fokuszustände und größerer Scrollabstand oberhalb der fixierten Navigation.
- Validierter persönlicher JSON-Backup-Import: maximale Dateigröße, Datentypprüfung und explizite Bestätigung vor dem Überschreiben; Cloud-Abgleich kann danach asynchron erfolgen.
- Die extern geladenen Schriftarten Fraunces und Outfit sind in der Content Security Policy freigeschaltet. Vor öffentlicher Produktfreigabe müssen diese Schriftabrufe datenschutzrechtlich geprüft oder lokal bereitgestellt werden.
- Zusätzliche Tests für Motive, ausgelieferte Assets, illustrierte Bereiche und den Backup-Import.
- Ein echter iPhone-Safari- und Pixeltest ist weiterhin nicht als durchgeführt bestätigt; aus `npm test` folgt keine visuelle Abnahme.

## 02.11.2026 – Direkte SVGs und sofort sichtbare Startseite
- [x] In-App-Ladeanzeige `<p>Lädt …</p>` aus der initialen `index.html` entfernt.
- [x] Die echte Startseite mit Aquarell-Header und acht Funktionskacheln wird jetzt direkt im HTML ausgeliefert, bevor JavaScript startet; kein zusätzlicher Lade-/Splash-Screen im App-Code.
- [x] Vier Bottom-Navigation-Icons sind bereits im initialen HTML echte Inline-SVGs, auch ohne JavaScript.
- [x] SVG-Motive bleiben unverändert skalierbare `.svg`-Dateien und werden direkt via `<img src="/art-*.svg">` eingebunden. Keine Konvertierung der Illustrationen zu PNG, JPEG oder WebP und keine Canvas-Rasterisierung in dieser UI.
- [x] iPhone-CSS auf 4 Motivkacheln je Reihe umgestellt; kompakterer Hero-Bereich und drei echte Backhistorie-Karten nebeneinander wie im Layoutentwurf.
- [x] Wenn API/Netz nicht erreichbar sind, bleibt die Startseite sichtbar und zeigt einen Fehlerhinweis statt einer leeren Lade-/Fehleransicht.
- [x] PWA-Cacheversion aktualisiert und HTML mit no-store ausgeliefert, damit alte Ladeansichten nicht im Browser hängen bleiben.
- [ ] Die in früheren Nachrichten gezeigten Referenzgrafiken liegen als JPEG/PNG/WebP vor, nicht als originale SVG-Dateien. Für eine **exakte** 1:1-Übernahme der Originalvektoren fehlen die SVG-Quelldateien; aus Rasterbildern wird bewusst kein verlustbehaftetes SVG vorgetäuscht.
- [ ] Echte optische Abnahme auf iPhone/Safari bleibt offen. Der iOS-eigene systembedingte Startbildschirm liegt außerhalb der App und kann durch das Entfernen von HTML-Ladetext nicht garantiert vollständig unterbunden werden.
