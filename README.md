# REPAIRROOM – Entwicklungsdemo mit PostgreSQL
Eigenständige deutsche Automotive-Service-Anwendung mit Next.js, React und TypeScript. Ausschließlich Testfahrzeuge, Testpreise und simulierte Zahlung; kein Livebetrieb.

## Kostenlose Browser-Testumgebung
Die separate GitHub-Pages-Vorschau wird aus dem geprüften Quellcode auf dem Branch gh-pages bereitgestellt. Öffentliche Testadresse: https://postboxsr.github.io/REPAIRROOM/. GitHub Pages wurde automatisch aktiviert; die Bereitstellung des getesteten Artefakts 95e9707 ist erfolgreich (Run 38588695308). Der direkte HTTP-Abruf aus dieser Cloud ist durch die aktuelle Netzwerkpolicy blockiert; ein Live-Browsertest von hier wurde deshalb nicht behauptet.

Sie ist ausdrücklich eine Browser-Demo: Testbuchungen liegen nur im Local Storage dieses Browsers. Der Verwaltungslink funktioniert im selben Browser; andere Besucher haben eigene Testkalender. So lassen sich Gestaltung und Benutzerführung ohne Mac-Installation prüfen. Die Vorschau enthält keine API und keine PostgreSQL-Verbindung und beweist keine serverseitige Reservierungs- oder Zahlungsfunktion. Die normale Next.js-/PostgreSQL-Anwendung bleibt erhalten.

```sh
npm run build:preview
CI=1 npm run test:preview
```
Das Build-Skript erzeugt eine temporäre Kopie aus einer Dateiallowlist, ersetzt nur dort die API durch den gekennzeichneten Browser-Demoadapter und exportiert nach .preview-output. Normale App-Dateien bleiben unverändert. Bilder, Links und CSS berücksichtigen /REPAIRROOM. Kein Upload von Zugangskonfiguration, Laufzeitdaten oder node_modules. Vierzehn Desktop-/Mobile-Prüfungen decken Gastablauf, Browserisolation, Verwaltung, Stornierung, Unterpfad und statische Auslieferung ab.

GitHub-Aktivierung bei Bedarf: Repository Settings → Pages → Source „Deploy from a branch“ → Branch gh-pages → /(root) → Save. Keine eigene Domain oder kostenpflichtiges Hosting erforderlich. Source-main enthält den vollständigen Code, gh-pages nur die exportierte Testoberfläche.

## Start auf dem eigenen Mac
Die Befehle mit `/workspace` gelten für die Cloud-Maschine. Für den lokalen Mac-Start, Node.js/npm und das Quellcodepaket siehe [MAC_START.md](MAC_START.md). Die Dateidemo läuft ohne Docker.

## Start mit PostgreSQL
Voraussetzungen: Node >=20.9, npm, laufender Docker-Daemon; Chromium für Oberflächentests.

```sh
cd /workspace/REPAIRROOM
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run db:prepare
NEXT_TELEMETRY_DISABLED=1 npm run dev:postgres
```
`db:prepare` startet ausschließlich den eigenen lokalen Container, prüft Migrationen und legt rollierende Demo-Angebote und Testfenster an. Wiederholtes Ausführen erhält bestehende Buchungen. Der Webserver verwendet Port 3000; die Cloud-Onboarding-Oberfläche bietet keinen Web-Vorschaulink.

Gebaut starten:
```sh
NEXT_TELEMETRY_DISABLED=1 npm run build
NEXT_TELEMETRY_DISABLED=1 npm run start:postgres
```
Nur `REPAIRROOM_MODE=demo` aktiviert die API. `REPAIRROOM_DEMO_STORAGE=postgres` wählt die transaktionale Datenbank. Beide Variablen werden von dev:postgres/start:postgres gesetzt. Eine nicht erreichbare Datenbank führt zu einem Fehler, niemals zum stillen Wechsel auf Dateispeicherung. Ohne Demo-Modus gibt es keinen Buchungsbetrieb, auch mit PostgreSQL.

