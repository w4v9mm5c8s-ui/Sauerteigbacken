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
