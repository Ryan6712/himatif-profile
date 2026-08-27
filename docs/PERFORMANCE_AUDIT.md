# Performance Audit Report — HIMATIF Profile

> **Tanggal Audit:** 26 Agustus 2026
> **Stack:** SvelteKit 2 + Svelte 5 (Runes) | Vite 8 | Prisma ORM v7 + MariaDB | Tailwind CSS v4 | Cloudinary | Better-Auth | TipTap v3
> **Deployment:** Netlify (adapter-netlify)
> **Metode:** Static code inspection (tanpa runtime profiling)

---

## Daftar Isi

- [Ringkasan Eksekutif](#ringkasan-eksekutif)
- [Severity Scale](#severity-scale)
- [1. Database & Prisma](#1-database--prisma)
- [2. Svelte Component & Rendering](#2-svelte-component--rendering)
- [3. Image & Asset Handling](#3-image--asset-handling)
- [4. Server-Side Data Loading](#4-server-side-data-loading)
- [5. Build, Bundle & Configuration](#5-build-bundle--configuration)
- [6. Caching & Network](#6-caching--network)
- [Prioritas Perbaikan](#prioritas-perbaikan)
- [Catatan Metodologi](#catatan-metodologi)

---

## Ringkasan Eksekutif

Ditemukan **48 performance issue** dari seluruh codebase melalui static code inspection. Issue dikelompokkan menjadi 6 kategori:

| Kategori | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Database & Prisma | - | 2 | 4 | 5 | 11 |
| Svelte Components | 1 | 3 | 5 | 4 | 13 |
| Image & Assets | 2 | 5 | 3 | 4 | 14 |
| Server-Side Loading | - | 2 | 3 | - | 5 |
| Build & Config | - | - | 3 | 2 | 5 |
| Caching & Network | - | - | 2 | 2 | 4 |

**Top 5 yang harus diprioritaskan:**
1. Favicon SVG 592 KB (setiap page load)
2. Prisma Client tanpa singleton (connection leak saat dev)
3. TipTap editor tidak lazy-loaded (~200KB+ eager load)
4. Semua image tanpa `loading="lazy"` dan tanpa `width`/`height`
5. Auth check dijalankan di setiap request termasuk public pages

---

## Severity Scale

| Level | Definisi |
|-------|----------|
| **Critical** | Berdampak langsung pada setiap user visit, measurable degradation |
| **High** | Berdampak signifikan pada loading time atau resource usage |
| **Medium** | Berdampak moderate, terasa pada skala atau kondisi tertentu |
| **Low** | Minor improvement, best practice compliance |

---

## 1. Database & Prisma

### DB-01: Prisma Client Tanpa Singleton Pattern [HIGH]

**File:** `src/lib/server/db.ts:6-16`

```ts
const adapter = new PrismaMariaDb({ ... });
const prisma = new PrismaClient({ adapter });
export { prisma };
```

**Masalah:** Setiap kali Vite dev server melakukan hot-reload, module ini dieksekusi ulang dan membuat instance `PrismaClient` baru beserta connection pool MariaDB baru. Instance lama tidak pernah di-close, menyebabkan **connection leak** hingga limit `max_connections` MariaDB tercapai.

**Rekomendasi:**
```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
```

---

### DB-02: Public Proker List — Tanpa Pagination, Overfetch LongText [HIGH]

**File:** `src/routes/(public)/proker/+page.server.ts:5-9`

```ts
const prokerList = await prisma.proker.findMany({
    orderBy: { date: 'asc' },
});
```

**Masalah:**
1. **Tanpa pagination** — mengambil seluruh row dari tabel proker
2. **Overfetch** — kolom `content` bertipe `@db.LongText` (hingga 4GB per row) ikut terambil padahal halaman listing hanya butuh judul, thumbnail, dan deskripsi singkat
3. **Tanpa filter published** — proker draft ikut ditampilkan ke public

**Rekomendasi:**
```ts
const page = Number(url.searchParams.get('page')) || 1;
const limit = 12;

const [prokerList, totalCount] = await Promise.all([
    prisma.proker.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
            id: true, title: true, slug: true,
            date: true, thumbnailUrl: true,
            description: true, publishedAt: true,
        },
    }),
    prisma.proker.count({ where: { publishedAt: { not: null } } }),
]);
```

---

### DB-03: Double Session Resolution Per Request [MEDIUM]

**File:** `src/hooks.server.ts:6-17`

```ts
const session = await auth.api.getSession({ headers: event.request.headers }); // Query 1
// ...
return svelteKitHandler({ event, resolve, auth, building }); // Query 2 (internal)
```

**Masalah:** `auth.api.getSession()` melakukan query ke database untuk validasi session token. Kemudian `svelteKitHandler` secara internal juga melakukan resolusi session. Session table di-query **2x per request**.

**Rekomendasi:** Gunakan hanya `svelteKitHandler` dan akses session melalui load function yang membutuhkannya, atau pass pre-resolved session jika Better-Auth mendukungnya.

---

### DB-04: Sequential Delete Pattern (Find-then-Act) [MEDIUM]

**Files:**
- `src/routes/admin/dashboard/proker/+page.server.ts:64-68`
- `src/routes/admin/dashboard/member/+page.server.ts:68-74`
- `src/routes/admin/dashboard/devisi/+page.server.ts:24-30`

```ts
const proker = await prisma.proker.findUnique({ where: { id } }); // Query 1
if (!proker) return fail(404, ...);
await prisma.proker.delete({ where: { id } });                    // Query 2
```

**Masalah:** 2 query sequential dimana 1 sudah cukup. Ada juga TOCTOU race condition — row bisa dihapus antara find dan delete.

**Rekomendasi:**
```ts
try {
    const deleted = await prisma.proker.delete({
        where: { id },
        select: { title: true },
    });
    return { success: true, message: `"${deleted.title}" berhasil dihapus` };
} catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return fail(404, { error: 'Data tidak ditemukan' });
    }
    return fail(500, { error: 'Gagal menghapus data.' });
}
```

---

### DB-05: Sequential Uniqueness Checks [MEDIUM]

**Files:**
- `src/routes/admin/dashboard/proker/tambah/+page.server.ts:34-41`
- `src/routes/admin/dashboard/proker/[id]/edit/+page.server.ts:46-56`

```ts
const existingTitle = await prisma.proker.findUnique({ where: { title } }); // Query 1
const existingSlug = await prisma.proker.findUnique({ where: { slug } });   // Query 2
```

**Masalah:** 2 query independent dijalankan sequential. Bisa diparalelkan.

**Rekomendasi:**
```ts
const [existingTitle, existingSlug] = await Promise.all([
    title ? prisma.proker.findUnique({ where: { title }, select: { id: true } }) : null,
    slug ? prisma.proker.findUnique({ where: { slug }, select: { id: true } }) : null,
]);
```

---

### DB-06: Public Member List Tanpa Pagination + 4-Pass Array Filtering [MEDIUM]

**File:** `src/routes/(public)/member/+page.server.ts:5-22`

```ts
const members = await prisma.member.findMany({ include: { devisi: { select: { nama: true } } } });
// ...
const bph = members.filter((m) => m.memberType === 'BPH');
const kadiv = members.filter((m) => m.memberType === 'KADIV');
const regular = members.filter((m) => m.memberType === 'REGULAR');
const alumni = members.filter((m) => m.memberType === 'ALUMNI');
```

**Masalah:** Fetch semua member tanpa pagination, lalu 4x iterate array yang sama.

**Rekomendasi:** Gunakan single-pass grouping:
```ts
const grouped: Record<string, typeof members> = {};
for (const m of members) {
    (grouped[m.memberType] ??= []).push(m);
}
```

---

### DB-07: Overfetch pada Public Devisi List [LOW]

**File:** `src/routes/(public)/devisi/+page.server.ts:5-7`

```ts
const devisiList = await prisma.devisi.findMany({ orderBy: { id: 'asc' } });
```

**Masalah:** Mengambil semua kolom termasuk `deskripsi` (`@db.Text`) yang tidak dibutuhkan di halaman listing.

**Rekomendasi:** Tambahkan `select` clause hanya untuk field yang dibutuhkan UI.

---

### DB-08: Overfetch pada Admin Devisi List [LOW]

**File:** `src/routes/admin/dashboard/devisi/+page.server.ts:6-11`

**Masalah:** Sama seperti DB-07, tidak ada `select` — semua kolom ikut terambil.

---

### DB-09: Missing Index pada `publishedAt` [LOW]

**File:** `prisma/schema.prisma:118-132`

**Masalah:** Beberapa query memfilter berdasarkan `publishedAt` (toggle publish, public listing) tetapi tidak ada index pada kolom tersebut.

**Rekomendasi:**
```prisma
@@index([publishedAt, date], map: "Proker_publishedAt_date_idx")
```

---

### DB-10: Draft Proker Accessible Publicly [LOW]

**File:** `src/routes/(public)/proker/[slug]/+page.server.ts:6-10`

**Masalah:** Tidak ada filter `publishedAt` — siapapun yang tahu slug bisa mengakses proker draft.

---

### DB-11: Unnecessary `engineType` dan `binaryTargets` [LOW]

**File:** `prisma/schema.prisma:4-5`

**Masalah:** Dengan `@prisma/adapter-mariadb`, `engineType = "binary"` dan `binaryTargets` tidak dibutuhkan karena adapter bypass query engine. Ini menambah build artifacts yang tidak perlu.

---

## 2. Svelte Component & Rendering

### SV-01: TipTap Editor Tidak Lazy-Loaded [CRITICAL]

**File:** `src/lib/components/admin/RichTextEditor.svelte:3-5`

```svelte
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
```

**Masalah:** TipTap (~150-200KB+ bundled) di-import secara static. Kode ini masuk ke chunk halaman admin proker/tambah dan proker/edit, dan berpotensi bocor ke shared bundle jika code-splitting tidak dikonfigurasi dengan benar.

**Rekomendasi:** Dynamic import di dalam `onMount`:
```svelte
onMount(async () => {
    const [{ Editor }, { default: StarterKit }, { default: Highlight }] = await Promise.all([
        import('@tiptap/core'),
        import('@tiptap/starter-kit'),
        import('@tiptap/extension-highlight')
    ]);
    editor = new Editor({ element, /* ... */ });
});
```

---

### SV-02: TipTap Triple Re-render Per Keystroke [HIGH]

**File:** `src/lib/components/admin/RichTextEditor.svelte:54-80`

```svelte
onUpdate: ({ editor: e }) => { value = e.getHTML(); editorState++; },
onSelectionUpdate: () => { editorState++; },
onTransaction: () => { editorState++; }
```

**Masalah:** Setiap keystroke memicu 3 callback yang masing-masing increment `editorState`, menyebabkan 3x reactive update pada toolbar buttons.

**Rekomendasi:** Cukup gunakan `onTransaction` saja. Hapus `onSelectionUpdate` dan pindahkan `value = e.getHTML()` ke `onUpdate` tanpa increment `editorState` di sana.

---

### SV-03: Semua Image Tanpa `loading="lazy"` [HIGH]

**Files:** 14 `<img>` tag di seluruh codebase (lihat section Image & Assets)

**Masalah:** Semua image dimuat eagerly pada page load. Halaman member dengan puluhan foto anggota memuat semua gambar sekaligus.

**Rekomendasi:** Tambahkan `loading="lazy"` pada semua image kecuali yang above-the-fold (hero, navbar logo).

---

### SV-04: `{#each}` Key Menggunakan Non-Unique Value [HIGH]

**File:** `src/routes/admin/dashboard/+page.svelte:98`

```svelte
{#each recentProker as proker (proker.title)}
```

**Masalah:** `proker.title` bukan identifier unik. Jika 2 proker memiliki judul sama, Svelte gagal melacak DOM element yang benar.

**Rekomendasi:** Gunakan `proker.id`.

---

### SV-05: `$effect` Digunakan di Mana `$derived` Lebih Tepat [MEDIUM]

**Files:**
- `src/routes/admin/login/+page.svelte:12-24` — email/username splitting
- `src/routes/admin/dashboard/proker/tambah/+page.svelte:38-41` — slug auto-generation
- `src/routes/admin/dashboard/proker/[id]/edit/+page.svelte:44-47` — slug auto-generation

**Masalah:** `$effect` yang menulis ke `$state` lain padahal ini adalah derived computation. Menyebabkan reactive cycle yang tidak perlu.

**Rekomendasi Login page:**
```svelte
let emailValue = $derived(rawInput?.includes('@') ? rawInput : '');
let usernameValue = $derived(rawInput && !rawInput.includes('@') ? rawInput : '');
```

---

### SV-06: Universal `*` Selector dalam Scoped Styles [MEDIUM]

**Files:**
- `src/routes/(public)/+layout.svelte:17-19`
- `src/routes/admin/login/+layout.svelte:12-14`

```css
* { color: var(--color-primary-text); }
```

**Masalah:** Universal selector memaksa browser apply style rule ke setiap element di subtree, meningkatkan style recalculation time. `color` adalah inherited property — cukup set di root element.

**Rekomendasi:** Ganti dengan styling pada container element atau gunakan `@layer base` di global CSS.

---

### SV-07: Mutasi State `$derived` Secara Langsung [MEDIUM]

**File:** `src/routes/admin/dashboard/member/+page.svelte:72-74`

```svelte
const filters = $derived(data.filters);
// ...
function resetFilters() {
    filters.search = '';  // MUTATING DERIVED STATE
}
```

**Masalah:** `$derived` seharusnya read-only. Mutasi langsung pada derived state adalah anti-pattern yang bisa menyebabkan bug reaktivitas.

**Rekomendasi:** Gunakan `$state` copies untuk filter inputs, atau cukup panggil `goto()` saja karena navigasi otomatis reset `data.filters`.

---

### SV-08: `bind:value` pada `$derived` Object Properties [MEDIUM]

**File:** `src/routes/admin/dashboard/member/+page.svelte:117-118`

**Masalah:** Two-way binding ke properties dari `$derived` object — conceptually wrong dan akan warning di Svelte versi mendatang.

---

### SV-09: Navbar Route-Change Handler Tidak Reactive [MEDIUM]

**File:** `src/lib/components/Navbar.svelte:38`

```svelte
if(page.url.pathname) isOpen = false;
```

**Masalah:** Baris ini dijalankan sekali saat inisialisasi, bukan dalam reactive context. Mobile menu tidak otomatis tertutup saat navigasi.

**Rekomendasi:**
```svelte
import { afterNavigate } from '$app/navigation';
afterNavigate(() => { isOpen = false; });
```

---

### SV-10: `{#each}` Key Menggunakan Index [LOW]

**File:** `src/lib/components/Footer.svelte:55`

```svelte
{#each navItems as item, i (i)}
```

**Masalah:** Menggunakan loop index sebagai key menghilangkan manfaat keying. Gunakan `item.name` atau identifier stabil lainnya.

---

### SV-11: `<a>` di Dalam `<button>` — Invalid HTML [LOW]

**Files:**
- `src/routes/(public)/+page.svelte:33-35`
- `src/lib/components/Navbar.svelte:85-87`

**Masalah:** Nesting `<a>` di dalam `<button>` adalah invalid HTML, menyebabkan browser melakukan DOM restructuring saat parsing.

**Rekomendasi:** Gunakan styled `<a>` saja.

---

### SV-12: `formatDate` Function Diduplikasi di 4+ File [LOW]

**Files:**
- `src/routes/(public)/proker/[slug]/+page.svelte:8-14`
- `src/routes/(public)/proker/+page.svelte:7-13`
- `src/routes/admin/dashboard/proker/+page.svelte:66-71`
- `src/routes/admin/dashboard/+page.svelte:8-13`

**Masalah:** Fungsi identik diduplikasi, meningkatkan bundle size.

**Rekomendasi:** Extract ke `src/lib/utils/date.ts`.

---

### SV-13: `isToggling` Shared Across All Table Rows [LOW]

**File:** `src/routes/admin/dashboard/proker/+page.svelte:25,106`

**Masalah:** Satu boolean `isToggling` shared untuk semua row — ketika 1 row di-toggle, semua button di-disable.

**Rekomendasi:** Track per-item: `let togglingId = $state<number | null>(null);`

---

## 3. Image & Asset Handling

### IMG-01: Favicon SVG 592 KB [CRITICAL]

**File:** `static/favicon.svg` — **592.30 KB**

**Masalah:** Favicon berisi ilustrasi detail 1200x1200 pixel dengan banyak complex path. File ini dimuat di setiap page load. Favicon tipikal seharusnya < 5 KB.

**Rekomendasi:**
1. Buat favicon teroptimasi khusus untuk browser tab (32x32 atau 48x48)
2. Jalankan melalui SVGO untuk strip metadata dan simplify paths
3. Sediakan multiple format:
```html
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

---

### IMG-02: Semua Image Tanpa `loading="lazy"` [CRITICAL]

**Files:** 14 `<img>` tag di seluruh codebase

| File | Line |
|------|------|
| `src/lib/components/Navbar.svelte` | 94, 125 |
| `src/lib/components/Footer.svelte` | 64 |
| `src/lib/components/memberCard/Member.svelte` | 15 |
| `src/lib/components/memberCard/Kadiv.svelte` | 16 |
| `src/lib/components/memberCard/Bph.svelte` | 15 |
| `src/lib/components/admin/ImageUpload.svelte` | 121 |
| `src/routes/admin/dashboard/member/+page.svelte` | 188 |
| `src/routes/admin/dashboard/devisi/+page.svelte` | 126 |
| `src/routes/(public)/+page.svelte` | 45 |
| `src/routes/(public)/proker/+page.svelte` | 54 |
| `src/routes/(public)/proker/[slug]/+page.svelte` | 39 |
| `src/routes/(public)/devisi/+page.svelte` | 29, 44 |

**Rekomendasi:** Tambahkan `loading="lazy"` ke semua image kecuali hero dan navbar logo (above-the-fold).

---

### IMG-03: Semua Image Tanpa `width`/`height` — Menyebabkan CLS [HIGH]

**Files:** Sama dengan IMG-02

**Masalah:** Tanpa atribut `width` dan `height`, browser tidak bisa reserve space untuk image sebelum dimuat. Ini menyebabkan layout shift saat image muncul, menurunkan skor Core Web Vitals CLS.

**Rekomendasi:**
```svelte
<!-- Member cards: 96x96 container -->
<img src={imageUrl} alt={name} width="96" height="96" loading="lazy" />

<!-- Navbar/Footer logo: 215x35 -->
<img src={logoUrl} alt="HIMATIF Logo" width="215" height="35" />
```

---

### IMG-04: Cloudinary URL Tanpa Delivery-Time Transformations [HIGH]

**File:** `src/lib/server/upload.ts:83`

```ts
url: result.secure_url,
```

**Masalah:** Upload menyimpan raw `secure_url` tanpa `f_auto,q_auto` di delivery path. Image dikirim dalam format tetap (JPEG) ke semua browser, padahal Cloudinary bisa serve WebP ke Chrome dan AVIF ke browser yang mendukung.

**Rekomendasi:** Simpan `publicId` sebagai referensi utama dan build URL dinamis:
```ts
export function cloudinaryUrl(publicId: string, transforms = 'f_auto,q_auto,w_800') {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}
```

---

### IMG-05: Tidak Ada Responsive Images (`srcset`) [HIGH]

**Files:** Semua 14 `<img>` tag

**Masalah:** Setiap image disajikan dalam satu resolusi tetap, terlepas dari ukuran viewport. Image 1200px dikirim ke layar mobile 320px.

**Rekomendasi:**
```svelte
<img
    src={cloudinaryUrl(publicId, 'f_auto,q_auto,w_400')}
    srcset="
        {cloudinaryUrl(publicId, 'f_auto,q_auto,w_200')} 200w,
        {cloudinaryUrl(publicId, 'f_auto,q_auto,w_400')} 400w,
        {cloudinaryUrl(publicId, 'f_auto,q_auto,w_800')} 800w
    "
    sizes="(max-width: 768px) 100vw, 400px"
    width="400" height="225"
    loading="lazy" decoding="async"
    alt={item.title}
/>
```

---

### IMG-06: Tidak Ada `<link rel="preload">` untuk LCP Image [HIGH]

**File:** `src/app.html:3-9`

**Masalah:** Hero image (LCP element) tidak di-preload. Browser baru menemukan image ini setelah parsing HTML dan CSS.

**Rekomendasi:**
```svelte
<svelte:head>
    <link rel="preload" as="image" href={org.logoBigUrl} />
</svelte:head>
```

---

### IMG-07: Tidak Ada `fetchpriority="high"` pada LCP Image [HIGH]

**File:** `src/routes/(public)/+page.svelte:45`

**Rekomendasi:**
```svelte
<img src={org.logoBigUrl} alt={org.nama} fetchpriority="high" width="500" height="400" />
```

---

### IMG-08: Tidak Ada `decoding="async"` [MEDIUM]

**Files:** Semua 14 `<img>` tag

**Masalah:** Tanpa `decoding="async"`, image decoding bisa memblokir main thread.

---

### IMG-09: Admin Preview Menampilkan Full-Resolution Image [MEDIUM]

**File:** `src/lib/components/admin/ImageUpload.svelte:121`

**Masalah:** Preview admin menampilkan image full-resolution (hingga 1200x1200) di container kecil (32x32 CSS pixels).

**Rekomendasi:** Gunakan Cloudinary transformation untuk thumbnail preview.

---

### IMG-10: Upload API Tidak Menyimpan publicId untuk Optimasi [MEDIUM]

**File:** `src/routes/api/upload/+server.ts:28-36`

**Masalah:** API mengembalikan `publicId`, `width`, dan `height` tetapi frontend tidak menyimpannya untuk optimasi delivery URL.

---

### IMG-11: Empty `alt` pada Logo Images [LOW]

**Files:** `src/lib/components/Navbar.svelte:94,125`, `src/lib/components/Footer.svelte:64`

**Masalah:** Logo bukan decorative image — seharusnya memiliki alt text yang bermakna untuk accessibility dan SEO.

---

### IMG-12: Tidak Ada Open Graph Image Tags [LOW]

**File:** `src/app.html`

**Masalah:** Tidak ada meta tag OG:image — link preview di social media tidak menampilkan gambar.

---

### IMG-13: `{@html}` Tanpa Sanitization [LOW]

**File:** `src/routes/(public)/proker/[slug]/+page.svelte:37`

```svelte
{@html htmlContent}
```

**Masalah:** Raw HTML dari database (TipTap content) dirender langsung. Selain security risk (XSS), HTML besar bisa menyebabkan layout thrashing.

**Rekomendasi:** Sanitize di server-side dengan DOMPurify.

---

### IMG-14: Inline `style` Berulang [LOW]

**Files:** 15+ element menggunakan `style="box-shadow: var(--shadow-card-md);"` berulang kali.

**Rekomendasi:** Buat CSS utility class: `.shadow-card-md { box-shadow: var(--shadow-card-md); }`

---

## 4. Server-Side Data Loading

### SSR-01: Auth Check pada Setiap Request Termasuk Public [HIGH]

**File:** `src/hooks.server.ts:8-10`

```ts
const session = await auth.api.getSession({ headers: event.request.headers });
```

**Masalah:** `getSession()` melakukan DB query pada setiap request — termasuk public pages, static assets, dan favicon. Ini menambah latency yang tidak perlu untuk halaman yang tidak membutuhkan autentikasi.

**Rekomendasi:**
```ts
export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/admin')) {
        const session = await auth.api.getSession({
            headers: event.request.headers
        });
        if (session) {
            event.locals.session = session.session;
            event.locals.user = session.user;
        }
    }
    return svelteKitHandler({ event, resolve, auth, building });
};
```

---

### SSR-02: Hardcoded `localhost` di Auth Client & Server [HIGH]

**Files:**
- `src/lib/authClient.ts:6` — `baseURL: "http://localhost:5173"`
- `src/lib/server/auth.ts:17-19` — `trustedOrigins: ["http://localhost:5173", "http://127.0.0.1:5173"]`

**Masalah:** Production akan mengalami CORS/redirect error karena hanya localhost yang di-trust.

**Rekomendasi:** Gunakan environment variable:
```ts
import { PUBLIC_BASE_URL } from '$env/static/public';
export const authClient = createAuthClient({
    plugins: [usernameClient()],
    baseURL: PUBLIC_BASE_URL
});
```

---

### SSR-03: Duplicate Organization Query (Layout + Page) [MEDIUM]

**Files:**
- `src/routes/(public)/+layout.server.ts:5-10` — fetch `organization` (select logoSmallUrl)
- `src/routes/(public)/+page.server.ts:5-7` — fetch `organization` (seluruh row)

**Masalah:** Saat user membuka homepage, 2 query terpisah dibuat untuk record `organization` yang sama (id: 1).

**Rekomendasi:** Fetch full organization di layout, gunakan `parent()` di page.

---

### SSR-04: Tidak Ada Deferred/Streaming Data Loading [MEDIUM]

**Files:** Semua `+page.server.ts`

**Masalah:** Setiap load function `await` semua query sebelum mengembalikan data. SvelteKit mendukung streaming deferred data yang tidak digunakan.

**Rekomendasi:** Untuk data non-critical, return unresolved promises:
```ts
return {
    members: prisma.member.findMany({...}) // Tanpa await — SvelteKit stream ini
};
```

---

### SSR-05: Preload Strategy Tidak Efektif di Mobile [MEDIUM]

**File:** `src/app.html:10`

```html
<body data-sveltekit-preload-data="hover">
```

**Masalah:** `hover` tidak tersedia di perangkat mobile (tidak ada hover event). Pada mobile, preloading tidak berjalan sama sekali.

**Rekomendasi:**
```html
<body data-sveltekit-preload-data="hover" data-sveltekit-preload-code="viewport">
```

---

## 5. Build, Bundle & Configuration

### BUILD-01: Tidak Ada Manual Chunks / Code Splitting Config [MEDIUM]

**File:** `vite.config.ts`

**Masalah:** Tidak ada `build.rollupOptions.output.manualChunks`. Heavy dependencies seperti `@tiptap/*`, `better-auth`, `isomorphic-dompurify` bisa masuk ke shared chunk.

**Rekomendasi:**
```ts
build: {
    rollupOptions: {
        output: {
            manualChunks: {
                tiptap: ['@tiptap/core', '@tiptap/pm', '@tiptap/starter-kit', '@tiptap/extension-highlight'],
                auth: ['better-auth'],
                sanitize: ['isomorphic-dompurify'],
            }
        }
    }
}
```

---

### BUILD-02: Tidak Ada Compression Config / `netlify.toml` [MEDIUM]

**Masalah:** Tidak ada konfigurasi eksplisit untuk compression dan caching headers di Netlify.

**Rekomendasi:** Buat `netlify.toml`:
```toml
[[headers]]
    for = "/_app/immutable/*"
    [headers.values]
        Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
    for = "/*"
    [headers.values]
        Cache-Control = "public, max-age=0, must-revalidate"
```

---

### BUILD-03: No Edge Functions / SSR Streaming Config [MEDIUM]

**File:** `vite.config.ts:16`

**Masalah:** Netlify adapter digunakan tanpa konfigurasi. Default menggunakan Netlify Functions yang memiliki cold-start latency.

**Rekomendasi:**
```ts
adapter: adapter({ edge: true })
```

---

### BUILD-04: Meyer Reset CSS Redundan dengan Tailwind [LOW]

**File:** `src/lib/styles/reset.css` (50 lines), imported di `src/routes/layout.css:1`

**Masalah:** Eric Meyer CSS reset (2011) dimuat bersamaan dengan Tailwind CSS v4 yang sudah include Preflight. Duplikasi dan potensi konflik specificity.

**Rekomendasi:** Hapus `reset.css` dan import-nya.

---

### BUILD-05: Font Declaration Tanpa Loading Strategy [LOW]

**File:** `src/lib/styles/token.css:14`

```css
--font-base: "Nunito", sans-serif;
```

**Masalah:** Font `Nunito` dideclare tapi tidak ada `@font-face`, Google Fonts `<link>`, atau `font-display: swap`. Body menggunakan system font stack yang berbeda. Font ini mungkin tidak pernah dimuat atau gagal silently.

**Rekomendasi:** Hapus deklarasi Nunito jika tidak digunakan, atau load dengan benar dan tambahkan `font-display: swap`.

---

## 6. Caching & Network

### CACHE-01: Tidak Ada HTTP Caching Headers di Server Loads [MEDIUM]

**Files:** Semua `+layout.server.ts` dan `+page.server.ts`

**Masalah:** Tidak ada `setHeaders()` untuk `Cache-Control`. Data seperti organization logo (jarang berubah) di-fetch dari database setiap page load tanpa caching.

**Rekomendasi:**
```ts
export const load: LayoutServerLoad = async ({ setHeaders }) => {
    setHeaders({
        'Cache-Control': 'public, max-age=300, s-maxage=600' // 5min client, 10min CDN
    });
    const org = await prisma.organization.findUnique({ where: { id: 1 } });
    return { organization: org };
};
```

---

### CACHE-02: Redundant `dotenv/config` Import [MEDIUM]

**File:** `src/lib/server/db.ts:1`

```ts
import "dotenv/config";
```

**Masalah:** SvelteKit sudah handle environment variables melalui `$env/static/private`. Import ini redundant dan menambah beberapa milliseconds pada module initialization.

---

### CACHE-03: Missing HTML Meta Tags [LOW]

**File:** `src/app.html`

**Masalah:**
- `<meta name="text-scale" content="scale">` — bukan meta tag standar
- Tidak ada `<meta name="description">`
- Tidak ada `<meta name="theme-color">`
- Tidak ada `<link rel="preconnect">` untuk external resources

---

### CACHE-04: SSL Certificate Verification Disabled [LOW]

**File:** `src/lib/server/db.ts:13`

```ts
ssl: { rejectUnauthorized: false }
```

**Masalah:** Disabling TLS certificate verification membuat koneksi database rentan terhadap MITM attacks. Meskipun bukan performance issue langsung, ini adalah security concern yang harus diperbaiki untuk production.

---

## Prioritas Perbaikan

### Quick Wins (Effort rendah, dampak tinggi)

| # | Issue | Estimasi |
|---|-------|----------|
| 1 | IMG-01: Optimize favicon (592KB → <5KB) | 15 menit |
| 2 | IMG-02: Tambah `loading="lazy"` ke semua image | 20 menit |
| 3 | IMG-03: Tambah `width`/`height` ke semua image | 20 menit |
| 4 | DB-01: Prisma singleton pattern | 10 menit |
| 5 | CACHE-02: Hapus `import "dotenv/config"` | 1 menit |
| 6 | BUILD-04: Hapus redundant reset.css | 5 menit |

### Medium Effort (Dampak signifikan)

| # | Issue | Estimasi |
|---|-------|----------|
| 7 | DB-02: Pagination + select pada proker list | 30 menit |
| 8 | SSR-01: Skip auth check untuk public routes | 15 menit |
| 9 | SV-01: Lazy-load TipTap editor | 30 menit |
| 10 | SSR-02: Fix hardcoded localhost di auth | 15 menit |
| 11 | SV-02: Fix TipTap triple re-render | 10 menit |
| 12 | BUILD-01: Tambah manual chunks | 15 menit |
| 13 | CACHE-01: Tambah Cache-Control headers | 20 menit |

### Higher Effort (Membutuhkan refactor)

| # | Issue | Estimasi |
|---|-------|----------|
| 14 | IMG-04/05: Cloudinary delivery optimization + srcset | 2-3 jam |
| 15 | DB-04/05: Refactor delete/validation patterns | 1 jam |
| 16 | SSR-04: Implement deferred loading | 1-2 jam |
| 17 | BUILD-02: Setup netlify.toml | 30 menit |

---

## Catatan Metodologi

Audit ini dilakukan melalui **static code inspection** — analisis source code tanpa menjalankan aplikasi atau melakukan runtime profiling. Sesuai referensi dari performance skill:

> *"If nothing can run, label every performance finding as a hypothesis and provide the exact measurement needed to verify it."*

**Semua temuan di atas adalah hipotesis** yang perlu diverifikasi melalui:

1. **DevTools Performance Trace** — untuk mengukur LCP, CLS, INP aktual
2. **Lighthouse Lab Run** — untuk skor performance, accessibility, SEO
3. **Network Analysis** — untuk mengukur transfer size dan waterfall aktual
4. **Bundle Analysis** — jalankan `npx vite-bundle-analyzer` untuk melihat chunk sizes aktual
5. **Database Monitoring** — pantau query execution time dan connection pool usage

### Cara Verifikasi

```bash
# Build analysis
npx vite build --mode production
npx vite-bundle-visualizer

# Lighthouse CLI
npx lighthouse http://localhost:4173 --output=json --output-path=./lighthouse-report.json

# Check bundle sizes
du -sh .svelte-kit/output/client/_app/immutable/chunks/*
```

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |

---

> Dokumen ini akan diperbarui setelah pengukuran runtime dilakukan.