Die weiterhin verfügbare Dateidemo benötigt kein Docker:
```sh
REPAIRROOM_MODE=demo REPAIRROOM_DEMO_STORAGE=file npm run dev
```
Dateidemo und PostgreSQL-Demo haben getrennte Buchungen und Verwaltungslinks. Alte Links werden nicht automatisch in die neue Datenbank migriert. Die Dateidemo bleibt ein einzelner lokaler Demonstrationsspeicher und besitzt keine PostgreSQL-Transaktionen.

## Lokale Datenbank und Sicherheit
- Offizielles PostgreSQL-17-Bookworm-Image, auf Digest gepinnt: postgres@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826. Hier PostgreSQL 17.11. Docker verifiziert die heruntergeladenen Artefakte; keine TLS-/Checksum-Prüfung deaktiviert.
- Container repairroom-postgres-local; benanntes Volume repairroom-postgres-local-data. TCP ausschließlich 127.0.0.1:55432. `npm run db:stop` stoppt den eigenen Dienst, löscht keine Daten. Kein automatischer Reset.
- Getrennte Datenbanken repairroom_demo und repairroom_test. Das Schema erlaubt derzeit ausschließlich demo/test-Datensätze, keine Live-Daten.
- Lokales zufällig generiertes Entwicklungspasswort in ignoriertem .postgres/local.json und .postgres/docker.env, nur für den lokalen Container; Dateirechte 0600. Diese Dateien, Tokens und Werte weder ausgeben noch einchecken. Keine externen Zugangsdaten benötigt. Kein echtes Geheimnis in .env.example.
- Optionale lokale Overrides REPAIRROOM_DEMO_DATABASE_URL und REPAIRROOM_TEST_DATABASE_URL verlangen den passenden Datenbanknamen und Loopback-Host. DATABASE_URL wird von diesen Pfaden bewusst nicht gelesen; dadurch geraten Tests nicht versehentlich an eine Produktionsdatenbank.
- Lokaler Entwicklungsnutzer besitzt Verwaltungsrechte für Migrationen. Vor Livebetrieb muss ein eingeschränkter Anwendungsnutzer eingeführt werden; keine produktive Datenbank angebunden.
- Docker-Volumes und Images sind externe Runtime-Ressourcen. Ein erfolgreicher Neustart im aktuellen System beweist keine Wiederherstellung durch einen neuen Cloud-Aufgaben-Snapshot. `db:prepare` kann fehlende lokale Demo-/Testdatenbanken neu erzeugen; das ist keine zugesicherte Wiederherstellung alter Buchungen. Fehlende Zugangskonfiguration bei vorhandenem Container wird nicht überschrieben.

## Reservierungsmodell
Der Server lädt Preis, Fahrzeug-Snapshot, Dauer und erlaubte Fenster aus dem Demo-Angebot. Ein Browserpreis wird nicht übernommen. PostgreSQL sperrt zuerst das Servicefenster, anschließend die Buchung; alle Zustandsänderungen und Ereigniseinträge sind transaktional. Ein partieller Unique-Index verhindert mehrere aktive Buchungen pro Fenster, eine Exclusion-Constraint überlappende Kapazitätsfenster derselben Station.

Reservierungen erhalten eine serverseitige Zahlungsfrist von höchstens zehn Minuten, die spätestens zum Beginn des Servicefensters endet. Es gibt keine künstliche Vorlaufgrenze: ein noch nicht begonnenes, geeignetes Fenster ist auch unmittelbar online buchbar. Verfügbarkeit und Bestätigung verwenden die Datenbankuhr auch nach Sperrwartezeiten. Abgelaufene Holds sind sofort wieder verfügbar; beim nächsten Reservierungsversuch wird der alte Zustand samt Auditereignis dauerhaft auf expired gesetzt. Es ist derzeit kein periodischer Cleanup-Dienst nötig oder vorhanden.

