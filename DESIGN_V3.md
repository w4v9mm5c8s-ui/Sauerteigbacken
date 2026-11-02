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
