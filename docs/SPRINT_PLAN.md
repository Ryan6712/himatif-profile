# HIMATIF Profile - Sprint Plan

> Web profile HIMATIF ITB Yadika Bangil dengan Admin Dashboard
> Stack: SvelteKit 2 + Svelte 5, Prisma 7, Better Auth, Tailwind CSS v4, MariaDB

---

## Status Saat Ini

### Yang Sudah Selesai
- Database MySQL + Prisma 7 schema (Organization, Devisi, Member, Proker, User/Session/Account/Verification)
- Better Auth configured (email/password + username plugin)
- Hooks terintegrasi dengan better-auth handler
- Auth client di frontend
- Halaman public (Home, Devisi, Member, Proker) -- masih pakai static JSON
- Component library (Navbar, Footer, MemberCards)
- Design system (glassmorphism, design tokens, Nunito font)
- Dependencies terinstall (Prisma, better-auth, marked, lucide-svelte)

### Critical Issues yang Harus Diperbaiki
1. `src/types/index.ts` - Export `AdminAccount` yang sudah tidak ada di schema (akan error)
2. `src/app.d.ts` - `Locals.admin.id` bertipe `number`, padahal User better-auth pakai `String`
3. `src/hooks.server.ts` - Tidak inject session ke `event.locals`
4. Layout duplikat - `(public)/+layout.svelte` duplikasi root `+layout.svelte` (Navbar/Footer render 2x)
5. Utility files kosong - `slug.ts` dan `markdown.ts`
6. Proker detail route static (`/proker/proker-detail`) bukan dynamic (`/proker/[slug]`)

---

## Sprint 1: Foundation Fixes & Data Migration
> Perbaiki fondasi yang broken + migrasi data dari JSON ke database
> Estimasi: 1-2 hari

### 1.1 Fix Critical Issues

- [ ] **Fix `src/types/index.ts`**
  - Hapus export `AdminAccount` (model sudah di-drop)
  - Tambah export `User`, `Session`, `Account` dari Prisma types
  - Review semua custom types (`ApiResponse`, `PaginationParams`, `ValidationResult`)

- [ ] **Fix `src/app.d.ts`**
  - Update `Locals` interface sesuai better-auth User model:
    ```ts
    interface Locals {
      user?: { id: string; name: string; email: string; username?: string; };
      session?: { id: string; expiresAt: Date; };
    }
    ```

- [ ] **Fix `src/hooks.server.ts`**
  - Tambahkan session resolution setelah better-auth handler
  - Inject `user` dan `session` ke `event.locals` menggunakan `auth.api.getSession()`
  - Contoh pattern:
    ```ts
    export const handle: Handle = async ({ event, resolve }) => {
      const session = await auth.api.getSession({ headers: event.request.headers });
      event.locals.user = session?.user ?? undefined;
      event.locals.session = session?.session ?? undefined;
      return svelteKitHandler({ event, resolve, auth, building });
    };
    ```

- [ ] **Fix Layout Duplikat**
  - Hapus Navbar dan Footer dari `(public)/+layout.svelte`
  - Biarkan root `+layout.svelte` yang handle Navbar/Footer
  - Atau: Pindahkan Navbar/Footer ke group layout saja dan bersihkan root layout

- [ ] **Implement `src/lib/utils/slug.ts`**
  - Fungsi `generateSlug(title: string): string` -- buat slug dari title
  - Handle special chars, spasi -> dash, lowercase

- [ ] **Implement `src/lib/utils/markdown.ts`**
  - Setup `marked` dengan konfigurasi yang aman (sanitize)
  - Export fungsi `parseMarkdown(content: string): string`

### 1.2 Seed Script & Data Migration

