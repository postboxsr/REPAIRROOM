# REPAIRROOM – Projektstatus
Stand: 14.10.2026. Etappe 2: transaktionale PostgreSQL-Entwicklungsgrundlage. Keine produktive Veröffentlichung, keine Livebuchungen.

## Implementiert
- Bestehende Next.js-/TypeScript-Anwendung mit Startseite, vier Leistungseiten, Gastbuchung, Bestätigung/Verwaltung, Stationsentwurf, Kontakt und Rechtsentwürfen bleibt erhalten.
- Premium-Designgrundlage mit responsiven Formularen, Systemschriften und lokalem KI-Werkstattdetail. Wortmarke ist ein Entwurf; SHOWROOM-Rasterreferenz liegt im Chat vor; Original-Vektordatei und Schrift fehlen.
- Laufendes lokales PostgreSQL 17.11 mit verifiziertem und auf Digest gepinntem offiziellen Docker-Image; nur Loopback-Port 55432, eigener Container und eigenes Datenvolume.
- Getrennte Demo- und Testdatenbanken, Schema ausdrücklich nur demo/test, ohne Live-Daten. Keine Nutzung von SHOWROOM-/Dealerwerk-Infrastruktur.
- Versionierte SQL-Migrationen mit Transaktion, Checksum und Migrationssperre; wiederholbarer nichtdestruktiver Demo-Seed.
- Angebote, fahrzeuggeeignete Fenster, Buchungen, Zahlungsreservierungen von bis zu zehn Minuten und Auditereignisse.
- Serverseitiger Preis-/Fahrzeug-Snapshot, feste Sperrreihenfolge, Unique-Index für aktive Buchungen, Ausschluss überlappender Stationsfenster.
- Ablaufprüfung anhand der Datenbankuhr, auch nach Sperrwartezeiten; sichere Freigabe abgelaufener Holds.
- Idempotente simulierte Zahlungsereignisse mit Betrag-/Währungs-/Zuordnungsprüfung und transaktionalem Rollback bei Konflikten. Keine echte Providerintegration.
- Verwaltung per zufälligem 256-Bit-Token, Speicherung ausschließlich als Hash; idempotente Stornierung, kein Wiederbeleben alter Buchungen.
- PostgreSQL-Demo über REPAIRROOM_DEMO_STORAGE=postgres an der bestehenden Oberfläche nutzbar. Dateidemo bleibt separat; alte Links/Daten werden nicht automatisch migriert. Kein stiller Fallback bei Datenbankfehler.
- Eigene npm-Kommandos für Datenbankstart, Migration, Seed und Prüfungen. Lokale Zugangskonfiguration wird ignoriert, Werte werden nicht ausgegeben.

## Verifiziert
- 15/16 echte PostgreSQL-Integrationstests bestanden, 0 übersprungen: einschließlich 20 konkurrierender Reservierungen, zeitlichem Ablauf während Sperrwartezeit, überlappender Kapazität, Preis-/Währungsprüfung, Simulationsereignissen und Stornierungsrennen.
- 6/6 Desktop-/Mobile-Oberflächentests mit PostgreSQL bestanden; bestehende Dateidemo ebenfalls 6/6 bestanden.
- npm run db:prepare zweimal erfolgreich; Migrationen und Seed erhalten vorhandene Reservierungen.
- Echte bestätigte Demo-Buchung vor PostgreSQL-Stopp angelegt; nach Neustart erfolgreich wiedergefunden und storniert. Kein Datenverlust beim geprüften lokalen Neustart.
- Lockfile-Installation, Typecheck und Next.js-Produktionsbuild erfolgreich.
- PostgreSQL-Port laut Docker ausschließlich 127.0.0.1:55432. Ungültige externe/live Testdatenbank-Konfiguration wird vor Verbindung abgelehnt. DATABASE_URL wird nicht verwendet.
- Desktop-/Mobile-Screenshots geprüft. Keine vollständige Barrierefreiheitsprüfung, keine echten Mobilgeräte-/Safari-Tests.

