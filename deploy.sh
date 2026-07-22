#!/bin/bash
# Lunelle — npm deploy script (no Docker)
# Usage: ./deploy.sh
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="lunelle"

echo "━━━ Lunelle Deploy ━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Source env files so ecosystem.config.cjs inherits SMTP vars via process.env
# Next.js standalone (node server.js) does NOT load .env files automatically
set -o allexport
[ -f "$APP_DIR/.env.production" ]       && source "$APP_DIR/.env.production"
[ -f "$APP_DIR/.env.production.local" ] && source "$APP_DIR/.env.production.local"
set +o allexport

# Pull latest code
echo "▸ Pulling latest code..."
git pull origin main

# Install dependencies
echo "▸ Installing dependencies..."
npm ci --omit=dev=false

# Build production bundle
echo "▸ Building..."
npm run build

mkdir -p public/uploads

# Standalone output does not include static/public assets by default.
# Keep the runtime bundle in sync with the latest build.
echo "Syncing standalone assets..."
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -r public .next/standalone/public
mkdir -p .next/standalone/public/uploads

# Restart / start with PM2 using ecosystem config (carries env vars)
echo "▸ Restarting app with PM2..."
if [ -f "$APP_DIR/ecosystem.config.cjs" ]; then
  pm2 startOrRestart "$APP_DIR/ecosystem.config.cjs" --update-env
else
  if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME"
  else
    pm2 start npm --name "$APP_NAME" -- start
  fi
fi
pm2 save

echo ""
echo "✓ Deploy complete → https://lunellestory.ca"
