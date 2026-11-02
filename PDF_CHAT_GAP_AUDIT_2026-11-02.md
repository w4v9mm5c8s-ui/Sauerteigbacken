# Verbindlicher Quellen- und Funktionsabgleich · 02.11.2026

**Quellen:** Originaldatei „Sauerteigbrot.pdf“ (32 Seiten, Upload 24.09.2026, jetzt in der persönlichen Dateibibliothek gefunden); alte Lovable-App „backenmitsauerteig.lovable.app“ und deren Quellmodule/Regressionstests; Chat-Vorgaben und Screenshots vom 29.10.–02.11.; aktueller GitHub-Stand Sauerteigbacken.

**Legende:** [x] als Datensatz oder Code vorhanden; [~] teilweise/fachlich nicht vollständig implementiert; [ ] fehlt oder nicht funktionsgeprüft. „Code vorhanden“ bedeutet **nicht** „auf echtem iPhone abgenommen“.

## A. PDF: Was wurde übernommen?

- [x] Seiten 7–8: 27 Mehlsorten mit Hydration, Wasser/Starter und Stock-/Stückfaktoren als \`flour-table.json\`. **Aber die Faktoren werden im neuen \`planner.js\` nicht automatisch genutzt.**
- [x] Seiten 2–4, 28–31: Glossar, Grundlagen und FAQ in \`knowledge-data.json\` (97 Einträge, 46 mit ausführlicheren Textabschnitten, 51 überwiegend Kurzdefinitionen).
- [x] Seite 32: 21 Quellen (5 Blogs, 5 Bücher, 5 YouTube- und 6 Instagram-Kanäle) in \`resources.json\`; Links/ISBN nicht unabhängig verifiziert.
- [x] Quellenkonflikte (12) sind in \`source-conflicts.json\` **dokumentiert**; ihre korrekte Umsetzung in jeder Berechnung ist nicht damit bewiesen.
- [~] Seiten 9–12: Unterscheidung Weizen-/Roggen-ASG und Fütterung sind in Wissen/Starteransichten vorhanden, aber **die Peak-Tabelle mit fünf Fütterungsverhältnissen × sieben Temperaturen (18–24 °C) ist nicht als automatische Planungsgrundlage implementiert**. Ohne Nutzerwert nutzt \`planner.js\` einen 9-Stunden-Platzhalter.
- [~] Seiten 16–17: Stockgare 18–24 °C und Mehlabweichungen als Daten teilweise vorhanden, **nicht durchgehend in die Planungsberechnung integriert**. Die aktuelle Formel verwendet den Mittelwert aus dem ausgewählten Rezept.
- [~] Seiten 20–21: Stückgare 18–24 °C und 7 °C/12 h Kühlschrankgare werden **nicht abhängig von tatsächlich gemessener Teig-/Kühlschranktemperatur** gerechnet; kalte Gare nur bei Rezepten mit hinterlegtem \`cold\`.
- [~] Seite 13: Autolyse, Knetzeiten von Hand/Maschine, Fenstertest und Überknetungsmerkmale als Erklärung vorhanden, **keine vollständige Geräte-/Knetmethodenlogik und Kalibrierung**.
- [~] Seite 14: Stretch & Fold versus Coil Fold; Backtage bieten generisches „Teig falten“, **kein zuverlässiger methoden-/teigabhängiger Wechsel**.
- [~] Seiten 18–19: Formen/Fingertest/Reifesignale als Wissenseintrag, aber **keine eigenständige interaktive Phasenprüfung mit visueller Anleitung**.
- [ ] Seiten 22–23: Gärkörbchen-Größentabelle rund/oval für 500–1500 g und systematischer Kompatibilitätscheck mit ausgewähltem Equipment fehlen im Neuaufbau.
- [~] Seite 24: PDF-Standardprogramm (60 min/250 °C vorheizen; 230 °C mit Dampf; 4 min nachschneiden; 4 min später Dampf ablassen/210 °C; 20+20 min; Kerntemperatur 97 °C; ≥1 h auskühlen) ist **nicht als vollständiges strukturiertes, frei bearbeitbares Phasenprogramm** umgesetzt. Viele Vorlagen verwenden kürzere zweistufige Backprogramme und 45-min-Vorheizen.
- [~] Seite 25: Altbrot 5 % + dreifache Wassermenge, 12 h Einweichen ist als Option/Schritt vorhanden; **Quellwasser wird im Planer zusätzlich zum eingetragenen Wasser aufgenommen, statt zuverlässig das Hauptteigwasser zu reduzieren**. Gefahr einer falschen Gesamt-Hydration.
- [ ] Seite 26: individuelle Wasseraufnahme für Saaten/Körner (50/100/150/200 % nach Art) und automatische Wasserbilanz des Quellstücks fehlen.
- [ ] Seite 27: eigener Brühstück-/Kochstück-Modus (5–20 % Mehl, 100–200 % Wasser, Wasserbilanz, Kochen, Abkühlen) fehlt. Das Formular kennt nur ein generisches Quellstück.
- [ ] PDF-Diagramme/Lehrbilder: Reifestufen, Fenstertest, Faltschritte, Formen, Einschneidewinkel, Gärkörbchengrößen als **didaktische Grafiken** sind nicht originalgetreu übernommen; aktuelle Aquarell-SVGs sind überwiegend **dekorativ**.
- [ ] Das Original-PDF ist in der persönlichen Dateibibliothek auffindbar, aber nicht als PDF-Lernquelle mit Seitenreferenzen in der App eingebunden. Nicht blind in ein öffentliches Repository kopieren (Urheberrecht/Datenschutz prüfen).

## B. Gegenüber der alten Lovable-App: fehlende oder vereinfachte Funktionen

**Priorität P0 – Fachlich korrekte Mengen und Termine:**
- [ ] Vollständige temperatur- und mehlabhängige ASG-/Stock-/Stückgare-Berechnung; Toleranzen, Reifezeichen, Starterart und Fütterungsverhältnis beachten.
- [ ] Starter-Hydration bei Fütterung und Rezeptbilanz korrekt fortschreiben: etwa 50 % alter Starter + 1:1:1 kann ≈80 % ergeben, nicht stillschweigend 50/100 % bleiben. Fehlende Werte müssen unbekannt bleiben.
- [ ] Quellwasser/Füllungen/Zusätze/Beläge nach ihrer tatsächlichen Rolle verrechnen; **kein doppelt gezähltes Wasser**, kein Belag im Rohteiggewicht.
- [ ] Autolyse parallel zur Starter-Reifung terminieren (Weizen) statt grundsätzlich davor; Roggen nach fachlich passendem Mischablauf. Reihenfolge und Schlafzeiten prüfen.
- [ ] Wunsch-Backzeit rückwärts respektieren und wirklich **machbare Alternative** liefern; kein bloßes „kein Plan gefunden“ bei lösbaren Terminkonflikten. Gleichzeitig darf die App keine fachlich unplausiblen Zeiten erzwingen.
- [ ] Zeitbezogener Backplan mit verschiedenen aktiven und passiven Teilschritten, unterschiedlichen Gär-/Kühltemperaturen und echter Ofenbeladung pro Laib; vollständige Regeltests.
- [ ] Sichere Logik für Spezialrezepte (Brezeln, Laugenstangen, Focaccia, Zimtschnecken, Roggen): Bäckerbad/Auflage/Füllung/Öl nicht als Teigmasse rechnen, Milch/Ei nicht als Wasser.

**Priorität P1 – Backtag & persönliche Daten:**
- [ ] Jede Zutat pro Phase separat als „hinzugefügt“ markieren; Mengenänderung invalidiert alte Häkchen; Hauptteig erst nach den tatsächlich abgeschlossenen Vorphasen.
- [ ] Backtag ermöglicht unabhängige parallele Autolyse-/Quellstück-Aufgaben und passt deren Zeitpunkte nach tatsächlich abgeschlossenem Starter an.
- [~] Schritte vor/zurück, Messwerte, Fotos, Zeitverschiebung, mehrere Backtage, Timer sind vorhanden. Aber volle Phasenabhängigkeiten, tatsächlicher Soll-Ist-Abgleich, Rückwärtsneuberechnung und E2E-Abnahme fehlen.
- [~] Foto-Upload und KI-Buddy existieren; dedizierte Fotoanalyse für Starter-/Teigreife mit nachvollziehbarem Resultat, Vorher-Nachher und Datenübernahme ist nicht vollständig vorhanden.
- [~] Medianbasierte Starter-Prognose nach 3 Messungen vorhanden. Gegenüber alter \`PeakLearning\`: Tabellenanker, Ausreißerprüfung, Temperatur-/Starterart-Anpassung, Bearbeiten/Löschen von Messungen, Rückführung in Plan nur teilweise.
- [ ] Wasser-Temperatur-Rechner nach realen Zutatenmassen, tatsächlichen Temperaturwerten, Mehl-Wärmekapazität und kalibriertem Knetwärmeeintrag fehlt; aktuell nur grobe Formel.
- [~] Eigene Rezepte: Speichern, Bearbeiten, Duplizieren, eigener Backplan vorhanden. Vollständige typisierte Zusätze, alternative Flüssigkeiten, Backphasen, Versionierung, Export/Druck und historische Bearbeitung fehlen.
- [~] Backstatistik mit vier Qualitäten, Zeiten, Temperaturen und CSV vorhanden; belastbare Werte erst nach tatsächlicher Erfassung/Datenschutz-/Gerätetests. Kein Nachweis für alle alten Originalauswertungen.
- [~] Cloud-Synchronisierung und Backups existieren, aber Konfliktzusammenführung über mehrere Geräte sowie Upload/Download/Löschung mit zwei realen Konten nicht end-to-end bestätigt.

**Priorität P1 – Community, Kommunikation und Benachrichtigungen:**
- [~] Community-Feed, Einreichen, Speichern, Melden, Moderator:innen-API existieren; Autorenprofilseiten, zuverlässige Moderationsprozesse und Einreichungs-/Meldungs-Roundtrips wurden nicht mit mehreren Konten geprüft.
- [ ] Zuverlässige Web-Pushs bei vollständig geschlossener iPhone-PWA, VAPID-Abonnements, serverseitige Termin-Jobs, Erinnerungslogik und Deduplikation fehlen. Browser-Timer in geöffneter App und Kalenderexport sind kein Ersatz.
- [ ] Offline-/PWA-E2E-Test auf iPhone mit gesperrtem Bildschirm, Netzverlust und geschlossener App fehlt.

## C. Deine ausdrücklichen Screenshot-Anforderungen

- [x] „Wizard“, unklare Startseitenhinweise und großer Küchenmodus sind im Neuaufbau nicht als eigenständige Oberfläche vorgesehen.
- [x] „Stückgare“/„Kühlschrankgare“ als Bezeichnungen, Vorheizen/Altbrot-Quellstück als eigene Schritte, Zurück-Buttons, Anmeldungspflicht für KI/Einkauf/Vorrat grundsätzlich eingebaut.
- [x] Mehltemperatur standardmäßig von Raumtemperatur abgeleitet und überschreibbar als UI vorbereitet; Startertemperatur optional.
- [~] Die Startseite wurde mit Rose-Beige/Aquarell-SVGs überarbeitet, SVGs bleiben als native Vektor-Dateien. **Ein exakt gleicher Look wie das genehmigte Bild wurde weder belegt noch auf iPhone visuell verglichen.**
- [~] „1 Laib“ muss in der UI eindeutig ein **fertiges Brot** bedeuten; die Planungslogik unterscheidet bereits rohes und geschätztes fertiges Gewicht, aber keine exakte Backverlustmessung.
- [ ] „Automatisch immer einen funktionierenden Plan“: Fehlermeldung „innerhalb von 21 Tagen kein sicherer Zeitplan“ existiert weiterhin; harte Nutzeranforderung nicht erfüllt.
- [~] „Überall extrem wenig, verständlicher Text“: mehrere technische Erläuterungen bleiben in Planer, Statistiken, Quellen und Starterprofil. Vollständige UX-Textbereinigung fehlt.
- [~] Genaue Backzeit-, PDF-Rezept- und Knetvorgaben nur teilweise phasenweise umgesetzt.
- [ ] Der schwarze Render-Aufwachbildschirm vor dem ersten Laden bleibt durch den kostenlosen Webservice möglich. Lokaler PWA-Cache verbessert nur spätere Besuche. Für serverseitig immer erreichbare URL: kostenpflichtiger Always-on-Plan (nur nach Freigabe).
- [ ] Alle Beispielillustrationen *identisch* übernehmen ist nicht erfüllt; es gibt selbst erstellte SVGs und keine überprüfte identische Umsetzung der originalen Bild-/SVG-Dateien.

## D. Live-Abnahme und Geschäftsmodell

- [x] Render/GitHub/Supabase eigenständig; Stripe-Checkout/Portal/Webhook und Sandbox-Produkt technisch vorbereitet. **Nicht live bezahlt.**
- [ ] Registrierung, E-Mail-Verifizierung, Passwort-Reset und Session-Rückkehr auf dem echten iPhone durchtesten.
- [ ] KI-Buddy, echte Fotoanalyse und Rezeptimport mit authentifiziertem Testkonto prüfen.
- [ ] Zwei-Konto-Tests für RLS, Community, Privatsphäre, Fotos, Backups und Accountlöschung.
- [ ] GitHub-Repo ist weiterhin **public**; private Einstellung fehlt.
- [ ] Rechtliches Impressum/Datenschutz/AGB/Verarbeitung der Nutzungs- und KI-Daten sowie steuerliche Bezahlfreigabe.
- [ ] Stripe-Secrets \`STRIPE_SECRET_KEY\` und Supabase \`SUPABASE_SERVICE_ROLE_KEY\` sicher auf Render hinterlegen; Test-Checkout + Webhooks, Kündigung, Portal, Rechnungen prüfen; \`BILLING_ENABLED=false\` beibehalten, bis ausdrücklich freigegeben.
- [ ] Den Render-Startup-/PWA-Ladezustand im echten Safari prüfen; der kostenlose Render-Plan schläft nach Inaktivität ein.
- [ ] Alle 26 Rezepte fachlich validieren – Code-Tests machen aus Rezepten keine testgebackenen Rezepte.

## E. Quelle enthält offene Widersprüche – nicht stillschweigend korrigieren

1. PDF S. 25: Altbrot + 3× Wasser; PDF S. 26: Altbrot in der Tabelle + 2× Wasser.
2. PDF S. 16: Stockgare mit Anstellgut 50 % Hydration; einige Rezeptvorlagen arbeiten mit 100 %.
3. PDF S. 2 „Brühstück = mit kochendem Wasser übergießen“, S. 27 „aufkochen“ – methodische Unschärfe.
4. PDF S. 11 fordert ±20 %, tabellarische Toleranzen S. 12 weichen je nach Zeile ab.
5. PDF S. 22 „zu großes Gärkörbchen“ enthält wohl widersprüchlichen Text („stabile Stückgare“).

**Reihenfolge:** (1) Mengen-/Wasser-/Starterbilanz absichern → (2) Tabellenbasierte Temperatur-/Gärplanung → (3) Phasen/Checklisten/Equipment → (4) dedizierte Starter-/Foto-Funktionen → (5) Community, Push und Smartphone-Endtests → (6) Design-Feinschliff, Datenschutz und Payment-Freigabe.

Stand: Live-Deployment c8483b1 war am 02.11.2026 21:16 MEZ bestätigt; neuere GitHub-Commits müssen separat gebaut/verifiziert werden.
