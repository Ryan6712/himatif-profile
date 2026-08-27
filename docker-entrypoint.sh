#!/bin/sh
set -e

echo "==> [Dokploy Startup] Menjalankan Prisma Database Migration..."
npx prisma migrate deploy

echo "==> [Dokploy Startup] Menjalankan SvelteKit Server..."
exec "$@"
