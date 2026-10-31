# Backen mit Sauerteig – eigenständiger Neuaufbau

Eigenständige Node-Web-App ohne Lovable. GitHub, Render und Supabase sind von Bondpop und Zwischen uns getrennt.

## Aktueller Stand
- 26 Sauerteig-Rezeptvorlagen aus dem bisherigen Projekt mit Zutaten und Anleitungen
- Mobile Rezeptsuche, Zutaten, Mengenfaktor, einfacher Backplan mit Sperrzeiten
- Einkaufsliste, Starterübersicht, Cloud-Sicherung, Community-Einreichung
- OpenAI Responses API für Fragen und Rezeptfotos als serverseitige optionale Integration
- Supabase Auth für Konten; getrennte Daten über RLS
- HTTPS über Render

## Noch NICHT als fertig bestätigt
- Live-Anmeldung mit Bestätigungsmail und Passwort-Reset (Supabase Site URL / Redirect-URLs konfigurieren)
- OpenAI: OPENAI_API_KEY als Server-Secret setzen, danach echte Testanfragen
- Visuelle Prüfung auf iPhone/Safari, Accessibility, Fehlermeldungen
- Backplaner: Die Starter-Reife (9 h), Vorheizdauer (45 min) und Gärzeiten sind Schätzungen, nicht für jedes Rezept validiert. Kühlschrankgare ist noch nicht voll integriert. Ein automatisch berechneter Plan ist keine Garantie für Backerfolg.
- Community-Moderation und Meldungen
- Datenmigration aus der alten Lovable-App, rechtliche Texte, Export/Löschung und Datenschutzprüfung
- Vollständiger Abgleich mit allen Screenshotwünschen, eigene Rezeptverwaltung und Fotobuch-Import

## Server-Konfiguration
- SUPABASE_URL (öffentliche Projekt-URL)
- SUPABASE_PUBLISHABLE_KEY (öffentlicher Publishable Key)
- OPENAI_API_KEY (geheimes Server-Secret, NIEMALS ins Repository)
- OPENAI_MODEL (optional, Standard gpt-5-mini)

Die App ist nicht als produktionsfertig freigegeben. Alle KI-Funktionen erfordern Anmeldung und explizite Einwilligung vor der Übertragung.
