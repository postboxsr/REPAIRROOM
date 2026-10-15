# REPAIRROOM – Service in Motion

Entwicklungsbranch: `design/animated-fast-service`, aufgebaut auf `relaunch/phase-1-fast-service`. Keine Änderung des laufenden Servers, von main, gh-pages oder netlify-demo.

## Gestaltung

Eigene vektorbasierte Werkstattszene in leicht räumlicher Perspektive: reduzierte Fahrzeugflächen, erwachsene Körperproportionen, neutrale gesichtslose Köpfe, wenige matte Abstufungen. Anthrazit (#171d1b), warme helle Fahrzeug-/Figurenflächen und gedämpftes Electric Lime (#d6ef6e). Das bestehende Logo erscheint in der dunklen Startseiten-Navigation monochrom; Originaldatei bleibt unverändert. Neue Startseite verwendet keine Werkstattfotografie, kein Video und keine fremden Figuren/Cliparts.

Die konkreten früheren SHOWROOM-Animationen liegen in diesem Projekt nicht vor. Stil auf Basis der Nutzerbeschreibung eigenständig umgesetzt, keine originalgetreue Übernahme oder Prüfung dieser Animationen behauptet.

## Tatsächlich animiert

- Hero: 16-Sekunden-Loop mit Anfahrt, Ruhephase für den Service und Abfahrt. Startversatz zeigt das Fahrzeug bereits beim ersten Bild.
- Service: Fahrzeug hebt sich leicht, der Arm der Figur bewegt sich, eine reduzierte Öltropfen-/Servicesymbolik wird eingeblendet. Kein echtes Wartezeitversprechen.
- Servicekarten: eigene Szenen für Ölwechsel auf der Hebevorrichtung, Scheibentausch mit Sauggriff, Bremse bei abgenommenem Rad, Räderwechsel, Inspektion am offenen Motorraum, Klimastation mit Schläuchen, Diagnosewagen, Reparatur mit Werkstattkran und Aufbereitung. Ruhige Arm-/Werkzeug-/Bauteilbewegungen bei Hover und Tastaturfokus. Keine automatische Daueranimation aller Kacheln.
- Vier Ablaufmotive: Fahrzeug am Auswahlbildschirm, Preisprüfung mit Rechner, Terminkalender und Abfahrt. Kalenderauswahl und Abfahrt reagieren mit dezenter Bewegung auf Hover.
- Pause-Taste stoppt sämtliche Hero-Animationen; Zustand ist per aria-pressed erkennbar. IntersectionObserver pausiert die Hero-Szene außerhalb des sichtbaren Bereichs; im Hintergrund liegende Browser-Tabs pausieren über die Page Visibility API ebenfalls. Die manuelle Pause bleibt davon unabhängig.
- `prefers-reduced-motion: reduce`: alle Animationen/Transitions der Startseite aus; Fahrzeug und Service bleiben als vollständige statische Szene sichtbar, Pause-Taste entfällt.

SVGs werden als HTML servergerendert; CSS animiert Transformation/Deckkraft. Keine neue Abhängigkeit, kein Canvas/WebGL, keine Video-/GIF-Datei, keine externen Animationsdienste. Ein kleiner Client-Wrapper steuert Pause und Sichtbarkeit; falls IntersectionObserver nicht verfügbar ist, bleiben manuelle Pause und Tab-Sichtbarkeit funktionsfähig. Gemeinsame Vektorbausteine für Auto, Rad, Figur und Tablet vermeiden separate Bilddownloads. Keine scrollblockierenden oder bildschirmfüllenden Effekte.

## Nutzerführung und Funktionsgrenzen

Ölwechselpreis berechnen → vorhandene Fahrzeugauswahl und Buchungsdemo. Zweite Aktion „Jetzt Termin buchen“ führt ebenfalls in den vorhandenen Buchungsablauf und übernimmt eine bereits gewählte Fahrzeugauswahl. Demo-Hinweise stehen im Banner, Fahrzeugformular, Ablauf und FAQ. Der Vier-Schritte-Bereich erklärt Fahrzeug → Preis → Termin → Vorbeikommen; Zahlung bleibt ausdrücklich simuliert.

Bestehende Testpreise/Verfügbarkeit, Checkout, Reservierungsablauf und Stornierung unverändert. Weitere Leistungen führen zu erklärenden Leistungsentwürfen im passenden dunklen Illustrationsdesign. Jede Detailseite hat eine eigene Serviceszene und einen klaren Rückweg. Ölwechsel führt in die echte Demo; andere Leistungen zur Übersicht, ohne vorgetäuschte Anfrageformulare. Zusätzliche Aufbereitung bleibt als neunte vorhandene Leistung erhalten.

## Prüfung

Typecheck, normaler Next-Build und isolierter Browser-Export. Playwright Desktop und Pixel 7: komplette Buchung, Rücknavigation, Countdown, Ablauf, Stornierung, alle Serviceseiten, sichtbarer Ersteinstieg, Pause/Fortsetzen und reduzierte Bewegung. PostgreSQL-Integration und beide vorhandenen Server-Speicherpfade separat geprüft. Screenshots frieren die tatsächlichen Animationen für reproduzierbare Ansichten in der Servicephase ein; dies verändert den ausgelieferten Loop nicht.

Keine gemessene Zusage zu Core Web Vitals, Akkulaufzeit, Safari oder realer Geräteleistung. Diese Prüfungen folgen auf dem gewählten Zielhosting und echten Geräten.

## Zweite Ausbaustufe – Prüfung und Vorschau

- 30 statische Browserprüfungen bestanden; dazu 10 File-Demo-, 10 PostgreSQL-UI/API- und 16 Datenbanktests (66 insgesamt). Typecheck und beide Builds erfolgreich.
- Zusätzliche Viewports: 320×740, 375×812, 414×896, 768×1024 und 1440×900. Startseite und Terminkalender ohne horizontalen Überlauf geprüft.
- Tastatur: Pause per Leertaste, Fokuswechsel auf erste Servicekarte, Bewegung bei Tastaturfokus, Abschalten bei reduzierter Bewegung und Navigation per Enter.
- Automatisches Pausieren beim Scrollen zum Footer und Fortsetzen bei Rückkehr zur Szene geprüft. Tab-Sichtbarkeit ist implementiert, kein echter Hintergrundtab-/Gerätetest behauptet.
- Illustrierte Autoglas-Detailseite samt wahrheitsgemäßem Funktionshinweis, Rückweg und Ölwechsel-Buchungsaktion geprüft.
- Ein erster Testlauf brach ab, weil der alte Test den dritten Slot des heutigen Tages voraussetzte, obwohl später am Tag nur noch zwei Testzeiten verfügbar waren. Die Buchungstests wählen nun einen späteren verfügbaren Tag. Kein Produktkalender, Preis oder Termin wurde dafür verändert. Danach alle Prüfungen erfolgreich.
- Screenshots in `review/motion-v2/`: vollständige Desktop-/Mobile-Startseite, Servicekarten, Buchungsschritte und Autoglas-Detailseite. Die 320-Pixel- und Tablet-Ansichten liegen zusätzlich bei. Keine Abbildungen echter Werkstattarbeit.

## Nächste Ergänzungen

1. Frühere SHOWROOM-Animationsreferenz bei Verfügbarkeit visuell abgleichen, Figurenproportionen und Bewegungsrhythmus fein abstimmen.
2. Animationen auf echten iPhone-/Safari- und Android-Geräten prüfen; WebKit ist in dieser Umgebung nicht installiert. Responsive Chromium-Tests sind keine Safari-/Hardwaretests.
3. Buchungs- und Verwaltungsseiten gestalterisch mit der neuen dunklen Illustrationswelt abstimmen; die bestehende, funktionierende Demologik dabei erhalten.
4. Nach Freigabe auf die Testumgebung übertragen. Echte Fahrzeugidentifikation, Preise, Termine und Zahlung bleiben die getrennte Integrationsphase gemäß RELAUNCH_PHASE1.md.

### Ansichten der zweiten Ausbaustufe

- [Desktop-Startseite](review/motion-v2/desktop.png)
- [Smartphone-Startseite](review/motion-v2/mobile.png)
- [Neun Serviceszenen](review/motion-v2/services-desktop.png)
- [Services auf dem Smartphone](review/motion-v2/services-mobile.png)
- [Vier Buchungsschritte](review/motion-v2/booking-steps.png)
- [Autoglas-Detailseite](review/motion-v2/autoglas-desktop.png)
- [Autoglas mobil](review/motion-v2/autoglas-mobile.png)
- [320-Pixel-Erstansicht](review/motion-v2/phone-320.png)
- [Tablet-Erstansicht](review/motion-v2/tablet-768.png)
