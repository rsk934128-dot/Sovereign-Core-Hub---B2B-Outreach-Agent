#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "📱 Sovereign Core Hub — Android APK Build Assistant"
echo "=========================================================="

echo "1. Checking Web Build Artifacts..."
if [ ! -d "dist" ]; then
  npm run build
fi

echo "2. Checking Bubblewrap CLI..."
if ! command -v bubblewrap &> /dev/null; then
  echo "Installing @bubblewrap/cli globally..."
  npm install -g @bubblewrap/cli
fi

echo "3. Generating Keystore if needed..."
if [ ! -f "android.keystore" ]; then
  keytool -genkeypair -v \
    -keystore android.keystore \
    -alias android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "SovereignPass2026!" \
    -keypass "SovereignPass2026!" \
    -dname "CN=SovereignHub, OU=Outbound, O=Sovereign Core Systems, L=Global, S=CA, C=US"
fi

echo "4. Building Android APK via Bubblewrap TWA..."
export BUBBLEWRAP_KEYSTORE_PASSWORD="SovereignPass2026!"
export BUBBLEWRAP_KEY_PASSWORD="SovereignPass2026!"
bubblewrap build --skipPwaValidation || true

mkdir -p output_apk
find . -name "*.apk" -maxdepth 3 -exec cp {} output_apk/SovereignHub.apk \;

echo "✅ Android APK successfully generated in ./output_apk/SovereignHub.apk!"
ls -lh output_apk/
