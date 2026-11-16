# Sauerteig-App · Funktionsprüfung am 16. November 2026

Ausgangsstand 597bcaf. Geprüft wurden der veröffentlichte Dienst und die aktuelle Anwendung im Repository. Die automatisierten Tests enthalten sowohl Verhaltenstests als auch Prüfungen von Oberflächenstruktur und Quelltext.

| Bereich | Ergebnis | Grenze |
|---|---|---|
| Start, Navigation, Rezeptbibliothek, Wissen, Ressourcen | Startseite, Manifest, Service Worker und vier Datenkataloge live mit HTTP 200 abgerufen. Vorhandene Tests für Navigation, Offline-Dateiliste und Bilder bestanden. | Kein neuer Offline-Test auf einem physischen Gerät. |
| Rezeptwahl und Backplan | Alle 26 Grundrezepte und 9 PDF-Vorlagen vom gerenderten Formular über die Mengenberechnung bis zum letzten Auskühlschritt geprüft, mit reifem Starter und ohne Sperrfenster. Separate Tests prüfen Schlafzeiten, Abwesenheiten und Überschneidungen. | Gärzeiten und Backergebnis brauchen praktische Backversuche. |
| Mengen, Vorstufen und Rezepteditor | Ungültige Zielgewichte sowie unvollständige zusätzliche Quellstücke werden abgefangen. Die gewählte halbe oder doppelte Rezeptmenge wird in den Plan übernommen. Ein Vollkornstarter wird als Starter erkannt, Blechöl wird dem Formen zugeordnet. | Prozentangabe bezieht sich auf Rezeptwasser einschließlich Starter. Andere Flüssigkeiten wie Milch sind separat ausgewiesen. |
| Backtag, Timer und Erinnerungen | Abschluss prüft offene aktive Arbeitsschritte. Parallelplanung und Schritterinnerungen berücksichtigen Erledigungszeiten. Nachtsperren über Mitternacht beginnen am richtigen Wochentag. Originalanleitung im Backtag verfügbar. | Kein physischer iPhone-Test bei gesperrtem Display. Spezialtechniken aus den Anleitungen sind nicht durchgängig eigene Timer-Schritte. |
| Einkauf und Vorräte | Ergänzungen landen in offenen Einkaufspositionen. Fehlende Mengen werden beim Übertragen gemeldet. Tests für Skalierung, fehlende Vorräte, mehrfaches Buchen und parallele Backtage bestanden. | Keine neue Live-Buchung in einem persönlichen Vorrat. |
| Community | Fehlende Eingaben für die Rezepteinreichung und Filter ergänzt. Rezepte ohne bekannte Dauer oder Hydration passieren die jeweiligen Obergrenzen nicht mehr. Öffentliche Lese-API live mit HTTP 200 geprüft. | Kein neuer Live-Durchlauf mit zwei Konten von Einreichung bis Moderationsentscheidung. |
| Konto, Backup und Cloud | Geschützte Synchronisations- und Moderationsendpunkte antworteten ohne Anmeldung mit 401. Tests für Sitzungserneuerung, Kontowechsel, Konflikte und Import bestanden. Ungültige Listeneinträge werden abgewiesen, ein ungültiger Schrittindex beim Wiederherstellen korrigiert. | Echte E-Mail-Zustellung und vollständiger Zwei-Geräte-Abgleich wurden in diesem Durchlauf nicht geprüft. |
| Statistik, Archiv und Export | Dokumentierte Dauer wird aus erstem und letztem abgehakten Schritt berechnet. Die Stückgare erkennt auch den Einschießschritt des PDF-Ofenprogramms. Bestehende Statistik- und Exporttests bestanden. | Alte Einträge ohne dokumentierte Zeiten wurden nicht rückwirkend geschätzt. |
| KI, Fotos und Zahlung | Tests für Fotozugriff, Kontowechsel, Gesprächsspeicherung und Zahlungslogik bestanden. Für den Fotovergleich liegt ein früherer Live-Test mit Testkonto und synthetischen Bildern vor. | Keine fachliche Bewertung echter Teigfotos, keine Live-Zahlung. |

Weiterhin fehlen unter anderem öffentliche Autor:innenprofile, ein Abgleich einzelner Datensätze bei Cloud-Konflikten, im eigenen Rezept speicherbare Koch- und Brühstücke, ein mit Messdaten kalibrierter Wassertemperaturrechner und die dynamische Neuplanung aller Phasen. Zusätzlich offen sind der unabhängige Faktencheck aller FAQ und Quellen sowie die Geräte-, E-Mail- und Zahlungsabnahme. Details siehe [PDF-Abgleich](PDF_ACCEPTANCE_CURRENT.md).

### Nachprüfung am selben Tag

- Eigene Rezepte speichern Koch-/Brühstück mit Gesamtmengen und Abkühlzeit bis in den Backplan. Der Wasserrechner übernimmt optional fünf Temperaturmessungen eines Vergleichsbacktags (empirischer Knetfaktor).
- Öffentliche Backprofile zeigen freigegebene Rezepte desselben Kontos unter demselben Anzeigenamen. Moderationsentscheidungen gelten nur für noch offene Einreichungen.
- Bei Cloud-Konflikten können eindeutig zuordenbare Listenpositionen einzeln gewählt werden, einschließlich bewusster Löschungen. Bei mehrdeutigen Altdaten bleibt die Bereichsauswahl.
- Zusätzliche Arbeitsfenster für Bagels, Pizza und Focaccia, Formanweisung für Zimtschnecken. Pizza erhält Kaltreife und anschließende warme Temperierzeit. Weitere Phasengrenzen lösen die verbleibende Zeitverschiebung aus. Frei verknüpfbare Abhängigkeiten für beliebige eigene Rezepte sind weiter offen.
- Sechs Wissenskarten haben externe Quellen zu konkreten Aussagen erhalten. Der unabhängige Gesamtcheck aller 97 Einträge und der physische Geräte- und Backversuch stehen weiter aus.
