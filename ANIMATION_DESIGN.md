# REPAIRROOM – Service in Motion

Entwicklungsbranch: `design/animated-fast-service`, aufgebaut auf `relaunch/phase-1-fast-service`. Keine Änderung des laufenden Servers, von main, gh-pages oder netlify-demo.

## Gestaltung

Eigene vektorbasierte Werkstattszene in leicht räumlicher Perspektive: reduzierte Fahrzeugflächen, erwachsene Körperproportionen, neutrale gesichtslose Köpfe, wenige matte Abstufungen. Anthrazit (#171d1b), warme helle Fahrzeug-/Figurenflächen und gedämpftes Electric Lime (#d6ef6e). Das bestehende Logo erscheint in der dunklen Startseiten-Navigation monochrom; Originaldatei bleibt unverändert. Neue Startseite verwendet keine Werkstattfotografie, kein Video und keine fremden Figuren/Cliparts.

Die konkreten früheren SHOWROOM-Animationen liegen in diesem Projekt nicht vor. Stil auf Basis der Nutzerbeschreibung eigenständig umgesetzt, keine originalgetreue Übernahme oder Prüfung dieser Animationen behauptet.

## Tatsächlich animiert

- Hero: 16-Sekunden-Loop mit Anfahrt, Ruhephase für den Service und Abfahrt. Startversatz zeigt das Fahrzeug bereits beim ersten Bild.
- Service: Fahrzeug hebt sich leicht, der Arm der Figur bewegt sich, eine reduzierte Öltropfen-/Servicesymbolik wird eingeblendet. Kein echtes Wartezeitversprechen.
- Karten: leichte Figurenbewegung bei Hover und Tastaturfokus auf den Servicekarten; Ablaufkarten bei Hover. Individuelle Details für Öl, Glasschaden, Bremse, Reifen, Prüfliste, Klimaservice, Diagnose, Reparatur und Aufbereitung.
- Pause-Taste stoppt sämtliche Hero-Animationen; Zustand ist per aria-pressed erkennbar. IntersectionObserver pausiert die Hero-Szene außerhalb des sichtbaren Bereichs.
- `prefers-reduced-motion: reduce`: alle Animationen/Transitions der Startseite aus; Fahrzeug und Service bleiben als vollständige statische Szene sichtbar, Pause-Taste entfällt.

SVGs werden als HTML servergerendert; CSS animiert Transformation/Deckkraft. Keine neue Abhängigkeit, kein Canvas/WebGL, keine Video-/GIF-Datei, keine externen Animationsdienste. Ein kleiner Client-Wrapper steuert Pause und Sichtbarkeit. Keine scrollblockierenden oder bildschirmfüllenden Effekte.

## Nutzerführung und Funktionsgrenzen

Ölwechselpreis berechnen → vorhandene Fahrzeugauswahl und Buchungsdemo. Zweite Aktion „Jetzt Termin buchen“ führt ebenfalls in den vorhandenen Buchungsablauf und übernimmt eine bereits gewählte Fahrzeugauswahl. Demo-Hinweise stehen im Banner, Fahrzeugformular, Ablauf und FAQ. Der Vier-Schritte-Bereich erklärt Fahrzeug → Preis → Termin → Vorbeikommen; Zahlung bleibt ausdrücklich simuliert.

Bestehende Testpreise/Verfügbarkeit, Checkout, Reservierungsablauf und Stornierung unverändert. Weitere Leistungen führen zu erklärenden Leistungsentwürfen, nicht zu vorgetäuschten Anfrageformularen. Zusätzliche Aufbereitung bleibt als neunte vorhandene Leistung erhalten.

## Prüfung

Typecheck, normaler Next-Build und isolierter Browser-Export. Playwright Desktop und Pixel 7: komplette Buchung, Rücknavigation, Countdown, Ablauf, Stornierung, alle Serviceseiten, sichtbarer Ersteinstieg, Pause/Fortsetzen und reduzierte Bewegung. PostgreSQL-Integration und beide vorhandenen Server-Speicherpfade separat geprüft. Screenshots frieren die tatsächlichen Animationen für reproduzierbare Ansichten in der Servicephase ein; dies verändert den ausgelieferten Loop nicht.

Keine gemessene Zusage zu Core Web Vitals, Akkulaufzeit, Safari oder realer Geräteleistung. Diese Prüfungen folgen auf dem gewählten Zielhosting und echten Geräten.

## Nächste Ergänzungen

1. Frühere SHOWROOM-Animationsreferenz bei Verfügbarkeit visuell abgleichen, Figurenproportionen und Bewegungsrhythmus fein abstimmen.
2. Serviceillustrationen um eigene Szenen je Leistung erweitern, z. B. Scheibentausch und Räderwechsel. Die aktuelle gemeinsame Bildsprache ist implementiert, aufwendige einzelne Reparaturabläufe noch nicht.
3. Animationen auf iPhone/Safari und Android-Geräten, Low-End-Leistung, Tastatur und Screenreader prüfen. Nach Bedarf Szene weiter vereinfachen.
4. Nach Freigabe auf die Testumgebung übertragen. Echte Fahrzeugidentifikation, Preise, Termine und Zahlung bleiben die getrennte Integrationsphase gemäß RELAUNCH_PHASE1.md.
