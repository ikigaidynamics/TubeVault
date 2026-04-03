#!/bin/bash
# TubeVault Deploy Script
# Pushes local source to server, builds, and restarts

set -e

SSH="/c/Windows/System32/OpenSSH/ssh.exe"
SCP="/c/Windows/System32/OpenSSH/scp.exe"
SERVER="root@46.225.139.82"
REMOTE_DIR="/opt/tubevault"

echo "=== TubeVault Deployment ==="
echo ""

# Step 1: Upload .env.local as .env on server
if [ -f .env.local ]; then
  echo "[1/5] Uploading .env.local -> .env..."
  $SCP -q .env.local "$SERVER:$REMOTE_DIR/.env"
else
  echo "[1/5] No local .env.local found, skipping..."
fi

# Step 2: Upload source files
echo "[2/5] Uploading source files..."
$SCP -q -r app components lib public "$SERVER:$REMOTE_DIR/"
$SCP -q package.json package-lock.json next.config.mjs tailwind.config.ts tsconfig.json postcss.config.mjs "$SERVER:$REMOTE_DIR/"

# Step 3: Install dependencies
echo "[3/5] Installing dependencies..."
$SSH "$SERVER" "cd $REMOTE_DIR && npm install"

# Step 4: Build Next.js
echo "[4/5] Building Next.js app..."
$SSH "$SERVER" "cd $REMOTE_DIR && npm run build"

# Step 5: Restart PM2
echo "[5/5] Restarting PM2..."
$SSH "$SERVER" "cd $REMOTE_DIR && pm2 restart tubevault"

echo ""
echo "=== Deployment complete ==="
echo "Site: https://tubevault.io"
