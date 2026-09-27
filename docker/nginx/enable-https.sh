#!/bin/sh
# HTTPS is served only when certificates are mounted: phones on the LAN need a secure context
# for the service worker and Web Crypto, as on GitHub Pages.
set -e
if [ -f /etc/nginx/certs/cert.pem ] && [ -f /etc/nginx/certs/key.pem ]; then
  cp /etc/nginx/site/https.conf /etc/nginx/conf.d/https.conf
  echo "enable-https: serving HTTPS on 8443"
else
  echo "enable-https: no certificates in /etc/nginx/certs, HTTP only"
fi