- [ ] **Buat seed script `prisma/seed.ts`**
  - Migrasi data dari `static/data/devisi.json` ke tabel `Devisi`
  - Migrasi data dari `static/data/member.json` ke tabel `Member`
    - Map `bph` -> `MemberType.BPH`
    - Map `kadiv` -> `MemberType.KADIV`
    - Map `member` -> `MemberType.REGULAR` atau `MemberType.ALUMNI` (sesuai data)
    - Relasikan member ke devisi yang sesuai
  - Migrasi data dari `static/data/proker.json` ke tabel `Proker`
    - Generate slug dari title
    - Handle tanggal "Upcoming" (set sebagai null di `publishedAt` atau tanggal masa depan)
  - Seed data `Organization` (visi, misi, tujuan dari yang di-hardcode di homepage)
  - Seed admin user pertama via better-auth API

- [ ] **Update `prisma.config.ts`** atau `package.json` untuk seed command

- [ ] **Jalankan seed & verifikasi data masuk ke database**

### 1.3 Switch Public Pages ke Database

- [ ] **Buat server load functions** (ganti `+page.ts` jadi `+page.server.ts`):
  - `(public)/+page.server.ts` -- Load Organization data dari DB
  - `(public)/devisi/+page.server.ts` -- Load semua Devisi dari DB
  - `(public)/member/+page.server.ts` -- Load Members grouped by MemberType dari DB
  - `(public)/proker/+page.server.ts` -- Load Proker list dari DB (yang sudah published)

- [ ] **Buat dynamic route `/proker/[slug]`**
  - `(public)/proker/[slug]/+page.server.ts` -- Load single Proker by slug
  - `(public)/proker/[slug]/+page.svelte` -- Render proker detail dengan markdown content
  - Hapus route static `proker/proker-detail/`

- [ ] **Update semua `+page.svelte`** untuk pakai data dari load function (bukan fetch JSON)

- [ ] **Update homepage** untuk render visi/misi/tujuan dari database bukan hardcoded

### Deliverable Sprint 1
- Semua critical issues fixed
- Data sudah di database
- Public pages baca dari database
- Dynamic route proker/[slug] berfungsi

---

## Sprint 2: Auth Flow & Admin Layout
> Implementasi login page dan admin dashboard skeleton
> Estimasi: 1-2 hari

### 2.1 Auth Pages

- [ ] **Buat halaman login `/admin/login`**
  - `src/routes/admin/login/+page.svelte`
  - Form: email/username + password
  - Gunakan `authClient.signIn.email()` atau `authClient.signIn.username()`
  - Handle error states (wrong credentials, network error)
  - Redirect ke `/admin` setelah login berhasil
  - Styling konsisten dengan design system (glassmorphism)

- [ ] **Buat auth guard untuk routes admin**
  - `src/routes/admin/+layout.server.ts`
  - Cek `event.locals.user` -- redirect ke `/admin/login` kalau belum login
  - Pass user data ke layout

### 2.2 Admin Layout & Dashboard

- [ ] **Buat admin layout `src/routes/admin/+layout.svelte`**
  - Sidebar navigation (collapsible di mobile)
  - Menu items: Dashboard, Organisasi, Divisi, Anggota, Program Kerja
  - Header dengan info user + logout button
  - Design: clean, professional, bisa pakai design tokens yang ada

- [ ] **Buat dashboard page `/admin`**
  - `src/routes/admin/+page.server.ts` -- Load summary stats
  - `src/routes/admin/+page.svelte`
  - Tampilkan summary cards:
    - Total Divisi
    - Total Anggota
    - Total Program Kerja
    - Program Kerja terbaru

- [ ] **Implementasi logout**
  - Tombol logout di admin header
  - Panggil `authClient.signOut()`
  - Redirect ke `/admin/login`

### Deliverable Sprint 2
- Admin bisa login/logout
- Admin dashboard dengan summary stats
- Route protection (unauthorized redirect)
- Admin layout dengan sidebar navigation

---

## Sprint 3: CRUD - Organisasi & Divisi
> CRUD operations untuk data Organisasi dan Divisi
> Estimasi: 2-3 hari

### 3.1 API Routes

