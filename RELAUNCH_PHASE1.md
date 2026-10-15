# REPAIRROOM Relaunch – Phase 1

Stand: 15.10.2026. Entwicklungsbranch `relaunch/phase-1-fast-service`; kein Deployment auf main, netlify-demo, gh-pages oder den eigenen Server.

## Bestandsanalyse

| Bereich | Vorhanden | Grenze / Handlungsbedarf |
| --- | --- | --- |
| Framework | Next.js 16.4, React 19.3, TypeScript, App Router, npm-Lockfile | Node 24 in der Cloud; vor Livebetrieb Sicherheitsupdates prüfen |
| Design | Rot #c92127, Graphit, warme Flächen, KI-Wortmarkenentwurf | Keine finale Logo-Vektordatei; Werkstattbild ist KI-Studie |
| Seiten | Startseite, Ölwechsel, Service-/Rechtsentwürfe, Buchung, Verwaltung, Stationskonzept | Betreiber, Standort, Öffnungszeiten und echte Leistungsfreigaben fehlen |
| Frontend | Fahrzeugauswahl, Quote, Monatskalender, Prüfung, Checkout, Bestätigung/Stornierung | Drei ausdrücklich fiktive Testfahrzeuge; keine Fahrzeugidentifikation |
| Server | Demo-API /api/demo, serverseitige Testpreise; expliziter Demo-Modus und Origin-Prüfung | Keine produktive API, kein Rate-Limit, keine vollständige Eingabevalidierung / Live-Autorisierung |
| Reservierung | PostgreSQL: Transaktionen, Sperren, Unique-/Overlap-Constraints, Token-Hashing, Preis-Snapshot, Ablauf und idempotente Testzahlung | Demo-/Testschema; Dateispeicher nur Einzelprozess; keine produktive Kapazitätsverwaltung |
| Zahlung / E-Mail | Adapterinterfaces und simulierte Zahlungsbestätigung | Kein PSP, keine Webhook-Signaturprüfung, echten Refunds oder E-Mail-Versand |
| Hosting | Eigener Ubuntu-Server 31.70.157.27, Nginx :8080, statischer Export unter /REPAIRROOM/; Nutzer bestätigt Erreichbarkeit | Browser-Demo speichert lokal, keine gemeinsame Serververfügbarkeit. Cloud-SSH blockiert; neues Design nicht ausgerollt. HTTPS/Domain fehlen |
| Weitere Veröffentlichungen | main: bisheriger Quellcode; netlify-demo: statische Artefakte; gh-pages: ältere Vorschau mit dokumentierter Deployment-Störung | Nicht automatisch aktualisieren |
| Qualität | Playwright Desktop/Pixel 7, DB-Integrationstests, Builds/Typecheck | Kein echter iPhone-/Safari-Test, vollständiger Accessibility-, Last- oder Sicherheitsaudit |

Weitere geprüfte Quellen: AGENTS.md, REQUIREMENTS.md, README.md, PROJECT_STATUS.md, Komponenten, Adapter, Checkout, Migrationsschema, API, Build-/Deployment-Skripte und vorhandene Tests. README enthält ältere Pages-/Testzählstände; für diese Phase sind diese Notiz und PROJECT_STATUS.md maßgeblich.

## Referenz

https://www.auto-service-malsch.de/ und die Variante ohne www wurden erneut abgerufen. Beide Zugriffe scheiterten am Cloud-Egress mit CONNECT 403. Daher keine belegbare Analyse ihrer Layouts, Preise oder Leistungen und keine Übernahme ihrer Texte/Bilder. Eigenständiger Entwurf auf Basis des Nutzerauftrags. Eine spätere Gegenprüfung ist mit zugänglicher Referenz oder bereitgestellten Ansichten möglich und blockiert den Relaunch nicht.

## Umsetzung und Nutzerführung

Neue Startseite mit markanter Positionierung „Günstig. Schnell. Fachgerecht.“, dunklem Automotive-Hero, vorhandener Fahrzeugauswahl im ersten Bildschirm, Ölwechsel als hervorgehobener Leistung, fünf Buchungsschritten, neun verlinkten Servicekarten, konkreten Ablaufargumenten, FAQ und abschließendem Buchungseinstieg. Eigene SVG-Serviceicons statt fremder Marken. Neue Leistungsentwürfe für Bremsen, Inspektion, Reifen, Klima und Diagnose. Bestehender Kalender und Checkout werden wiederverwendet.

