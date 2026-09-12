#!/usr/bin/env bash
# Generates self-signed SSL certificates with SAN for local development & LAN access

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "${DIR}/certs"

IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")

echo "Generating SSL certificate for IP: ${IP}, 127.0.0.1, localhost..."

openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 3650 \
  -keyout "${DIR}/certs/key.pem" \
  -out "${DIR}/certs/cert.pem" \
  -subj "/CN=${IP}/O=telcA1/C=DE" \
  -addext "subjectAltName=IP:${IP},IP:127.0.0.1,DNS:localhost"

echo "Certificates successfully generated in ${DIR}/certs/"
