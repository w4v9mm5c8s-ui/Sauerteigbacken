# Offene Abnahme – Stand 31.10.2026

Dies ist eine veröffentlichte **Entwicklungsfassung**, keine freigegebene fertige App. Ein erfolgreicher Build oder HTTP-200-Check ersetzt keine Ende-zu-Ende-Prüfung.

## Kritisch vor echtem Nutzerbetrieb
- [ ] Supabase Auth: Site URL und Redirect-URLs für die Render-Adresse setzen; Registrierung, Verifizierung, Passwort-Reset und Sitzungserneuerung auf dem iPhone prüfen
- [ ] GitHub-Repository auf **private** umstellen (GitHub meldete zuletzt public)
- [ ] KI-Buddy mit authentifiziertem Testkonto tatsächlich abfragen; Fotoanalyse und Text-/Bild-Rezeptimport durchspielen
- [ ] Impressum, Datenschutzerklärung, Auftragsverarbeitung und Löschprozess juristisch prüfen (keine erfundenen Betreiberangaben)
- [ ] Sicherheitstest mit zwei getrennten Konten: Datenisolation, Community, Zugriffsschutz, Löschung
- [ ] Safari/iPhone: Scrollen, Tastatur, Dateiupload, Safe Area, Navigation, installierbare PWA testen

## Fachliche und funktionale Erweiterungen
- [x] Kühlschrankgare für helles Weizen-Landbrot als alternative passive Übernachtphase ergänzt und automatisiert getestet
- [ ] Kühlschrankgare für weitere Rezepte fachlich getrennt prüfen (Pizza, Focaccia, Bagels haben andere Abläufe); keine pauschalen Zeiten
- [x] Einmalige Abwesenheit mit Beginn und Ende als Sperrzeit für aktive Schritte ergänzt (automatisiert getestet)
- [ ] Wiederkehrende Abwesenheiten und mehrere Zeitfenster noch offen
- [ ] Tatsächliche Starter-Reife anhand Temperatur, Fütterung und dokumentierter Beobachtungen kalibrieren; 9 Stunden ist bisher nur ein grober Platzhalter
- [ ] Eigene Rezepte vollständig in Mengenrechner und Backplaner integrieren, ohne fehlende Werte zu erfinden
- [ ] Import per Rezept-Weblink mit sicherem URL-Abruf und manueller Freigabe
- [ ] Importierte Rezeptfotos mit realen Geräten und wechselnden Bildformaten testen
- [x] Moderator:innenrollen und Review-UI mit RLS-geschützter Freigabe implementiert
- [ ] Moderator:in nach Registrierung ausdrücklich freischalten und Freigabe mit zwei Konten testen
- [ ] Alle 26 Rezeptvorlagen praktisch/fachlich validieren; keine Behauptung, sie seien testgebacken
- [ ] Original-PDF und gesamte Screenshot-Anforderungsliste erneut abgleichen, sofern die Quelldateien verfügbar sind
- [ ] Migration bestehender Lovable-Daten nur nach ausdrücklicher Freigabe und mit Backup
- [ ] Backtag: echte Zeiterfassung, Timer-Interaktion und dynamische Umplanung bei Abweichungen
- [x] Abweichender Backtermin wird vor Übernahme bestätigt
- [x] Bäckerlauge als eigenständiger aktiver Schritt für Laugenbrezeln und Laugenstangen ergänzt
- [x] Fütterungsverhältnis für Starter auswählbar und Mengenberechnung ergänzt
- [ ] Offline- und Datenabgleichkonflikte bei mehreren Geräten testen

