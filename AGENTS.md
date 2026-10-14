# REPAIRROOM
Arbeite nur in diesem eigenständigen Repository. Keine SHOWROOM-/Dealerwerk-Daten oder Infrastruktur verwenden. Bestehende Checkout verwenden, keinen zusätzlichen Worktree anlegen.

Das verbindliche Modell steht in REQUIREMENTS.md: Ölwechsel ausschließlich online, Gastbuchung, Festpreis und verfügbares Servicefenster, Onlinezahlung, Kunde bleibt vor Ort. Andere Services haben eigene Abläufe.

Demo und Live strikt trennen. Nur REPAIRROOM_MODE=demo aktiviert /api/demo. Keine realen Daten, Zahlung, Termine oder Anbieter vortäuschen. Kein produktives Deployment, keine bezahlten Dienste oder Domainbestellung ohne ausdrücklichen Auftrag.

Keine erfundenen Firmendaten, Bewertungen oder Logos. Die Nutzer-Rasterreferenz liegt im Chat vor; die Original-Vektordatei und Schrift fehlen weiterhin. Der eigenständige Logoentwurf ist als KI-Entwurf dokumentiert. Vorläufige Medien und Wortmarke dokumentieren. Systemschriften verwenden.

Prüfen: `npm run db:prepare`, `npm run test:db`, `npm run typecheck`, `NEXT_TELEMETRY_DISABLED=1 npm run build`, `CI=1 npm run test:postgres` sowie `CI=1 REPAIRROOM_DEMO_STORAGE=file npm test`. Browser: Chromium, Standard /usr/bin/chromium, alternativ PLAYWRIGHT_CHROMIUM_EXECUTABLE. Oberflächentests auf Desktop und Pixel 7; Demo-API muss Preise bestimmen, Konkurrenzbuchungen ablehnen und Stornierungen freigeben.

PROJECT_STATUS.md nach Änderungen aktualisieren. Demo-Dateispeicherung nie als Live-Datenbank einsetzen.

PostgreSQL nur im eigenen lokalen Container, getrennte Datenbanken repairroom_demo/repairroom_test. Testläufe leeren ausschließlich geprüfte repairroom_test-Fixtures. DATABASE_URL nicht als Test-/Demo-Fallback verwenden. Kein Ausgeben von .postgres-Konfiguration, Zugangsdaten oder Tokens. Angewandte SQL-Migrationen nicht ändern; neue Migrationen hinzufügen. Fenster vor Buchung sperren, DB-Uhr nach Sperrwartezeit prüfen, Token nur hashen. confirmSimulatedPayment ist keine echte Zahlungsbestätigung. Keine öffentliche interne-/Live-API ohne Autorisierung und signierte Anbieterereignisse.
