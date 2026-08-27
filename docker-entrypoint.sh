#!/bin/sh
set -e

echo "==> [Dokploy Startup] Menjalankan Sinkronisasi Skema Database Prisma (db push)..."
npx prisma db push --accept-data-loss

echo "==> [Dokploy Startup] Menjalankan SvelteKit Server..."
exec "$@"