Die Oberfläche reserviert jetzt beim Einstieg in die Zahlungsstufe. Ein Countdown zeigt die verbleibende Frist; Neuladen oder Schließen verlängert sie nicht. Der zufällige Reservierungstoken liegt im Local Storage, sodass derselbe Browser eine offene Reservierung wieder aufnehmen kann. Zurückgehen gibt das Testfenster frei, Ablauf verhindert die Bestätigung und führt zur neuen Terminauswahl. Der angezeigte Preis bleibt der gespeicherte Reservierungspreis. Erst die ausdrückliche Demo-Zahlungsbestätigung schließt die Testbuchung ab. Keine Karten- oder Kontodaten werden abgefragt; kein echter Zahlungsanbieter angeschlossen.

Wiederholte identische Simulationsereignisse sind idempotent; Betrag, Währung, Buchungszuordnung und Reservierungszustand werden geprüft. Ein abgelaufener oder stornierter Hold wird nicht wiederbelebt. Simulationsereignisse sind keine signierten Anbieter-Webhooks. Bestätigte Demo-Buchungen lassen sich ohne realen Erstattungsfluss stornieren; ein Live-Refund-Modell fehlt.

Verwaltungslinks verwenden zufällige 256-Bit-Tokens im URL-Fragment. Die Datenbank speichert nur SHA-256-Hashes. Links privat aufbewahren. Keine Namen, E-Mail-, Adress- oder Zahlungsdaten erforderlich; keine E-Mail versendet. /station ist ein öffentliches Ablaufkonzept ohne Buchungsdaten, noch kein Personalzugang.

## Prüfungen
```sh
npm run db:prepare
npm run test:db
npm run typecheck
NEXT_TELEMETRY_DISABLED=1 npm run build
CI=1 npm run test:postgres
CI=1 REPAIRROOM_DEMO_STORAGE=file npm test
```
16 echte PostgreSQL-Integrationstests: Transaktionen, 20 konkurrierende Reservierungen, Ablauf einschließlich Sperrwartezeit, idempotente Simulationsereignisse, konkurrierende Ereigniszuordnung mit Rollback, Stornierung und Token-Hashing. Der Testlauf überprüft ausdrücklich repairroom_test und leert ausschließlich diese Fixture-Tabellen; niemals Demo-Daten. Wiederholte Migrationen werden serialisiert und per Checksum geprüft. Angewandte Migrationsdateien nicht verändern; Folgeänderungen als neue Migration hinzufügen.

Je zehn Playwright-Prüfungen mit PostgreSQL bzw. Dateispeicher, auf Desktop und Pixel-7-Ansicht: kompletter Gastablauf, Zurücknavigation, Bestätigung nach Reload, Stornierung, serverseitige Preise, Konkurrenz und alle Seiten ohne horizontalen Überlauf. Chromium-Ansichten ersetzen keinen echten Geräte-/Safari-Test oder vollständigen Accessibility-Audit. Screenshots in test-results.

Playwright benötigt standardmäßig freien Port 3000 und startet den gebauten Server selbst. Nur bewusst mit unverändertem Build kann REPAIRROOM_REUSE_SERVER=1 einen Server wiederverwenden, niemals in CI. Vor Neubauten eigene Server einschließlich Kindprozessen stoppen und danach frisch starten. Fremde Prozesse nicht beenden. Browserpfad standardmäßig /usr/bin/chromium; alternativ PLAYWRIGHT_CHROMIUM_EXECUTABLE.

## Struktur
- app/: Startseite, Leistungseiten, Buchung, Verwaltung, Stationsentwurf, rechtliche Entwürfe, explizit geschützte Demo-API.
- components/: responsive Fahrzeugauswahl und Gastbuchung, erhaltene Auswahl im Session Storage.
- lib/demo.ts: explizite Auswahl zwischen Dateidemo und PostgreSQL-Demo.
- lib/booking/: PostgreSQL-Pool, Migrationen, Testdaten, transaktionales Repository und Oberflächenadapter.
- db/migrations/: versionierte SQL-Migrationen. db/schema.sql verweist darauf und ersetzt den alten nicht ausgeführten Entwurf.
- lib/adapters.ts: spätere Fahrzeugdaten-, Zahlungs- und E-Mail-Schnittstellen.
- scripts/: eigener lokaler Datenbankstart, Migrationen und Demo-Seeding.
- tests/db/: PostgreSQL-Integrationstests; tests/demo.spec.ts: Oberfläche und HTTP-Prüfungen.
- .demo-data/ und .postgres/: ignorierte lokale Entwicklungsdateien. Docker-Daten liegen im eigenen Volume.