- [ ] **Buat API structure convention**
  - Putuskan pattern: SvelteKit form actions vs REST API endpoints (`+server.ts`)
  - Rekomendasi: Gunakan **form actions** untuk mutations (lebih SvelteKit-idiomatic, progressive enhancement)

### 3.2 Organisasi Management (Singleton)

- [ ] **`/admin/organisasi` -- Edit Organization**
  - `+page.server.ts`:
    - `load`: Fetch Organization dari DB
    - `actions.update`: Update Organization data
  - `+page.svelte`:
    - Form edit: nama, namaLengkap, visi (textarea), misi (textarea), tujuan (textarea)
    - Logo upload fields (logoSmallUrl, logoBigUrl) -- untuk sekarang bisa input URL manual
    - Submit via form action
    - Toast/notification setelah save berhasil

### 3.3 Divisi CRUD

- [ ] **`/admin/divisi` -- List Divisi**
  - `+page.server.ts`: Load semua divisi dengan member count
  - `+page.svelte`: Table/list view dengan actions (edit, delete)
  - Tombol "Tambah Divisi"

- [ ] **`/admin/divisi/tambah` -- Create Divisi**
  - `+page.server.ts` dengan form action `create`
  - `+page.svelte`: Form (nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi)
  - Validasi: nama unik
  - Redirect ke list setelah berhasil

- [ ] **`/admin/divisi/[id]/edit` -- Edit Divisi**
  - `+page.server.ts`: Load divisi by id + form action `update`
  - `+page.svelte`: Form pre-filled dengan data existing
  - Validasi: nama unik (exclude current)

- [ ] **Delete Divisi**
  - Form action di list page atau confirmation modal
  - Handle cascade: apa yang terjadi dengan member yang terkait? (currently SetNull)

### 3.4 Reusable Form Components

- [ ] **Buat reusable components:**
  - `FormField.svelte` -- Label + input + error message
  - `TextArea.svelte` -- Label + textarea + error message
  - `FormButton.svelte` -- Submit button dengan loading state
  - `Toast.svelte` -- Notification component
  - `ConfirmDialog.svelte` -- Konfirmasi sebelum delete
  - `DataTable.svelte` -- Reusable table component (opsional)

### Deliverable Sprint 3
- Organization data bisa di-edit dari dashboard
- Full CRUD Divisi (Create, Read, Update, Delete)
- Reusable form components

---

## Sprint 4: CRUD - Anggota
> CRUD operations untuk data Anggota/Member
> Estimasi: 2 hari

### 4.1 Member CRUD

- [ ] **`/admin/anggota` -- List Anggota**
  - `+page.server.ts`: Load semua member dengan relasi devisi
  - `+page.svelte`:
    - Table view: Nama, Tipe (BPH/KADIV/REGULAR/ALUMNI), Divisi, Foto
    - Filter by MemberType
    - Filter by Divisi
    - Search by nama
    - Pagination
    - Actions: edit, delete

- [ ] **`/admin/anggota/tambah` -- Create Anggota**
  - `+page.server.ts`: Load list divisi untuk dropdown + form action `create`
  - `+page.svelte`:
    - Form: name, imageUrl, memberType (dropdown/select), devisi (dropdown, optional)
    - Validasi: nama unik
    - MemberType select: BPH, KADIV, REGULAR, ALUMNI

- [ ] **`/admin/anggota/[id]/edit` -- Edit Anggota**
  - `+page.server.ts`: Load member + list divisi + form action `update`
  - `+page.svelte`: Form pre-filled

- [ ] **Delete Anggota**
  - Confirmation dialog sebelum delete
  - Bisa bulk delete? (nice to have)

### Deliverable Sprint 4
- Full CRUD Anggota dengan filter dan search
- Relasi member-divisi berfungsi di form (dropdown divisi)
- Pagination di list view

---

## Sprint 5: CRUD - Program Kerja (Blog System)
> CRUD operations untuk Program Kerja dengan sistem blog
> Estimasi: 2-3 hari

### 5.1 Proker CRUD

