# Funktionsabgleich mit backenmitsauerteig.lovable.app (02.11.2026)

Ziel: Eigenständige App auf Render, **ohne Lovable-Abhängigkeit**, mit gleicher Informationsarchitektur und möglichst ähnlichem Design.

## Navigation
- [x] Vier Hauptreiter: Start, Backen, Buddy, Konto
- [x] Start: Hauptaktion Brot planen, Backtag, Problem lösen, Buddy, Direktzugriffe
- [x] Backen: Neues Brot planen, Meine Rezepte, Rezeptbibliothek, Community, Import, Meine Brote, Statistik, Rechner
- [x] Konto: Starter, Mehle & Vorrat, Einkaufsliste, Wissen, Cloud-Sicherung, Export, Kontolöschung
- [x] Designsystem: Creme, Terrakotta, warme Karten, Fraunces/Outfit, mobile Bottom-Navigation
- [ ] Original-Aquarellgrafiken und Pixelabgleich auf iPhone

## Funktionalität – nicht mit sichtbaren Reitern verwechseln
- [x] 26 Startrezepte, Zutaten und einfache Schritte
- [x] Mengenrechner, Hydration und Starterfütterung
- [x] Starter- und Mehlvorrat-Basisfunktionen
- [x] Private eigene Rezepte, Foto-/Textimport zur Bearbeitung
- [x] Community-Rezepte einreichen, Moderation technisch vorbereitet
- [x] Backtag-Schritte, Zurück, persistenter aktueller Schritt
- [x] Grundlegende Statistik aus Backhistorie
- [x] Kurze Wissenskarten und Problem-zu-Buddy-Weiterleitung
- [ ] Vollständige Rezeptverwaltung inklusive editierbarer Mengen, Backpläne für eigene Rezepte und Favoriten
- [ ] Backstatistik mit Qualitätsbewertungen, Mehlen, Hydration und tatsächlichen Garzeiten
- [ ] Rezeptimport per URL und sichere Extraktion; Bilder vollständig praktisch prüfen
- [ ] Community: Favoriten, Autor:innenprofile, Meldungen und Moderationsrollen im echten Betrieb prüfen
- [ ] Umfangreiche Wissensbibliothek mit Quellen und Korrekturmeldungen
- [ ] Mehrere parallele Backtage, echte Timer, Fotos, dynamische Umplanung
- [ ] Fachlich validierte Kühlschrankgare für weitere Rezepte
- [ ] Benutzerführung beim ersten Login und iPhone-Safari-Endtest
- [ ] Supabase E-Mail-Zustellung, Bestätigung und Reset mit realen Accounts verifizieren
- [ ] Datenschutz, Impressum und Veröffentlichungsfreigabe

**Wichtig:** Vorhandene Seiten oder Menüpunkte bedeuten nicht automatisch, dass die vollständige Funktionalität des Lovable-Vorbilds übernommen ist.

## Rose-Beige-Überarbeitung (02.11.2026)
- [x] Terrakotta durch abgestimmte Rose-/Beige-Palette ersetzt (inkl. App-Icon und Installationsfarben)
- [x] Einheitliches SVG-Liniensymbolsystem für Hauptnavigation, Backen-Hub, Startseite und Direktzugriffe
- [x] Favoriten für Bibliotheksrezepte, sichtbar auf der Startseite (angemeldet)
- [x] Backhistorie mit 1–5-Bewertung und echten Monats-/Durchschnittsstatistiken
- [x] Mehrere parallele Backtage mit getrenntem Fortschritt und Wechselmöglichkeit
- [x] Persistente Countdown-Timer pro Backtag und Arbeitsschritt (ohne garantierte Hintergrund-Benachrichtigungen)
- [ ] Echte iPhone-Layoutkontrolle, Detailabgleich mit Originalgrafiken und Test der Timer bei gesperrtem Bildschirm
- [ ] Erweiterte Statistik nach Mehlen, Hydration und Garzeiten (hierfür fehlen noch strukturierte Messwerte)
- [ ] Rezeptimport über URL (sichere Abruf- und Quellenprüfung fehlt)