Demo-Kalender: technische 60-Minuten-Fenster zwischen 09 und 17 UTC für sieben rollierende Tage, Anzeige in Europe/Berlin. Keine echten Öffnungszeiten oder Dauerversprechen. Testpreise: 129 / 159 / 189 EUR. Keine realen Fahrzeugspezifikationen oder Ölfreigaben.

## Versionen und offizielle Quellen
Next.js 16.4.0, React 19.3.0, pg 8.23.1, tsx 4.23.15; Lockfile vorhanden. Die offiziellen Paketmetadaten sind mit Node 24.19.0 kompatibel. Offizielle Dokumentation geprüft:
- https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/01-installation.mdx
- https://github.com/docker-library/docs/blob/master/postgres/README.md
- https://github.com/brianc/node-postgres/blob/master/docs/pages/features/transactions.mdx

## Medien und Marke
Die SHOWROOM-Rasterreferenz wurde vom Nutzer im Chat bereitgestellt und als gestalterische Referenz visuell geprüft. Sie bleibt unverändert und wird nicht als REPAIRROOM-Logo ausgegeben. Eine bearbeitbare Original-Vektordatei und die Originalschrift sind weiterhin nicht vorhanden.

public/repairroom-logo-draft.png wurde mit dem OpenAI-Bildgenerator als eigenständiger, vorläufiger REPAIRROOM-Entwurf anhand dieser Referenz erzeugt: breite geometrische Wortmarke, verwandtes Rot und eigene Dachlinie. Es handelt sich um einen KI-Entwurf, keine originalgetreue Logoableitung oder final freigegebene Markenreinzeichnung. Header und Footer verwenden die neue Datei; das Farbsystem ist auf dunkles Rot, Graphit und warme helle Flächen abgestimmt. Keine fremden Logos oder heruntergeladenen Schriften verwendet; UI-Systemschrift Arial/Helvetica/sans-serif.

public/workshop-concept.png wurde am 14.10.2026 mit dem OpenAI-Bildgenerator aus eigener Beschreibung erzeugt. Es ist im Bildtext und Alternativtext als KI-Designstudie gekennzeichnet, zeigt keinen echten REPAIRROOM-Standort und ersetzt keine bestätigte Standortfotografie. Finale eigene oder nachweisbar lizenzierte Fahrzeug- und Werkstattfotos bleiben offen.

Siehe REQUIREMENTS.md für den vollständigen Auftrag und PROJECT_STATUS.md für Ergebnisse und nächste Schritte.

Checkout-API (nur Demo-Modus): POST /api/demo mit reserve/resume/release/confirm. PostgreSQL nutzt das transaktionale Repository, Token-Hashing und idempotente Simulationsereignisse; die lokale Dateidemo verwendet eigene .hold.json-Dateien und eine Prozesswarteschlange. Dateidemo ist weiterhin nicht für Mehrinstanz-Livebetrieb geeignet. Der statische Export bildet denselben Bedienablauf im Browser nach, ohne serverseitige Garantie. Eine echte Zahlungsintegration muss bestätigte Anbieterereignisse prüfen und eine getrennte Erstattungs-/Abbruchregel erhalten.

## Animierter Designentwurf
Auf `design/animated-fast-service` liegt die neue illustrierte Startseite mit eigener SVG-Szene, gesichtslosen Figuren, ruhiger CSS-Animation, Pause und Unterstützung reduzierter Bewegung. Kein Deployment auf den bestehenden Testserver. Dokumentation und nächste Schritte: [ANIMATION_DESIGN.md](ANIMATION_DESIGN.md); Screenshots in `review/motion/`. Builds und Startbefehle bleiben gleich, es gibt keine zusätzliche Animationsabhängigkeit.
