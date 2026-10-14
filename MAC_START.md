# REPAIRROOM auf Deinem Mac starten
Die Cloud-Umgebung und Dein Mac sind zwei getrennte Rechner. `/workspace/REPAIRROOM` existiert in der Cloud und ist kein Ordner auf Deinem Mac. Der Quellcode wurde in https://github.com/postboxsr/REPAIRROOM auf main bereitgestellt. Für die Browser-Testumgebung brauchst Du keine Installation auf Deinem Mac; deren Bereitstellung und GitHub-Pages-Aktivierung sind in README.md beschrieben.

## 1. Node.js installieren
Installiere Node.js **24 LTS** über den offiziellen macOS-Installer (.pkg):
https://nodejs.org/en/download

npm ist enthalten. Öffne danach ein neues Terminalfenster und prüfe:

```sh
node --version
npm --version
```
Beide Befehle müssen eine Version anzeigen. Für diesen Weg ist kein Homebrew erforderlich.

## 2. Quellcode herunterladen
Öffne https://github.com/postboxsr/REPAIRROOM im Browser (bei einem privaten Repository mit Deinem GitHub-Konto anmelden). Klicke auf **Code → Download ZIP**. Das benötigt weder Git noch npm.

Entpacke die heruntergeladene ZIP-Datei im Downloads-Ordner. Der Ordner heißt normalerweise REPAIRROOM-main. Benenne ihn im Finder in REPAIRROOM um, damit die Befehle unten passen. Darin muss package.json liegen.

Das Paket enthält Quellcode, Bilder, Dokumentation und das Paket-Lockfile. Cloud-Zugangsdaten, Testbuchungen, node_modules, .next, .postgres und .demo-data sind nicht enthalten. Abhängigkeiten werden auf Deinem Mac passend für Intel oder Apple Silicon neu installiert.

## 3. Die Website-Demo starten
Dieser Einstieg benötigt kein Docker und keine Datenbankinstallation:

```sh
cd ~/Downloads/REPAIRROOM
npm ci
REPAIRROOM_MODE=demo REPAIRROOM_DEMO_STORAGE=file npm run dev
```
Wenn Du den Ordner an einem anderen Ort entpackt hast, verwende diesen tatsächlichen Pfad. Alternativ `cd ` eintippen, den REPAIRROOM-Ordner aus dem Finder ins Terminal ziehen und Enter drücken.

Sobald das Terminal meldet, dass der Server bereit ist, öffne im Browser die Adresse `localhost:3000`. Das ist die Website auf Deinem eigenen Mac. Lass das Terminal während der Nutzung geöffnet. Mit Control+C beendest Du den Server.

Alle Fahrzeuge, Preise, Termine und Zahlungen sind Testdaten. Keine echten Namen, Zahlungsdaten oder Zugangsdaten eingeben.

## Optional: PostgreSQL-Demo
Für die transaktionale Datenbankversion installiere und starte zuerst Docker Desktop:
https://docs.docker.com/desktop/setup/install/mac-install/

Stoppe eine laufende Dateidemo mit Control+C. Im selben Projektordner:

```sh
npm run db:prepare
npm run dev:postgres
```
Das gepinnte PostgreSQL-Image unterstützt Intel und Apple Silicon. Der eigene Datenbankdienst bindet ausschließlich an 127.0.0.1:55432; Zugangsdaten werden lokal erzeugt und nicht ins Repository übernommen.

## Prüfen und Grenzen
`npm run typecheck` und `NEXT_TELEMETRY_DISABLED=1 npm run build` prüfen den Code lokal. Die Cloud wurde getestet; eine tatsächliche Ausführung auf Deinem Mac kann diese Cloud-Sitzung nicht verifizieren. Die Browser-Testkonfiguration verwendet derzeit standardmäßig Linux-Chromium; für Mac-Oberflächentests ist PLAYWRIGHT_CHROMIUM_EXECUTABLE auf einen installierten passenden Chromium-Browser zu setzen. Für normalen Start im Browser ist das nicht nötig.