## Nachweislich eingerichtet
- [x] Eigenständiges GitHub-Repository, Node-Render-Service und separates Supabase-Projekt
- [x] 26 Rezeptdatensätze mit Zutaten und Schritten übernommen
- [x] KI-Modellzugriff per serverseitigem OpenAI-Key mit HTTP 200 validiert (kein kompletter KI-Funktionstest)
- [x] Backtag-Schrittnavigation mit Zurück, Vorheizen und Quellstück im Planer
- [x] Private Rezepte, Text-/Foto-Import zur manuellen Prüfung
- [x] Datenexport, bestätigte Kontolöschfunktion als Supabase Edge Function bereitgestellt
- [x] RLS-geschützte Community-Daten und Moderator:innen-Rollen vorbereitet
- [x] PWA-Grundstruktur und Offline-Cache nur für öffentliche Dateien
- [x] Supabase-Sicherheitsadvisor ohne gemeldete Befunde; keine vollständige Penetrationsprüfung

## Sicherheits- und UX-Fixes (31.10.)
- [x] Statische Dateien auf explizite Freigabeliste beschränkt; Servercode, Tests und Konfiguration nicht öffentlich auslieferbar
- [x] 20 automatisierte Tests für Build, Planung, Rezepte und grundlegende Sicherheit bestanden
- [x] Backplaner vorbelegt mit einem künftigen Termin; Eingaben beim Zurücknavigieren erhalten
- [x] Laufender Backtag über Neustarts hinweg lokal gespeichert und pro angemeldetem Konto getrennt
- [ ] Browser-E2E-Tests und tatsächliche E-Mail-Zustellung fehlen weiterhin

## 02.11.2026 – GitHub-E-Mail-Flut
- [x] Automatisch bei jedem Commit gestarteten GitHub-Actions-Workflow `mobile-ui.yml` vollständig entfernt; dadurch werden keine weiteren Fehlermails von diesem Workflow ausgelöst.
- [x] Veralteten Browser-Test-Selektor für das Startseitenmotiv korrigiert.
- [x] Übrig gebliebene Unicode-Symbole auf der Startseite durch einheitliche SVG-Icons ersetzt.
- [ ] GitHub-Kontobenachrichtigungen werden separat durch die GitHub-Kontoeinstellungen verwaltet; hier nicht verändert.
- [ ] Browser-Smoketests künftig nur nach gezieltem manuellen Start in einer geeigneten Testumgebung durchführen.

## 02.11.2026 – Weitere Planungsfunktionen
- [x] Zweites einmaliges Abwesenheitsfenster und wiederkehrende wöchentliche Abwesenheitszeiten im Backplaner ergänzt.
- [x] Übernacht-Abwesenheiten, die in den Folgetag hineinreichen, im Zeitplan berücksichtigt.
- [x] Neue Abwesenheitsangaben bleiben beim Zurücknavigieren erhalten.
- [x] Zusätzliche automatische Regressionstests für Wochenzeiten und mehrere Sperrfenster ergänzt.
- [ ] Fachliche Gär- und Starterprognosen weiterhin anhand echter Backdaten prüfen; ohne solche Daten keine garantierten Zeitpläne.
- [ ] Echte iPhone-/Safari-End-to-End-Tests, E-Mail-Zustellung, Push bei geschlossener App, Live-KI-Fotoanalyse und rechtliche Freigabe weiterhin offen.

## 02.11.2026 – Stripe-Zahlungen (technisch vorbereitet)
- [x] Stripe Checkout für Monats-/Jahresabos, Kundenportal und serverseitige Statusprüfung integriert
- [x] Webhook-Signaturprüfung, Abgleich der Subscription-Ereignisse und RLS-geschützte Abo-Tabelle eingerichtet
- [x] Bezahlung bleibt standardmäßig deaktiviert, bestehende kostenlose Funktionen bleiben frei
- [x] Setup- und Sicherheitsanleitung in PAYMENTS_SETUP.md dokumentiert
- [ ] Stripe-Geschäftskonto, Preise, Schlüssel, Webhook und Testzahlungen einrichten
- [ ] Monetarisierung und Nutzungsgrenzen der Premium-Funktionen ausdrücklich festlegen; serverseitige Entitlements erst dann durchsetzen
- [ ] Steuer-/Rechtsprüfung, AGB/Datenschutz/Impressum und Widerruf/Kündigung prüfen
- [ ] Echte Testzahlungen, Portal, Rechnungen und Zahlungsfehler auf dem iPhone prüfen