## Offen / Grenzen
- Keine Wiederherstellung der externen Docker-Volume-Daten in einer neuen Cloud-Aufgabe verifiziert. db:prepare kann neue Demo-/Testdatenbanken anlegen, garantiert keine alten Buchungen aus einem Snapshot.
- Datenbankbenutzer ist lokal für Entwicklung und Migrationen privilegiert; eingeschränkter Live-Anwendungsnutzer, Backup-/Restore-Konzept und Löschfristen fehlen.
- Die Oberfläche reserviert beim Einstieg in die Demo-Zahlung; Countdown und Wiederaufnahme sind implementiert. Echter Anbieter-Checkout und signierte Rückmeldungen fehlen weiterhin.
- Keine signierten Zahlungsanbieter-Webhooks, kein realer Geldfluss, keine Erstattung, keine E-Mail. Keine personenbezogenen Kundendaten notwendig.
- Realer Fahrzeugdatenanbieter inklusive Lizenz, Ölfreigaben, reale Preiskalkulation und Stationskapazität fehlen.
- Original-Vektordatei/Schrift des SHOWROOM-Logos und finale eigene/lizenzierte Fotos, bestätigte Betreiberangaben, Standort, Öffnungszeiten, Kontakt und juristische Prüfung fehlen.
- Geschützter Personalzugang, Rollen, Auditverwaltung und operativer Stationsworkflow noch offen. /station enthält ausschließlich ein öffentliches Konzept, keine Buchungsdaten.
- Eigene Anfrage- und Uploadabläufe für Autoglas, Unfall und Aufbereitung noch nicht angebunden.
- Dateidemo bleibt nur ein lokaler Demonstrationsspeicher und darf nicht für Mehrinstanz-Livebetrieb verwendet werden.

## Nächster technisch sinnvoller Schritt
Eine ausdrücklich konfigurierte Payment-Sandbox mit geprüften Anbieterereignissen und E-Mail-Outbox integrieren; der Demo-Checkout mit Frist und Wiederaufnahme ist umgesetzt. Fahrzeugdaten und reale Preise erst nach Anbieter-/Lizenzentscheidung anschließen. Keine Livefreigabe ohne betriebliche und rechtliche Bestätigung.

Keine bezahlten Dienste, Domainregistrierung oder produktive Veröffentlichung durchgeführt. Ein lokaler Commit ist für die Quellcodeübergabe vorbereitet; Quellcode auf main hochgeladen. install_script und start_skill wurden erfolgreich im Cloud-Konfigurationsentwurf um PostgreSQL-Vorbereitung, sichere Neustartregeln und Start ergänzt; Veröffentlichung und neue Snapshot-Wiederherstellung sind separate, noch nicht verifizierte Schritte.

Abschließende Prüfung: 16 Datenbanktests sowie je 6 Browserprüfungen mit PostgreSQL und Dateispeicher bestanden (28 gesamt). Frisch gestartete PostgreSQL-Demo auf Port 3000 zusätzlich über HTTP vollständig gebucht, verwaltet und storniert; serverseitiger Testpreis trotz abweichendem Browserpreis geprüft. Installations- und Startkonfiguration erfolgreich gespeichert.

Mac-Übergabe: MAC_START.md ergänzt und Quellcodepaket ohne lokale Zugangsdaten, Buchungen oder Linux-Abhängigkeiten vorbereitet. Node.js/npm sind auf dem Mac separat zu installieren. Intel-/Apple-Silicon-Paketunterstützung und PostgreSQL-Multiarch-Image geprüft; noch keine Ausführung auf dem tatsächlichen Mac verifiziert.

Die Chat-Oberfläche unterstützt den angebotenen Artefakt-Download nicht. MAC_START.md beschreibt daher die Bereitstellung über GitHub und Code → Download ZIP. Upload der 40 geprüften Quellcodedateien ohne Laufzeitdaten/Zugangsdaten auf main wurde nach dem Auftrag zur Testbereitstellung ausgeführt.

## Browser-Testbereitstellung
Separate statische GitHub-Pages-Vorschau mit gekennzeichnetem Browser-Demoadapter vorbereitet. Die normale Server-/PostgreSQL-Anwendung bleibt unverändert. Kein echter Buchungs-/Zahlungsbetrieb; Local Storage getrennt von serverseitigen Daten. Source liegt auf main, exportierte Vorschau wird auf gh-pages bereitgestellt. Die Cloud blockiert GitHub-Verwaltungs-API und Seitenprüfung derzeit durch die Netzwerkpolicy (403 beim CONNECT); api.github.com und postboxsr.github.io wurden additiv im Konfigurationsentwurf gespeichert, noch keine Runtime-Freigabe bestätigt. Gegebenenfalls muss Pages einmal in den GitHub-Repository-Einstellungen auf gh-pages /(root) aktiviert werden. Keine produktive Markenwebsite veröffentlicht und kein kostenpflichtiges Hosting bestellt.

