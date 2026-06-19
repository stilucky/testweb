#!/bin/bash
# Lunelle — npm deploy script (no Docker)
# Usage: ./deploy.sh
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="lunelle"

echo "━━━ Lunelle Deploy ━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Pull latest code
echo "▸ Pulling latest code..."
git pull origin main

# Install dependencies
echo "▸ Installing dependencies..."
npm ci --omit=dev=false

# Build production bundle
echo "▸ Building..."
npm run build

# Restart / start with PM2
echo "▸ Restarting app with PM2..."
if pm2 list | grep -q "$APP_NAME"; then
  pm2 restart "$APP_NAME"
else
  pm2 start npm --name "$APP_NAME" -- start
  pm2 save
fi

echo ""
echo "✓ Deploy complete → https://lunellestory.ca"
