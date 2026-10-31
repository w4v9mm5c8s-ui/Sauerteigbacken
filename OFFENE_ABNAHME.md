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
- [ ] Kühlschrankgare korrekt als rezeptabhängige Option in der automatischen Terminplanung; keine willkürlichen Gärzeiten
- [ ] Abwesenheiten und wiederkehrende Schlafzeiten vollständig als harte Planungsgrenzen berücksichtigen
- [ ] Tatsächliche Starter-Reife anhand Temperatur, Fütterung und dokumentierter Beobachtungen kalibrieren; 9 Stunden ist bisher nur ein grober Platzhalter
- [ ] Eigene Rezepte vollständig in Mengenrechner und Backplaner integrieren, ohne fehlende Werte zu erfinden
- [ ] Import per Rezept-Weblink mit sicherem URL-Abruf und manueller Freigabe
- [ ] Importierte Rezeptfotos mit realen Geräten und wechselnden Bildformaten testen
- [ ] Community-Moderator:in nach Registrierung explizit freischalten; Prüf- und Freigabeworkflow mit zwei Konten testen
- [ ] Alle 26 Rezeptvorlagen praktisch/fachlich validieren; keine Behauptung, sie seien testgebacken
- [ ] Original-PDF und gesamte Screenshot-Anforderungsliste erneut abgleichen, sofern die Quelldateien verfügbar sind
- [ ] Migration bestehender Lovable-Daten nur nach ausdrücklicher Freigabe und mit Backup
- [ ] Backtag: echte Zeiterfassung, Timer-Interaktion und dynamische Umplanung bei Abweichungen
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