Preise/Termine bleiben ausdrücklich Testdaten, nicht reale Angebote. Keine fingierten Bewertungen, Rabattanker, künstliche Knappheit oder Wartezeitgarantien. Zusätzliche Werkstattservices erhalten keine funktionstüchtig wirkenden Anfrage-Buttons ohne Backend. Kein Echtzahlungsformular. Apple Pay/Karte/Bankdirektzahlung nur als geplante Methoden beschrieben, keine aktiven Zahlungslogos oder Zusagen.

Mobile: Fahrzeugauswahl oben, große bedienbare CTA, zweispaltige Servicekarten, einspaltiger Buchungsablauf. Systemschrift, servergerenderter Inhalt, begrenztes Client-JavaScript, responsive Next-Image mit Priorität nur für Hero und Logo. Seitentitel/Beschreibungen für Serviceentwürfe; noindex bleibt für die Entwicklungsdemo aktiv. Kein LocalBusiness-Schema mit erfundenem Standort. Kein Analytics-/Cookie-Dienst eingebaut. Eine vollständige Leistungs-/Core-Web-Vitals-Messung folgt nach der Hostingentscheidung.

## Servicepakete und Wirtschaftlichkeit – Entwurf, keine Preisangebote

| Paket | Klarer Umfang | Vor Kalkulation zwingend nötig |
| --- | --- | --- |
| Ölwechsel Basis | Freigegebenes Öl, fahrzeugspezifischer Filter, Arbeitszeit, Entsorgung | Motorzuordnung, Ölmenge/-freigabe, Einkauf, Dauer, Entsorgungskosten |
| Wartung nach Plan | Nur die konkret fälligen Wartungspunkte, getrennt ausgewiesene Zusatzarbeiten | Wartungsdatenlizenz, Teileliste, Qualifikation, Dokumentation, Zeitansatz |
| Räderwechsel | Wechsel eines definierten Radsatzes; Auswuchten/Einlagerung getrennte Optionen | Rad-/Fahrzeugtypen, Hebezeit, Geräte, Kapazität; Einlagerung erst bei vorhandenem Lager |
| Klima-Prüfung | Definierter Prüfauftrag, weitere Arbeiten nur nach Freigabe | Kältemitteltyp, Ausstattung, Fachnachweise, Befund; keine unbegrenzte Befüllung |
| Diagnose Einstieg | Begrenzter Prüfauftrag mit dokumentiertem Befund, Anschlussdiagnose separat | Tatsächliche Prüfzeit, Diagnosesoftware/-lizenz, Stundensatz, Freigabeprozess |
| Glasprüfung | Schaden/Fahrzeug prüfen, Reparatur oder Austausch gesondert anbieten | Scheibentyp, Reparierbarkeit, ggf. Kalibrierung, Teile, Versicherungsfreigabe |

Kalkulation: Netto-Verkaufspreis = variable Kosten (Teile/Öl, produktive Arbeitszeit, Entsorgung, PSP-Gebühren) + zugewiesene Gemeinkosten + Risiko-/Gewährleistungsreserve + Zieldeckungsbeitrag. Danach tatsächliche Umsatzsteuer und vollständigen Bruttopreis ausweisen. Plausibilisieren über Stationsauslastung, verfügbare Arbeitszeit und Deckungsbeitrag je belegter Minute. Mengen-/Fahrzeuggrenzen und Zusatzleistungen vor Checkout transparent angeben; keine irreführenden „ab“-Preise. Ohne diese Eingaben ist Wirtschaftlichkeit nicht nachgewiesen und wird kein Betrag veröffentlicht.

Autoglas: Keine pauschale Versicherungsübernahme, kein „kostenlos für alle“, kein versprochener Erlass von Selbstbeteiligung oder undokumentierter Versicherungsbonus. Versicherung/Vertrag, Selbstbeteiligung, Freigabe und Reparierbarkeit individuell prüfen. Angebot, ggf. Abtretung, Schadenkommunikation und tatsächliche ADAS-Kalibrierung fachlich/rechtlich prüfen. Ein verbindlicher juristischer Review der konkreten Werbung und Verträge steht aus; hier keine abschließende Rechtsberatung oder Rechtsfreigabe behauptet.

## Phase 2 – verbindliche Reihenfolge

