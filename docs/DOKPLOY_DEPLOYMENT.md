# 🚀 Dokploy Deployment Guide: Single Compose Stack

Panduan deployment satu kesatuan (**1 Compose Stack**: Aplikasi SvelteKit + Database MariaDB + Custom Docker Registry) di **Dokploy**.

---

## 🛠️ Arsitektur 1 Compose Stack

Di Dokploy, Anda dapat mendeploy seluruh sistem sebagai satu service tipe **Compose**:
```
┌─────────────────────────────────────────────────────────────┐
│                    DOKPLOY COMPOSE STACK                    │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   himatif_app (Web)   │──────>│   himatif_db (MariaDB)│  │
│  │   Port: 3000          │       │   Port: 3306 (Internal│  │
│  └───────────────────────┘       └───────────────────────┘  │
│              │                               │              │
│              ▼                               ▼              │
│       Traefik Ingress                 Volume: db_data       │
│    (https://domain.com)              (Persistent Storage)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 1. Cara Deploy Menggunakan Tipe "Compose" di Dokploy

Dokploy memiliki fitur deployment bawaan **Compose Application**:

1. **Buka Dokploy Dashboard**: Masuk ke Project Anda.
2. **Create Service**: Pilih **Compose**.
3. **Pilih Sumber (Source)**:
   - **Opsi A (Direct Git / GitHub Repository)**:
     Hubungkan ke repositori GitHub ini, Dokploy akan otomatis membaca `docker-compose.yml` dan melakukan build container `app` secara lokal di VPS.
   - **Opsi B (Docker Image dari Custom Registry)**:
     Gunakan `docker-compose.yml` dengan image yang di-push oleh GitHub Actions.
4. **Isi Environment Variables di Dokploy**:
   Buka tab **Environment** pada Compose Application dan masukkan isi konfigurasi:
   ```ini
   # Database
   DATABASE_USER=himatif
   DATABASE_PASSWORD=rahasia_password_db_anda
   DATABASE_NAME=himatif_profile
   DATABASE_PORT=3306
   DATABASE_HOST=db
   DATABASE_URL=mysql://himatif:rahasia_password_db_anda@db:3306/himatif_profile

   # Auth & Domain
   BETTER_AUTH_SECRET=string_acak_minimal_32_karakter_openssl
   BETTER_AUTH_URL=https://himatif.domainanda.com
   ORIGIN=https://himatif.domainanda.com

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=cloud_id_anda
   CLOUDINARY_API_KEY=000000000000
   CLOUDINARY_API_SECRET=rahasia_cloudinary

   # Registry & Image (Jika menggunakan CI/CD Image)
   IMAGE_NAME=registry.example.com/himatif-profile
   IMAGE_TAG=latest
   ```
5. **Konfigurasi Domain & Routing (Traefik)**:
   - Di tab **Domains**, tambahkan domain Anda (misal: `himatif.domainanda.com`).
   - Arahkan ke service: **`app`** pada port **`3000`**.
   - Aktifkan **HTTPS / Let's Encrypt**.
6. **Klik Deploy**.

---

## 🔄 2. Integrasi CI/CD Otomatis (GitHub Actions ke Dokploy Compose)

File `.github/workflows/dokploy-ci-cd.yml` otomatis membangun image dan memicu deploy webhook Dokploy:

1. **GitHub Secrets yang Diperlukan**:
   - `REGISTRY_URL`: `registry.domainanda.com` / `ghcr.io`
   - `REGISTRY_USERNAME`: Username registry
   - `REGISTRY_PASSWORD`: Password / access token registry
   - `IMAGE_NAME`: `registry.domainanda.com/himatif-profile`
   - `DOKPLOY_WEBHOOK_URL`: Webhook URL dari tab **Deployments** pada Compose Dokploy.

2. **Alur Otomatis**:
   - Saat push ke `main`, GitHub Actions mem-build image Docker dan mengunggahnya ke Custom Registry.
   - GitHub Actions memanggil Webhook Dokploy.
   - Dokploy akan menjalankan `docker compose pull` dan me-restart container `app` dengan image terbaru tanpa mematikan data database.

---

## 🗄️ 3. Status Database & Auto-Migration

1. **Auto-Generate Tabel**: 
   - **Otomatis!** `Dockerfile` telah dilengkapi `docker-entrypoint.sh` yang mengeksekusi `npx prisma migrate deploy` secara otomatis setiap kali container aplikasi menyala setelah database MariaDB berstatus *healthy*.
   - Tabel `user`, `session`, `account`, `devisi`, `member`, `proker`, dan `organization` akan langsung terbuat tanpa perlu mengetik perintah apapun.

2. **Inisialisasi Akun Admin (Database Seeding)**:
   - Jika Anda baru pertama kali deploy dan ingin membuat akun admin bawaan (`admin` / `admin123`):
   - Buka tab **Terminal / Console** pada service `app` di Dokploy Dashboard, lalu jalankan:
     ```bash
     npm run db:seed
     ```
