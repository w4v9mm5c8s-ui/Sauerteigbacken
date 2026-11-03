# Ergänzte Inhalte und Funktionen

## Funktionsumfang
| Bereich | Umsetzung | Zugang |
|---|---|---|
| Backtag-Push | Kommende aktive Schritte planen; bei Verspätung neu planen; erledigte/abgebrochene Schritte entfernen | Backtag → An alle kommenden Arbeitsschritte erinnern |
| Starter | Wiederkehrende Fütterung nach Stundenintervall und einmalige Reifeprüfung; Erinnerungsliste mit Entfernen | Meine Starter → Erinnerungen |
| Lernbilder | 28 schrittspezifische beschriftete SVG-Darstellungen für sieben Lektionen | PDF-Backwissen → Interaktiv üben |
| PDF-Vorgaben | Eigene Mengen, Hydration, Gar-/Back-/Quellzeiten pro Rezept speichern und beim Planen wieder laden | Planer → Als eigene Rezeptvorgaben speichern |
| Community | Übernehmen, fehlende Angaben prüfen, als eigenes Rezept speichern und skalierbar planen | Community-Rezept → Übernehmen und planen |
| Vorrat | Mengen bearbeiten, Bedarf abgleichen, Fehlmengen einkaufen; einmalige bestätigte Verbrauchsbuchung pro Backtag | Rezept bzw. Backtag → Vorrat prüfen |
| KI-Gespräch | Letzte 80 Textnachrichten kontobezogen speichern; letzte zwölf Nachrichten als Kontext; Gespräch löschbar | Buddy |
| Cloud-Konflikt | Je geändertem Bereich lokalen oder Cloud-Stand wählen; vorher beide Versionen sichern und exportieren; Revisionsprüfung bleibt aktiv | Ich → Cloud-Konflikt vergleichen |

## Grenzen
- Erinnerungen müssen auf dem jeweiligen Gerät mit aktivierter Push-Berechtigung eingerichtet werden. Stundenintervalle sind verstrichene Stunden, keine festen lokalen Uhrzeiten. Maximale erste Vorausplanung 366 Tage, maximal 500 offene Jobs pro Konto. Tatsächliche iPhone-Zustellung ist nicht nachgewiesen.
- Vorratsabgleich nutzt gleiche bzw. kanonische Zutatenbezeichnungen; keine automatische Austauschbarkeit verschiedener Mehle. Wasser und reifer Starter werden separat bereitgestellt. Verbrauch wird nur nach Bestätigung und nur einmal pro Backtag gebucht.
- Community-Textrezepte werden nicht durch erfundene Mengen oder Zeiten ergänzt. Übernahme führt deshalb zunächst zur bearbeitbaren Rezeptvorlage.
- Eigene PDF-Vorgaben schließen Eingabelücken für spätere Backtage; sie sind keine nachträglich erfundenen Originalwerte.
- Lernbilder sind beschriftete schematische Zeichnungen, keine Fotos oder validierten Backversuche.
- Cloud-Auswahl kombiniert ganze Bereiche, nicht widersprüchliche Einzelobjekte innerhalb eines Bereichs. Beide Ausgangsversionen bleiben als lokale Konfliktsicherung exportierbar.
- Stripe-Abwicklung ist vorbereitet, echte Zahlungen bleiben deaktiviert. Erneute Kontoabfrage zeigte nur Sandbox; Live-Konto und freigegebene Monats-/Jahrespreise fehlen.

## Prüfung
228 automatisierte Tests bestanden. Neue Tests prüfen Vorratsdubletten, Fehlmengen ohne Doppelzählung, fehlende Mengen, Konfliktauswahl, gespeicherte Chatdarstellung, 28 unterschiedliche Lernbilder sowie die Filterung von aktiven/fertigen/vergangenen Backschritten.
Live-Datenbanktransaktion: Erinnerung sieben Tage voraus mit 24-Stunden-Wiederholung angelegt; Fremdzugriff und fremdes Planen abgewiesen; alle Testdaten zurückgerollt. Edge-Push-Worker Version 2 aktiv.
Supabase Advisor weist auf die bewusst besitzgeprüften SECURITY-DEFINER-RPCs und die weiterhin deaktivierte Prüfung kompromittierter Passwörter hin.
