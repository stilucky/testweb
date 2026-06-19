#!/bin/bash
# Lunelle — zero-downtime deploy script
# Usage: ./deploy.sh
set -e

echo "━━━ Lunelle Deploy ━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Pull latest code
echo "▸ Pulling latest code..."
git pull origin main

# Build new image
echo "▸ Building Docker image..."
docker compose build --no-cache app

# Restart app (nginx stays running — zero downtime)
echo "▸ Restarting app container..."
docker compose up -d --no-deps app

# Remove dangling images
echo "▸ Cleaning up old images..."
docker image prune -f

echo ""
echo "✓ Deploy complete → https://lunellestory.ca"
