#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/stunttech.crt"
KEY_FILE="$CERT_DIR/stunttech.key"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/CN=stunttech.ru" \
    -addext "subjectAltName=DNS:stunttech.ru,DNS:www.stunttech.ru,IP:193.187.93.110,IP:127.0.0.1"
fi