- [ ] **`/admin/proker` -- List Proker**
  - `+page.server.ts`: Load semua proker
  - `+page.svelte`:
    - Table view: Title, Tanggal, Status (Draft/Published), Slug
    - Filter by status (published vs draft -- based on `publishedAt`)
    - Sort by date
    - Pagination
    - Actions: edit, delete, toggle publish

- [ ] **`/admin/proker/tambah` -- Create Proker**
  - `+page.server.ts`: Form action `create`
  - `+page.svelte`:
    - Form: title, date, thumbnailUrl, description (short), content (markdown editor)
    - Auto-generate slug dari title (editable)
    - Markdown editor: textarea dengan preview panel (gunakan `marked`)
    - Pilihan: Save as Draft atau Publish langsung
    - Validasi: title unik, slug unik

- [ ] **`/admin/proker/[id]/edit` -- Edit Proker**
  - `+page.server.ts`: Load proker + form action `update`
  - `+page.svelte`: Form pre-filled, markdown editor dengan preview
  - Bisa publish/unpublish dari sini

- [ ] **Delete Proker**
  - Confirmation dialog

### 5.2 Markdown Editor Component

- [ ] **Buat `MarkdownEditor.svelte`**
  - Split view: editor (textarea) + live preview
  - Toolbar: bold, italic, heading, link, image, list (nice to have)
  - Gunakan `marked` untuk render preview
  - Responsive (tab switch di mobile, split di desktop)

### 5.3 Update Public Proker Page

- [ ] **Update `(public)/proker/[slug]/+page.svelte`**
  - Render markdown content dengan `marked`
  - Styling dengan `@tailwindcss/typography` (prose classes)
  - Meta info: title, date, thumbnail
  - Navigasi: back to list

### Deliverable Sprint 5
- Full CRUD Program Kerja
- Markdown editor dengan live preview
- Publish/Draft system
- Public proker detail page render markdown dengan baik

---

## Sprint 6: File Upload & Image Management
> Sistem upload gambar untuk logo, foto member, thumbnail proker
> Estimasi: 1-2 hari

### 6.1 Pilih Storage Strategy

- [ ] **Tentukan storage solution:**
  - **Opsi A: Local filesystem** (`static/uploads/`) -- Simpel, tapi tidak persist di Netlify
  - **Opsi B: Cloud storage** (Cloudinary, UploadThing, S3) -- Recommended untuk production
  - **Opsi C: Base64 di database** -- Tidak recommended untuk gambar besar

  > Rekomendasi: **Cloudinary** (free tier 25GB) atau **UploadThing** (free tier 2GB)

### 6.2 Implementasi Upload

- [ ] **Buat upload API endpoint**
  - `src/routes/api/upload/+server.ts`
  - Handle multipart form data
  - Validasi: file type (image only), file size limit
  - Upload ke chosen storage
  - Return URL

- [ ] **Buat `ImageUpload.svelte` component**
  - Drag & drop zone atau click to select
  - Image preview sebelum upload
  - Progress indicator
  - Return URL setelah upload selesai

- [ ] **Update semua form** yang ada field URL gambar
  - Ganti input URL manual dengan `ImageUpload` component
  - Organization: logo upload
  - Divisi: logo + thumbnail upload
  - Member: foto upload
  - Proker: thumbnail upload

### Deliverable Sprint 6
- Upload gambar berfungsi
- Semua form pakai image upload component
- Gambar tersimpan di cloud storage

---

## Sprint 7: Polish & Production Readiness
> Final polish, security, dan persiapan deploy
> Estimasi: 2-3 hari

### 7.1 Security

- [ ] **Rate limiting** pada login endpoint
- [ ] **CSRF protection** (SvelteKit sudah handle sebagian, tapi review)
- [ ] **Input validation & sanitization** di semua form actions
  - Gunakan library seperti `zod` untuk schema validation
- [ ] **Sanitize markdown output** (prevent XSS dari user-generated content)
- [ ] **Review auth middleware** -- pastikan semua `/admin/*` routes terproteksi

### 7.2 UX Polish

