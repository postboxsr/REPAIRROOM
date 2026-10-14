#!/usr/bin/env node
// Export an isolated browser demo. The normal Next.js/API/PostgreSQL sources stay unchanged.
import { cp, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.preview-output');
const marker = '.repairroom-preview-generated';
const basePath = '/REPAIRROOM';
let stage;

async function transform(relative, replacements) {
  const target = path.join(stage, relative);
  let contents = await readFile(target, 'utf8');
  for (const [original, replacement] of replacements) {
    if (!contents.includes(original)) throw Error(`Preview transformation no longer matches ${relative}: ${original}`);
    contents = contents.replaceAll(original, replacement);
  }
  await writeFile(target, contents);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: stage,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else {
        const error = Error(`Static preview build failed (${signal || code}).`);
        error.exitCode = code || 1;
        reject(error);
      }
    });
  });
}

try {
  await stat(path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'));
  stage = await mkdtemp(path.join(tmpdir(), 'repairroom-preview-'));
  // Explicit allowlist: no .env, .demo-data, .postgres, Git metadata or credentials.
  for (const entry of ['app', 'components', 'lib', 'public', 'package.json', 'package-lock.json', 'tsconfig.json', 'next-env.d.ts']) {
    await cp(path.join(root, entry), path.join(stage, entry), { recursive: true });
  }
  await rm(path.join(stage, 'app', 'api'), { recursive: true, force: true });
  await cp(path.join(root, 'preview', 'browser-demo.ts'), path.join(stage, 'lib', 'browser-demo.ts'));
  await symlink(path.join(root, 'node_modules'), path.join(stage, 'node_modules'), 'dir');
  await writeFile(path.join(stage, 'next.config.mjs'), `export default ${JSON.stringify({ output: 'export', trailingSlash: true, basePath, images: { unoptimized: true } }, null, 2)};\n`);

  await transform('components/BookingFlow.tsx', [
    ["import {useEffect,useState} from 'react';", "import {useEffect,useState} from 'react';import {browserDemo} from '../lib/browser-demo';"],
    ["fetch('/api/demo'", "browserDemo('/api/demo'"],
    ['rr-vehicle', 'rr-preview-vehicle'], ['rr-slot', 'rr-preview-slot'], ['rr-token', 'rr-preview-token'], ['rr-checkout','rr-preview-checkout'],
    ['Keine reale Reservierung, kein Geldfluss. Bitte keine persönlichen Daten eingeben.', 'Browser-Demo: Testbuchungen werden nur in diesem Browser gespeichert. Keine reale Reservierung, kein Geldfluss. Bitte keine persönlichen Daten eingeben.'],
  ]);
  await transform('components/ManageBooking.tsx', [
    ["import type {Booking} from '../lib/demo';", "import {browserDemo,type Booking} from '../lib/browser-demo';"],
    ["fetch('/api/demo", "browserDemo('/api/demo"],
    ['rr-token', 'rr-preview-token'],
    ['Keine echte Reservierung. Zahlung ausschließlich simuliert.', 'Browser-Demo: Diese Testbuchung liegt nur im lokalen Speicher dieses Browsers. Der Verwaltungslink funktioniert im selben Browser. Keine echte Reservierung; Zahlung ausschließlich simuliert.'],
    ['Die lokale Demo kann jederzeit zurückgesetzt werden.', 'Gelöschte Websitedaten entfernen die Testbuchung. Andere Besucher haben ihren eigenen Demo-Kalender.'],
    ["location.origin+'/buchung#'+token", `location.origin+'${basePath}/buchung/#'+token`],
  ]);
  await transform('components/VehiclePicker.tsx', [['rr-vehicle', 'rr-preview-vehicle']]);
  await transform('app/layout.tsx', [
    ['ENTWICKLUNGSDEMO · Testdaten · Keine echten Termine oder Zahlungen', 'BROWSER-DEMO · Testdaten · Buchungen nur in diesem Browser · Keine echten Zahlungen'],
    ['src="/repairroom-logo-draft.png"', `src="${basePath}/repairroom-logo-draft.png"`],
  ]);
  await transform('app/page.tsx', [["src=\"/workshop-concept.png\"", `src="${basePath}/workshop-concept.png"`]]);
  await transform('app/globals.css', [["@import url('/fonts.css');", `@import url('${basePath}/fonts.css');`]]);
  await transform('app/[seite]/page.tsx', [
    ['Die lokale Demo speichert Fahrzeugauswahl und Verwaltungs-Token im Session Storage des Browsers. Buchungen liegen im lokalen Verzeichnis .demo-data.', 'Die Browser-Demo speichert Fahrzeugauswahl und Verwaltungs-Token im Session Storage; Testbuchungen liegen im Local Storage dieses Browsers. Der Verwaltungslink funktioniert nur im selben Browser. Beim Löschen der Websitedaten gehen die Testbuchungen verloren.'],
  ]);

  for (const component of ['BookingFlow.tsx', 'ManageBooking.tsx']) {
    const contents = await readFile(path.join(stage, 'components', component), 'utf8');
    if (/\bfetch\s*\(/.test(contents)) throw Error(`Unexpected network request remains in ${component}`);
  }
  await run(process.execPath, [path.join(stage, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build', '--webpack']);
  const exportPath = path.join(stage, 'out');
  await stat(path.join(exportPath, 'index.html'));
  // Refuse to overwrite any output directory that this helper did not generate.
  try {
    await stat(output);
    if ((await readFile(path.join(output, marker), 'utf8')).trim() !== 'REPAIRROOM static browser demo') {
      throw Error(`Refusing to replace unrecognized output directory: ${output}`);
    }
    await rm(output, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // A missing marker in an existing directory must not authorize its deletion.
    try { await stat(output); throw Error(`Refusing to replace output without marker: ${output}`); }
    catch (check) { if (check.code !== 'ENOENT') throw check; }
  }
  await mkdir(output, { recursive: true });
  await cp(exportPath, output, { recursive: true });
  await writeFile(path.join(output, marker), 'REPAIRROOM static browser demo\n');
  await writeFile(path.join(output, '.nojekyll'), '');
  console.log(`Browser demo exported to ${output} (base path ${basePath}).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = Number.isInteger(error.exitCode) ? error.exitCode : 1;
} finally {
  if (stage) await rm(stage, { recursive: true, force: true });
}
