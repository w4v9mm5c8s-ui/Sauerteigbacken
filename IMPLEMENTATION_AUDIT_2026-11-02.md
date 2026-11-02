# Sauerteig Buddy – Abgleich mit Chat, Screenshots und Lovable (02.11.2026)

**Status:** Eigenständige Entwicklungsfassung, noch keine abgenommene öffentliche Produktversion.

## Technisch umgesetzt
- Eigenständige Node-App auf Render, GitHub und separates Supabase-Projekt, ohne Lovable-Laufzeitabhängigkeit
- Rose-/Beige-Design, konsistentes SVG-Iconset, drei neu gezeichnete wasserfarbenartige Illustrationen (Brot, Starter, Backutensilien)
- Hauptnavigation Start / Backen / Buddy / Konto, mobile Safe-Area-CSS
- 26 Rezeptvorlagen sowie 10 historische Rezeptstände mit originalen Unsicherheiten
- 27 Mehlsorten aus der ursprünglichen PDF-Mehltabelle mit Wasser-/Startervorschlägen
- Sechsteiliger Backplaner: Brotanzahl, Mehle, Rohteig-/geschätztes fertiges Gewicht, Wasser, Salz, Starter, Starterhydrierung, Fütterung, Raum-/Mehl-/Startertemperatur, Gare, Falten, Quellstück, Altbrot, Ofenladungen, Schlafzeiten, Abwesenheit, Backzeit
- Einfache, rezeptgebundene warme und kalte Gare mit Planungsgrenzen; keine universell validierte Zeitprognose
- Backtag mit Vor-/Zurück, mehreren parallelen Sitzungen, Notizen, Temperaturen, Volumenzunahme, Fotos im privaten Supabase-Bucket, Zeitverschiebung
- Timer mit 5/15/30/60-Minuten-Vorlagen, Pause/Fortsetzen, optionalem Wake Lock und Browser-Benachrichtigung bei geöffneter App
- Starterfütterung mit Verhältniswahl, Messprotokoll und medianbasierter persönlicher Reifeprognose nach mindestens drei vergleichbaren Messungen
- Eigene Rezepte: Bearbeiten, Duplizieren, Grammangaben prüfen, Backplan erstellen; Text-/Foto-/HTTPS-Linkimport mit manueller Prüfung
- Favoriten, Einkaufslisten, Mehlvorrat, private Datenexporte und Cloud-Synchronisierung
- Backstatistik: Qualität (Ofentrieb, Krume, Kruste, Geschmack), Hydration, Mehle, Temperaturen, geplante/tatsächliche Garzeiten, Monatsauswertung, CSV
- Community: Einreichung, Moderation, Filter, Merken, Melden und Anzeigenamen; RLS-geschützte Tabellen
- Wissen: 97 Themen, 21 weiterführende Ressourcen, 12 dokumentierte Quellenkonflikte
- Vierstufige Einrichtung beim ersten Login
- Automatisierte Node-Tests und GitHub-Actions-Konfiguration für mobile Chromium-Screenshots

## Nicht abschließend nachgewiesen / offen
- **Echte Ende-zu-Ende-Tests** mit zwei registrierten Konten, Bestätigungsmails, Passwort-Reset, tatsächlichen KI-Anfragen, privaten Foto-Uploads und Löschung
- **Echter iPhone-Safari-Test** und pixelgenauer Abgleich mit den früheren Screenshots. Es gibt eine Chromium-Emulations-Testkonfiguration, aber keine bestätigte reale Geräteabnahme.
- **Zuverlässige Push-Benachrichtigungen bei vollständig geschlossener App.** Die Browser-Benachrichtigung funktioniert nur unter geeigneten Laufzeitbedingungen.
- **Vollständig fachlich validierte Gärprognosen:** Starterreife, Kühlschranktemperatur, Stock-/Stückgare und Ofenladungen müssen praktisch kalibriert werden. Es werden keine garantierten Backergebnisse behauptet.
- **Rechtliche Freigabe:** Impressum, Datenschutz, Betreiberangaben und Auftragsverarbeitung fehlen noch.
- **GitHub-Repositoriesichtbarkeit:** Repository zuletzt öffentlich. Sichtbarkeit kann über den vorhandenen Connector nicht geändert werden.
- **Altbestände:** Migration persönlicher Daten aus Lovable nur nach Backup und ausdrücklicher Freigabe.
- **Original-Aquarell-PNGs:** Nicht übernommen; stattdessen neue, eigenständige SVG-Illustrationen im ähnlichen Stil. Keine Behauptung identischer Originalbilder.
- **Community-Moderation:** Moderator:innenrolle ist technisch vorbereitet, aber es wurde noch kein konkretes Konto freigeschaltet und mit mehreren Accounts getestet.
- **Quellenabgleich:** Die PDF-Textwerte wurden aus dem Lovable-Quellprojekt übernommen; das vollständige Original-PDF liegt in diesem Projekt nicht als Datei vor.

## Produktentscheidungen
- Keine erfundenen Zutaten oder fehlenden Rezeptmengen
- Bei unvollständigen persönlichen Rezepten kein automatisch erfundener Backplan
- Rohteiggewicht und geschätztes fertiges Brotgewicht klar unterscheiden
- Nur echte Messungen in Statistiken und persönlichen Reifeprognosen
- Keine unnötigen technischen Hinweise auf der Startseite
- Kontoabhängige Funktionen nur nach Anmeldung
