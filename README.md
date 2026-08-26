# HIMATIF Profile

Ini adalah proyek *Company Profile* resmi dari **Himpunan Mahasiswa Teknologi Informasi (HIMATIF) ITB Yadika**. Repositori ini menyediakan *showcase* kepada masyarakat publik terkait perkenalan divisi, program kerja (*blogging/news*), dan keanggotaan.

Selain halaman publik, aplikasi ini juga terintegrasi dengan **Admin Dashboard** interaktif untuk mengelola (CRUD) struktur organisasi, anggota, divisi, program kerja, dan unggahan galeri.

## Tech Stack
Proyek ini dibangun di atas teknologi termutakhir:
- **Framework**: SvelteKit (Svelte 5 - Runes Mode)
- **Styling**: Tailwind CSS v4 & Lucide Svelte (Icons)
- **Database & ORM**: MariaDB/MySQL menggunakan **Prisma ORM v7** (via `@prisma/adapter-mariadb`)
- **Autentikasi**: Better-Auth (email/username login session management)
- **Cloud Storage**: Cloudinary (Image Delivery Content)

## 📦 Panduan Instalasi & Pengembangan

Jika Anda ingin menjalankan atau melanjutkan *development* dari aplikasi ini di mesin lokal, silakan ikuti petunjuk di bawah ini.

### 1. Kebutuhan Dasar
- **Node.js** (Versi >= 24)
- **MariaDB** atau **MySQL** (Server database lokal yang berjalan aktif)

### 2. Kloning & Install Dependencies
1. *Clone* repositori ini.
2. Buka terminal pada folder proyek.
3. Jalankan `npm install` untuk menginstal seluruh pustaka yang diperlukan.

### 3. Konfigurasi Environment (Lingkungan)
Gandakan file `.env.example` menjadi `.env` (atau buat file `.env` baru). Lalu lengkapi variabel berikut ini agar aplikasi bisa terhubung ke database dan cloud.

```ini
# --- DATABASE KONEKSI ---
DATABASE_URL="mysql://root:PASSWORD_ANDA@localhost:3306/himatif_profile"
DATABASE_USER="root"
DATABASE_PASSWORD="PASSWORD_ANDA"
DATABASE_NAME="himatif_profile"
DATABASE_HOST="localhost"
DATABASE_PORT="3306"

# --- BETTER-AUTH SECRETS ---
# (Wajib ada untuk menjaga keamanan session admin, cukup generate random string)
BETTER_AUTH_SECRET="random_string_generator"
BETTER_AUTH_URL="http://localhost:5173"

# --- CLOUDINARY API ---
# (Wajib ada untuk mengunggah logo, cover divisi, dll)
CLOUDINARY_CLOUD_NAME="my_cloud_id"
CLOUDINARY_API_KEY="00000000"
CLOUDINARY_API_SECRET="Aaa_BBB"
```

### 4. Database Setup & Prisma Migration
Sebelum menjalankan *server*, skema database lokal Anda perlu disamakan dengan Prisma.
1. Tarik (Push) struktur tabel `schema.prisma` ke database:
   ```bash
   npx prisma db push
   ```
2. Anda disarankan melakukan inisiasi (*Seeding*) data *dummy* agar halaman tidak kosong melompong (termasuk membuat akun admin).
   ```bash
   npm run db:seed
   ```
   > **Note:** Seed di atas akan meng-*generate* akses akun administrator.
   > **Username:** admin
   > **Password:** admin123

### 5. Menjalankan *Development Server*
Setelah environment dikonfigurasikan dengan benar dan database telah disuntik skema, mulai *server* lokal Anda:

```bash
npm run dev
```

Kunjungi:
- `http://localhost:5173/` - Untuk laman **Public Company Profile**.
- `http://localhost:5173/admin/login` - Untuk akses ke laman **Admin Dashboard**.

## 📝 Design Pattern Guideline
Apabila Anda berkontribusi pada pengembangan aplikasi (UI/UX), proyek ini berjalan dengan prinsip *Glassmorphism* dan hierarki *tailwind stack*. **Wajib membaca panduan di `docs/design-pattern.md`** sebelum Anda mengeksekusi penambahan gaya CSS agar harmonisasi komponen tidak pecah.

---
Dibuat dengan ❤️ oleh Devisi DBM - HIMATIF ITB Yadika.