Die Nutzer-Rasterreferenz wurde geprüft. Eigenständiger REPAIRROOM-KI-Wortmarkenentwurf und rotes Farbsystem eingebunden; SHOWROOM-Original bleibt unverändert. Statischer Vorschau-Build und zehn Browserprüfungen bestanden, Version auf gh-pages hochgeladen. GitHub hat Pages automatisch aktiviert. Run 38588695308 bestätigt die erfolgreiche Bereitstellung von Artefakt 95e9707 auf https://postboxsr.github.io/REPAIRROOM/. Direkter HTTP-Abruf aus dieser Cloud bleibt durch Netzwerkpolicy blockiert; die erfolgreiche Hosting-Bereitstellung wurde über GitHub verifiziert, der komplette Browserablauf gegen dasselbe lokale Artefakt getestet.

Nach Einbindung der SHOWROOM-verwandten Logo-/Farbgestaltung: normaler Next.js-Build erfolgreich, sechs Server-Dateidemo-Regressionstests bestanden; statischer Export erfolgreich, zehn Vorschauprüfungen bestanden einschließlich sichtbarer Fahrzeugauswahl im ersten Smartphone-Bereich und geladenem Wortmarkenbild.

Kostenlose Browser-Testadresse bereitgestellt: https://postboxsr.github.io/REPAIRROOM/. Keine manuelle GitHub-Pages-Aktivierung erforderlich. Quellcode und Markenentwurf auf main, geprüfte statische Oberfläche auf gh-pages. Kein Hostingzugang, keine lokale Mac-Installation oder Domainregistrierung für den Nutzer nötig. Netzwerkfreigaben/install_script/start_skill als Cloud-Entwurf gespeichert; Aktualisierung/Veröffentlichung des Cloud-Snapshots noch separat.

## Etappe 3 – Reservierung und Wiederaufnahme
Frontend mit sichtbarer Ablaufzeit, Wiederaufnahme einer offenen Reservierung im selben Browser nach Reload/Schließen, unverändertem Fristende, fixiertem Reservierungspreis und bewusster Freigabe beim Zurückgehen. Abgelaufene Fenster können nicht bestätigt werden; die Fahrzeugauswahl bleibt für die neue Terminwahl erhalten. Neue Demo-API-Aktionen reserve/resume/release/confirm, Anbindung an das PostgreSQL-Repository und isolierte lokale Dateireservierungen. Browser-Vorschau bildet die Funktionen ausdrücklich nur im lokalen Browserspeicher nach. Keine echte Zahlung oder E-Mail angebunden. Typprüfung, normaler Build und statischer Export erfolgreich; Browser-Prüfungen für Fristablauf und Wiederaufnahme ergänzt.

Etappe-3-Prüfungen abgeschlossen: 14/14 Browser-Vorschauprüfungen, 10/10 Server-Dateidemo-Prüfungen, 10/10 PostgreSQL-Oberflächen-/API-Prüfungen sowie 16/16 PostgreSQL-Integrationstests bestanden (50 gesamt, keine übersprungen). Beide Builds und Typprüfung erfolgreich. Die Wiederaufnahme prüft dieselbe Reservierungs-ID und dasselbe Fristende; Ablauf verhindert Bestätigung und gibt das Fenster frei. Anfangs mussten ausschließlich Testsynchronisierung und ein Playwright-Import korrigiert werden; die finalen vollständigen Läufe sind erfolgreich.

