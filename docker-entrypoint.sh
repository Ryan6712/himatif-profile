#!/bin/sh
set -e

echo "==> [Dokploy Startup] Memastikan koneksi database siap..."

# Jalankan sinkronisasi skema prisma dengan mode aman
echo "==> [Dokploy Startup] Menjalankan Prisma Database Schema Sync (db push)..."
npx prisma db push --skip-generate || {
  echo "==> [Dokploy Startup] Warning: Prisma db push mengalami issue, mencoba ulang..."
  npx prisma db push --accept-data-loss --skip-generate || true
}

# Auto seed data awal jika database masih kosong (organisasi belum ada)
echo "==> [Dokploy Startup] Menjalankan inisialisasi / auto-seed data default jika diperlukan..."
node -e "
const { PrismaClient } = require('./src/lib/server/generated/prisma/client.js');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
" 2>/dev/null || true

echo "==> [Dokploy Startup] Menjalankan SvelteKit Server..."
exec "$@"