- [ ] **Loading states** di semua form dan data fetch
- [ ] **Error handling** yang user-friendly di semua pages
- [ ] **Toast/notification system** untuk feedback CRUD operations
- [ ] **Responsive design review** -- pastikan admin dashboard works di mobile
- [ ] **Breadcrumb navigation** di admin pages
- [ ] **Empty states** -- tampilan saat belum ada data

### 7.3 SEO & Meta

- [ ] **Update favicon** dari default Svelte ke logo HIMATIF
- [ ] **Meta tags** di setiap public page (title, description, og:image)
- [ ] **Sitemap** generation (nice to have)

### 7.4 Deployment

- [ ] **Review adapter** -- Netlify adapter sudah terpasang, pastikan kompatibel dengan:
  - Server-side rendering (SSR) untuk public pages
  - API routes / form actions
  - Environment variables di Netlify dashboard
- [ ] **Setup environment variables di Netlify**
  - `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL`
  - Cloud storage credentials (jika pakai)
- [ ] **Database hosting** -- Pastikan MySQL/MariaDB accessible dari Netlify (PlanetScale, Railway, Aiven, dll)
- [ ] **Test build & deploy**
- [ ] **Hapus static JSON files** setelah semua sudah pakai database
- [ ] **Hapus library packaging config** dari `package.json` (svelte-package, exports, files) jika ini murni app bukan library

### 7.5 Testing (Nice to Have)

- [ ] **Unit tests** untuk utility functions (slug, markdown)
- [ ] **Integration tests** untuk API/form actions
- [ ] **E2E tests** untuk critical flows (login, CRUD)

### Deliverable Sprint 7
- Production-ready application
- Secure authentication flow
- Polished UX
- Deployed dan bisa diakses publik

---

## Ringkasan Sprint

| Sprint | Fokus | Estimasi | Prioritas |
|--------|-------|----------|-----------|
| **Sprint 1** | Foundation Fixes & Data Migration | 1-2 hari | CRITICAL |
| **Sprint 2** | Auth Flow & Admin Layout | 1-2 hari | HIGH |
| **Sprint 3** | CRUD Organisasi & Divisi | 2-3 hari | HIGH |
| **Sprint 4** | CRUD Anggota | 2 hari | HIGH |
| **Sprint 5** | CRUD Program Kerja (Blog) | 2-3 hari | HIGH |
| **Sprint 6** | File Upload & Image Management | 1-2 hari | MEDIUM |
| **Sprint 7** | Polish & Production Readiness | 2-3 hari | MEDIUM |

**Total Estimasi: 11-17 hari kerja**

---

## Catatan Arsitektur

### Pattern yang Direkomendasikan

1. **Form Actions vs API Routes**
   - Gunakan **SvelteKit form actions** untuk semua CRUD mutations
   - Progressive enhancement: form tetap berfungsi tanpa JavaScript
   - Gunakan `+server.ts` API hanya untuk upload file dan operasi yang butuh fetch API

2. **Data Loading**
   - Selalu gunakan `+page.server.ts` (bukan `+page.ts`) untuk data yang butuh database
   - Jangan expose database credentials ke client

3. **Validation**
   - Validasi di server-side (form actions) wajib
   - Validasi di client-side opsional (nice UX tapi bukan security measure)

4. **Error Handling**
   - Gunakan SvelteKit `fail()` untuk form validation errors
   - Gunakan `error()` untuk 404/403/500

5. **File Structure**
   ```
   src/routes/
     (public)/          -- Halaman publik (tanpa auth)
       +layout.svelte
       +page.svelte     -- Homepage
       devisi/
       member/
       proker/
         [slug]/
     admin/
       +layout.server.ts  -- Auth guard
       +layout.svelte     -- Admin layout (sidebar)
       +page.svelte       -- Dashboard
       login/
       organisasi/
       divisi/
         tambah/
         [id]/edit/
       anggota/
         tambah/
         [id]/edit/
       proker/
         tambah/
         [id]/edit/
   ```
