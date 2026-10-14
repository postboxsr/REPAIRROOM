#!/usr/bin/env bash
# Dedicated Ubuntu/Debian browser test site, no API/database or real payments.
set -euo pipefail
[[ $(id -u) == 0 ]] || { echo 'Als root starten.' >&2; exit 1; }
artifact=498d8dd61062e128787c9175de4b94afd1273f94
site=/var/www/repairroom-browser-demo
conf=/etc/nginx/conf.d/repairroom-browser-demo.conf
if [[ -e "$site" || -e "$conf" ]]; then
  echo 'Demo-Ziel existiert bereits; nichts überschrieben.' >&2; exit 1
fi
if ss -lntH | awk '{print $4}' | grep -Eq ':8080$'; then
  echo 'Port 8080 ist belegt; nichts geändert.' >&2; exit 1
fi
apt-get update
apt-get install -y nginx git ca-certificates curl
nginx -t
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
git clone --depth 1 --branch netlify-demo https://github.com/postboxsr/REPAIRROOM.git "$stage/source"
[[ $(git -C "$stage/source" rev-parse HEAD) == "$artifact" ]] || { echo 'Hosting-Artefakt geändert; Installation abgebrochen.' >&2; exit 1; }
[[ $(cat "$stage/source/.repairroom-netlify-generated") == 'REPAIRROOM isolated Netlify demo' ]]
[[ -f "$stage/source/REPAIRROOM/buchen/index.html" ]]
install -d -m 755 "$site"
cp -R "$stage/source/REPAIRROOM" "$site/"
cp "$stage/source/index.html" "$site/"
chmod -R a+rX "$site"
cat > "$conf" <<'NGINX'
server {
    listen 8080;
    server_name _;
    root /var/www/repairroom-browser-demo;
    index index.html;
    add_header X-Robots-Tag "noindex, nofollow" always;
    location = / { return 302 /REPAIRROOM/; }
    location / { try_files $uri $uri/ =404; }
    location ~ /\. { deny all; }
}
NGINX
if ! nginx -t; then
  rm -f "$conf"
  echo 'Neue Demo-Konfiguration entfernt; vorhandene Konfiguration unverändert.' >&2
  exit 1
fi
systemctl enable --now nginx
systemctl reload nginx
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  ufw allow 8080/tcp comment 'REPAIRROOM browser test demo'
fi
curl --fail --silent http://127.0.0.1:8080/REPAIRROOM/ | grep -q 'BROWSER-DEMO'
curl --fail --silent http://127.0.0.1:8080/REPAIRROOM/buchen/ > /dev/null
printf '\nBrowser-Demo installiert: http://31.70.157.27:8080/REPAIRROOM/\nTestbuchungen nur im Browser; keine echten Zahlungen.\n'
