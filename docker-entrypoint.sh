#!/bin/sh
set -e

echo "==> [Dokploy Startup] Memeriksa status Prisma Database Migration..."

# Jika ada migrasi lama yang gagal tercatat di database _prisma_migrations, coba resolve / deploy
if ! npx prisma migrate deploy; then
  echo "==> [Dokploy Startup] migrate deploy mendeteksi kendala, mencoba migrate resolve / db push..."
  npx prisma db push --accept-data-loss || true
fi

echo "==> [Dokploy Startup] Menjalankan SvelteKit Server..."
exec "$@"