1. **Betriebsgrundlage:** Betreiber/Standort, Werkstattausrüstung, Personal, tatsächliche Leistungen, Öffnungszeiten, Dauer-/Kapazitätsregeln und Einkaufskosten bestätigen. Rechtliche Texte und Hosting mit Domain/HTTPS, eingeschränkten DB-Rollen, Backups/Restore-Test festlegen.
2. **Fahrzeugidentifikation:** Lizenzierter Fahrzeugdatenanbieter, HSN/TSN und bei Bedarf VIN/Motorvariante; nicht eindeutige oder nicht unterstützte Fahrzeuge ohne erfundene Zuordnung ablehnen. Ölfreigabe, Menge und Filter aus nachvollziehbarer Quelle. Zugang fehlt.
3. **Echte Festpreise:** Versionierte serverseitige Regeln aus tatsächlichen Kosten. Gültigkeitsdauer, Steuer, Inklusivleistungen und Ausnahmen vor Reservierung; unveränderlicher Quote-/Buchungssnapshot. Preisgrenzen-/Motorvarianten-Tests.
4. **Terminverwaltung:** Eigener Live-Datenbereich, Stationen/Ressourcen, Arbeitszeiten, Pausen, Dauer, Puffer, Personalrollen und sichere Stationsoberfläche. Bestehende Sperren/Holds übernehmen; Parallelreservierung, Feiertage, Sommerzeit und Ablauf unter Last prüfen. Kein Wechsel in Live über eine einzelne Demo-Variable.
5. **PSP-Sandbox:** Anbieter und Kosten vergleichen; Apple Pay über unterstützten PSP mit Domain-Verifizierung, Karten über gehosteten Checkout/SCA. Geeignete Bankdirektzahlung nur bei bestätigter Verfügbarkeit und verlässlichem Zahlungsstatus; verzögerte Bankzahlungen nicht als sofort bestätigten Termin behandeln. Keine Kartendaten im eigenen System.
6. **Zahlungszustandsmaschine:** Signierte Webhooks, Betrag/Währung/Zuordnung prüfen, Replay-/Idempotenzschutz, Timeout- und Late-Payment-Regeln, Abbruch/Refunds. Erfolgsredirect beweist keine Zahlung. Buchung erst nach serverseitig bestätigtem Anbieterereignis bestätigen.
7. **Betriebsstart-Vorbereitung:** E-Mail-Anbieter, Verwaltungslinks, Storno-/Erstattungsregeln, Datenschutz/AV-Verträge/Löschfristen, Auth/Rollen/Rate-Limits, Monitoring ohne sensible Tokens. Sandbox-End-to-End inkl. verlorener Antwort, doppelter Webhooks, Rückzahlung und Konkurrenz; Geräte-/Accessibility-/Performance-Checks.
8. **Freigabe:** Erst nach erfolgreicher Prüfung, bestätigten Angaben und ausdrücklicher Produktionsfreigabe live gehen und noindex entfernen.

Fehlende Zugänge werden erst bei Integration sicher in Umgebungseinstellungen hinterlegt, niemals in Chat oder Repository: Fahrzeugdatenlizenz/API, PSP-Sandbox/Webhook-Bindung, E-Mail-Anbieter, Live-DB/Hosting. Keine Zugangsdaten für den Designentwurf nötig.

## Abnahme in dieser Phase

Typecheck, Next-Serverbuild und statischer Preview-Build erfolgreich. 54 Prüfungen bestanden: 18 statische Desktop-/Mobiltests, 10 File-Demo-UI/API-Tests, 10 PostgreSQL-UI/API-Tests und 16 DB-Integrationstests. Kalenderauswahl, Preiszuständigkeit, Reservierung/Wiederaufnahme/Ablauf, Bestätigung und Stornierung bleiben geprüft. Neue Tests prüfen den Buchungseinstieg im ersten Viewport, alle neun Karten und die neuen Serviceseiten. Ein anfänglicher Testselektor berücksichtigte den abschließenden Schrägstrich statischer Links nicht; korrigiert und gesamte Preview-Suite erfolgreich wiederholt.

Screenshots aus Chromium (Desktop und Pixel 7), visuell geprüft:

- [Desktop, erster Bildschirm](review/phase1/desktop.png)
- [Smartphone, erster Bildschirm](review/phase1/mobile.png)
- [Desktop, vollständige Startseite](review/phase1/desktop-full.png)
- [Smartphone, vollständige Startseite](review/phase1/mobile-full.png)

Es wurden keine echten Zahlungen, neuen Anbieterintegrationen, Serveränderungen oder Liveveröffentlichungen durchgeführt. Produktivfunktion, Wirtschaftlichkeit, rechtliche Freigabe, echte Safari-/Gerätetests und Performance auf Zielhosting sind damit nicht nachgewiesen.
