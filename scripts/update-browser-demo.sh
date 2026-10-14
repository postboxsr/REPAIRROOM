#!/usr/bin/env bash
# Update only the dedicated browser demo; keep a rollback copy.
set -euo pipefail
[[ $(id -u) == 0 ]] || { echo 'Als root starten.' >&2; exit 1; }
artifact=498d8dd61062e128787c9175de4b94afd1273f94
site=/var/www/repairroom-browser-demo
conf=/etc/nginx/conf.d/repairroom-browser-demo.conf
[[ -d "$site" && ! -L "$site" && -f "$conf" ]] || { echo 'Eigene Browser-Demo nicht gefunden.' >&2; exit 1; }
[[ $(cat "$site/REPAIRROOM/.repairroom-preview-generated") == 'REPAIRROOM static browser demo' ]]
grep -Fq 'root /var/www/repairroom-browser-demo;' "$conf"
nginx -t
if [[ -f "$site/.repairroom-artifact" ]] && [[ $(cat "$site/.repairroom-artifact") == "$artifact" ]]; then
  echo 'Diese Demo-Version ist bereits installiert.'; exit 0
fi
stage=$(mktemp -d /var/www/.repairroom-update.XXXXXX)
backup="${site}-backup-$(date -u +%Y%m%dT%H%M%SZ)-$$"
moved=0
cleanup(){
  status=$?
  if [[ $status != 0 && $moved == 1 ]]; then
    if [[ -e "$site" ]]; then mv "$site" "${backup}-failed"; fi
    mv "$backup" "$site"
    echo 'Update fehlgeschlagen; vorherige Demo wiederhergestellt.' >&2
  fi
  rm -rf "$stage"
  exit "$status"
}
trap cleanup EXIT
git clone --quiet --depth 1 --branch netlify-demo https://github.com/postboxsr/REPAIRROOM.git "$stage/source"
[[ $(git -C "$stage/source" rev-parse HEAD) == "$artifact" ]] || { echo 'Hosting-Artefakt geändert; nichts ersetzt.' >&2; exit 1; }
[[ $(cat "$stage/source/.repairroom-netlify-generated") == 'REPAIRROOM isolated Netlify demo' ]]
[[ -f "$stage/source/REPAIRROOM/werkstattservice/index.html" ]]
mkdir "$stage/site"
cp -R "$stage/source/REPAIRROOM" "$stage/site/"
cp "$stage/source/index.html" "$stage/site/"
printf '%s\n' "$artifact" > "$stage/site/.repairroom-artifact"
chmod -R a+rX "$stage/site"
mv "$site" "$backup"
moved=1
mv "$stage/site" "$site"
curl --fail --silent http://127.0.0.1:8080/REPAIRROOM/buchen/ -o "$stage/booking.html"
grep -Fq 'Frisches Öl. Freie Fahrt.' "$stage/booking.html"
curl --fail --silent http://127.0.0.1:8080/REPAIRROOM/werkstattservice/ -o "$stage/workshop.html"
grep -Fq 'WERKSTATT' "$stage/workshop.html"
moved=0
printf '\nDemo aktualisiert: http://31.70.157.27:8080/REPAIRROOM/\nVorherige Version gesichert: %s\n' "$backup"