Etappe-3-Veröffentlichungsblocker: GitHub-Pages-Run 38594342011 (Artefakt 0d9154b) endete nach 10m43s mit Timeout. Ein begründeter erneuter Upload desselben geprüften Pakets als eed4c98 (Run 38596469385) wurde vom Hosting-Dienst mit HTTP 400 abgelehnt: alter Pages-Deploymentvorgang 0d9154b weiterhin in progress, muss zunächst abgebrochen werden. Cloudzugriff auf api.github.com scheitert an CONNECT 403; erlaubte Domains wurden im Entwurf vorbereitet, Runtime-Anwendung nicht bestätigt. Neue Checkout-Version liegt auf main und als statisches Artefakt auf gh-pages, ist aber nicht erfolgreich öffentlich bereitgestellt. Letzte bestätigte öffentliche Version bleibt 95e9707. Nötige externe Aktion: vorbereitete Umgebungseinstellungen mit api.github.com speichern/aktivieren; danach vorhandenen API-Zugriff prüfen, hängendes Pages-Deployment abbrechen und geprüfte Vorschau erneut bereitstellen. Keine Zugangsdaten im Chat anfordern.

## Eigener Testserver (15.10.2026)
Nutzer hat 31.70.157.27 für die Testumgebung angegeben und den Cloud-Public-Key bei root hinterlegt. Sein Terminal bestätigt laufendes SSH auf Port 22 und erfolgreichen Mac-Zugang; aus der Cloud weiterhin Connection refused. Kein Remote-Deployment behaupten. scripts/deploy-browser-demo.sh ist für die Ausführung über den funktionierenden Nutzerzugang vorbereitet: gepinntes, bereits browsergetestetes netlify-demo-Artefakt, isoliertes Nginx-Site-Verzeichnis/Port 8080, keine API/DB, kein Überschreiben vorhandener Zielpfade oder belegter Ports. Bash-Syntax geprüft; Installation und HTTP-Prüfungen auf dem Server noch ausstehend. Anbieter-Firewall kann TCP 8080 zusätzlich erfordern. Installiert Pakete über die vorhandenen apt-Quellen; ersetzt keine vorhandenen Websites oder SSH-Konfiguration.

## Kalender und emotionaleres Serviceangebot (15.10.2026)
Nutzer bestätigt funktionierende Browser-Demo auf eigenem Server nach Firewall-Freigabe von TCP 8080. Neue Gestaltung umgesetzt: Monatsübersicht mit verfügbaren Berliner Kalendertagen, Tagesauswahl und kompakte Uhrzeiten, deaktivierte Tage ohne Slots, Monatswechsel nur bei tatsächlich verfügbaren Testslots, Auswahl wird beim Tagwechsel gelöscht und beim Zurückgehen beibehalten. Festpreis und nächster passender Termin bleiben gemeinsam sichtbar. Reservierungs-/Zahlungslogik unverändert. Rot/Graphit/warme Flächen beibehalten, Texte emotionaler. Werkstattservice-Entwurf mit Inspektion/Wartung, Bremsen, Reifen, Diagnose und Klima ergänzt; vorhandene Autoglas-/Unfall-/Aufbereitungsabläufe erhalten. Kein bestätigtes Live-Angebot oder Preise erfunden.
Die angegebene Referenz https://www.auto-service-malsch.de/ konnte wegen CONNECT 403 nicht betrachtet werden. Keine Behauptung einer originalgetreuen Übernahme; Aufbau auf Basis der Nutzerbeschreibung. Für genaue Leistungsabstimmung ist eine lesbare Referenz/Leistungsliste noch nötig.
Prüfungen: Typecheck, normaler Next-Build und statischer Preview-Build erfolgreich; 16 Preview- und 10 normale file-Demo-Browserprüfungen bestanden (Desktop/Mobil), einschließlich Kalender-Tagwechsel, Buchung, Wiederaufnahme, Ablauf und Stornierung. Screenshots von Desktop und Smartphone visuell geprüft. Keine Backend-/Datenbankänderung; DB-Suite deshalb nicht erneut ausgeführt.
Getestetes Hosting-Artefakt 498d8dd61062e128787c9175de4b94afd1273f94 auf netlify-demo hochgeladen. SSH aus Cloud weiterhin Connection refused. scripts/update-browser-demo.sh für Nutzer-SSH vorbereitet, Syntax geprüft: nur eigenes markiertes Demo-Verzeichnis ersetzen, alte Version behalten, bei fehlgeschlagener HTTP-Prüfung zurücksetzen. Remote-Ausführung und Veröffentlichung dieser neuen Version auf 31.70.157.27 noch nicht bestätigt. Wiederholbarer Erstinstaller auf neues Artefakt aktualisiert; bestehende Installation über Update-Skript aktualisieren.
