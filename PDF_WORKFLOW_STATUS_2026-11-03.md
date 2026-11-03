# Umsetzung und Prüfstand – 3. November 2026

Umgesetzt:
- Neun PDF-Rezepte als skalierbare Planungsvorlagen; fehlende Zeiten, Starterhydratation und Salzmenge verlangen Eingaben.
- Rezeptabhängige Abläufe: kalte Stockgare vor Formen, Quellstücke, Walnussfüllung, Airfryer-Phasen, Toast und Semmeln.
- Prüfung aktiver Zeitkonflikte, verschiebbare Vorbereitung und Berücksichtigung paralleler Backtage.
- Keine pauschale neun Stunden Starterreife mehr.
- Sieben interaktive Anleitungen mit Schrittwechsel und gespeichertem Lernfortschritt.
- Persistenter Push-Dienst mit geschützten Abonnements, Warteschlange, Edge Function und Minuten-Cron; Infrastruktur in Supabase eingerichtet.
- Cloud-Speicherung mit Revisionsprüfung gegen stilles Überschreiben zwischen Geräten.
- PWA-Aktualisierung mit konsistentem Versionsschlüssel und Cache v34.

Validierung:
- npm run build: Syntaxprüfung und 212 bestandene Tests.
- Datenbanktransaktionen mit zwei Testidentitäten: eigene Daten sichtbar, fremde Daten gesperrt, veraltete Revision abgewiesen, fremde Push-Abonnements gesperrt; Testdaten zurückgerollt.
- Push-Worker über geplanten HTTP-Aufruf erreichbar (200).

Offene Abnahme:
- Tatsächlich zugestellte Push-Nachricht auf einer installierten iPhone-PWA.
- Vollständiger authentifizierter Browserdurchlauf einschließlich E-Mail-Bestätigung, privatem Foto, KI-Auswertung und Kontolöschung.
- Echte Stripe-Zahlungen: derzeit nur Sandbox verbunden; Live-Konto und freigegebene Preise fehlen. Keine echten Zahlungen aktiviert.
- Interaktive Anleitungen sind schematische Lernhilfen, keine validierten Backversuche. Quellenlücken bleiben sichtbar.

## Nachprüfung: Sitzungswechsel
- Behoben: verspätete API-Antworten und Sitzungserneuerungen nach Abmeldung/Kontowechsel; parallele Erneuerungen teilen jetzt eine Anfrage.
- Foto-Uploads prüfen das ursprüngliche Konto vor und nach dem Upload; Gäste planen keine Push-Jobs.
- Kontolöschung leert jetzt auch Refresh-Token und Berechtigungszustand.
- 216 Tests bestanden, darunter vier ausgeführte Tests mit gezielt verzögerten Antworten.
- Live geprüft: Foto-Bucket privat, INSERT/SELECT/UPDATE/DELETE auf eigenen Kontopfad beschränkt. 17 erfolgreiche Cron-Ausführungen im betrachteten Zeitraum.
- Weiterhin offen: Kontodurchlauf mit Anmeldung und tatsächlich zugestellter iPhone-Push. Passwort-Leak-Prüfung laut Supabase Advisor nicht aktiviert; keine passende Konfigurationsfunktion im verfügbaren Connector.

## Live-Test mit zwei separaten Testkonten
Am 3. November 2026 über die echten Auth-, App- und Storage-APIs geprüft:
- Anmeldung beider Konten: HTTP 200. Testkonten administrativ angelegt und bestätigt; daher kein Nachweis der E-Mail-Zustellung oder Registrierung im Browser.
- Cloud-Speichern und erneutes Laden: identischer Inhalt, Revision 1. Veraltete Speicherung: HTTP 409. Zweites Konto sieht keine Daten des ersten.
- JPEG hochladen und ersetzen: HTTP 200. Eigener signierter Abruf: 200. Signierter Abruf aus zweitem Konto: abgewiesen (400).
- KI-Textantwort, Rezeptimport und synthetisches Testbild: HTTP 200. Keine Aussage zur fachlichen Qualität einer Brot-Fotoanalyse.
- Sitzungserneuerung: HTTP 200.
- Kontolöschung beider Testkonten einschließlich Foto: HTTP 200. Datenbankkontrolle: null verbleibende Testkonten, Datensätze und Fotos.

Ergänzte Funktionen: Backtag abbrechen mit Timerbereinigung; gespeichertes Schrittfoto entfernen; Push-Test in einer Minute. Leere Backtag-Ansicht repariert; Kontolöschung entfernt lokale Backtage und Push-Zuordnung. Cache v36. 220 automatisierte Tests bestanden.
Weiter offen: E-Mail-Bestätigung und Passwort-Reset mit echtem Postfach, iPhone-Push-Zustellung, Stripe-Live/Preise, vollständige fachliche Rezeptabnahme.
