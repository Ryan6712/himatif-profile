# Sprint 2: Auth Flow & Admin Layout

> Implementasi halaman login, auth guard, admin layout, dan dashboard
> Estimasi: 1-2 hari

---

## Prerequisites

- Sprint 1 selesai (data sudah di database, admin user sudah di-seed)
- Better Auth sudah configured (`src/lib/server/auth.ts`)
- Auth client sudah ada (`src/lib/authClient.ts`)
- Hooks sudah inject `user` dan `session` ke `event.locals`

## State Saat Ini

```
src/lib/server/auth.ts     -> betterAuth configured (email/password + username plugin)
src/lib/authClient.ts      -> createAuthClient with usernameClient plugin
src/hooks.server.ts        -> getSession + inject ke locals (sudah done)
src/app.d.ts               -> Locals.user dan Locals.session sudah defined
```

Yang **belum ada**: halaman login, admin layout, route protection, dashboard.

---

## Task 2.1: Halaman Login

### File: `src/routes/admin/login/+page.server.ts`

```ts
// Server-side load: redirect ke /admin jika sudah login
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, "/admin");
  }
};
```

**Catatan:** Login form submit langsung ke better-auth API via `authClient`, bukan form action.

### File: `src/routes/admin/login/+page.svelte`

Komponen yang perlu dibuat:
- Form login dengan 2 field:
  - **Email atau Username** (text input)
  - **Password** (password input)
- Tombol submit
- Error message display
- Loading state saat submit

**Login logic menggunakan `authClient`:**

```ts
import { authClient } from "$lib/authClient";

// Login via email
const { data, error } = await authClient.signIn.email({
  email: emailValue,
  password: passwordValue,
});

// Login via username (jika input bukan format email)
const { data, error } = await authClient.signIn.username({
  username: usernameValue,
  password: passwordValue,
});
```

**Behavior:**
- Deteksi input: jika mengandung `@` -> login via email, jika tidak -> login via username
- Sukses -> `goto("/admin")`
- Gagal -> tampilkan error message ("Email/username atau password salah")
- Loading state: disable tombol + tampilkan spinner saat proses login

**Styling:**
- Centered card di tengah halaman (tanpa Navbar/Footer admin)
- Gunakan design system yang ada: `glass-card`, `btn-cta`, design tokens
- Logo HIMATIF di atas form
- Responsive

### File: `src/routes/admin/login/+layout.svelte` (opsional)

Jika ingin halaman login tanpa admin sidebar:

```svelte
<!-- Layout kosong, tanpa sidebar admin -->
<main class="min-h-screen flex items-center justify-center bg-gradient-surface">
  {@render children()}
</main>
```

---

## Task 2.2: Auth Guard untuk Admin Routes

### File: `src/routes/admin/+layout.server.ts`

```ts
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Jangan redirect di halaman login
  if (url.pathname === "/admin/login") {
    return {};
  }

  // Redirect ke login jika belum authenticated
  if (!locals.user) {
    throw redirect(302, "/admin/login");
  }

  // Pass user data ke semua child routes
  return {
    user: locals.user,
  };
};
```

**Poin penting:**
- Semua route di bawah `/admin/*` (kecuali `/admin/login`) akan di-protect
- User data di-pass ke layout sehingga bisa dipakai di sidebar (nama, email)
- Jangan pass `session` object ke client (cukup user info saja)

---

## Task 2.3: Admin Layout (Sidebar + Header)

### File: `src/routes/admin/+layout.svelte`

**Struktur layout:**

```
┌──────────────────────────────────────────────────┐
│ Header (mobile: hamburger | desktop: user info)  │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│ Sidebar  │           Main Content                │
│          │           {@render children()}         │
│ - Dashboard                                      │
│ - Organisasi                                     │
│ - Divisi │                                       │
│ - Anggota│                                       │
│ - Proker │                                       │
│          │                                       │
│          │                                       │
│ [Logout] │                                       │
├──────────┴───────────────────────────────────────┤
```

**Sidebar menu items:**

| Label | Icon (Lucide) | Path | Deskripsi |
|-------|---------------|------|-----------|
| Dashboard | `LayoutDashboard` | `/admin` | Halaman utama admin |
| Organisasi | `Building2` | `/admin/organisasi` | Edit data organisasi |
| Divisi | `Users` | `/admin/divisi` | Kelola divisi |
| Anggota | `UserRound` | `/admin/anggota` | Kelola anggota |
| Program Kerja | `Newspaper` | `/admin/proker` | Kelola program kerja |

**Fitur sidebar:**
- Active state: highlight menu item yang sesuai `$page.url.pathname`
- Collapsible di mobile: tombol hamburger di header, sidebar slide dari kiri (fly transition)
- Desktop: sidebar selalu visible (width: 250-280px)
- Logo HIMATIF di atas sidebar
- User info + logout button di bagian bawah sidebar

**Header (mobile):**
- Hamburger menu toggle
- Judul halaman (dari `$page.url.pathname`)
- User avatar/initial

**Logout implementation:**

```ts
import { authClient } from "$lib/authClient";
import { goto } from "$app/navigation";

async function handleLogout() {
  await authClient.signOut();
  goto("/admin/login");
}
```

**Komponen yang perlu dibuat:**

1. `src/lib/components/admin/Sidebar.svelte`
   - Props: `user` (nama, email), `isOpen` (untuk mobile toggle)
   - Menu items dengan active state
   - Logout button

2. `src/lib/components/admin/AdminHeader.svelte`
   - Props: `user`, `onToggleSidebar`
   - Hamburger button (mobile only)
   - Page title
   - User info dropdown (nice to have)

---

## Task 2.4: Dashboard Page

### File: `src/routes/admin/+page.server.ts`

```ts
import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";

export const load: PageServerLoad = async () => {
  // Query semua summary stats secara parallel
  const [
    devisiCount,
    memberCount,
    prokerCount,
    prokerPublished,
    recentProker,
    memberByType,
  ] = await Promise.all([
    prisma.devisi.count(),
    prisma.member.count(),
    prisma.proker.count(),
    prisma.proker.count({ where: { publishedAt: { not: null } } }),
    prisma.proker.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.member.groupBy({
      by: ["memberType"],
      _count: { id: true },
    }),
  ]);

  return {
    stats: {
      devisiCount,
      memberCount,
      prokerCount,
      prokerPublished,
      prokerDraft: prokerCount - prokerPublished,
    },
    recentProker,
    memberByType,
  };
};
```

### File: `src/routes/admin/+page.svelte`

**Layout dashboard:**

```
┌─────────┬─────────┬─────────┬──────────┐
│ Total   │ Total   │ Total   │ Proker   │
│ Divisi  │ Anggota │ Proker  │ Draft    │
│   3     │   20    │   5     │   3      │
├─────────┴─────────┴─────────┴──────────┤
│                                        │
│  Program Kerja Terbaru                 │
│  ┌──────────────────────────────────┐  │
│  │ Title        │ Status │ Tanggal  │  │
│  │ Upgrading... │ Published │ 1 Jun │  │
│  │ Lomba Slic.. │ Published │ 21 Mei│  │
│  │ HIP          │ Draft     │ -     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Anggota per Tipe                      │
│  BPH: 4 | KADIV: 3 | Regular: 11 |...│
└────────────────────────────────────────┘
```

**Summary cards:**
- Gunakan `glass-card` style
- Setiap card: icon (lucide) + label + angka besar
- Responsive: 2 kolom di mobile, 4 kolom di desktop

**Tabel proker terbaru:**
- 5 proker terakhir
- Kolom: Title, Status (badge Published/Draft), Tanggal
- Link ke edit page (`/admin/proker/[id]/edit`)

**Member by type:**
- Visualisasi sederhana (angka per tipe) atau small bar chart

---

## File Structure Setelah Sprint 2

```
src/routes/admin/
  +layout.server.ts          # Auth guard + pass user data
  +layout.svelte             # Admin layout (sidebar + header + main)
  +page.server.ts            # Dashboard data loader
  +page.svelte               # Dashboard page
  login/
    +page.server.ts          # Redirect jika sudah login
    +page.svelte             # Login form

src/lib/components/admin/
  Sidebar.svelte             # Sidebar navigation
  AdminHeader.svelte         # Top header bar
```

---

## Checklist

- [*] `src/routes/admin/login/+page.server.ts` - Redirect jika sudah login
- [*] `src/routes/admin/login/+page.svelte` - Login form dengan authClient
- [*] `src/routes/admin/+layout.server.ts` - Auth guard, pass user data
- [ ] `src/routes/admin/+layout.svelte` - Admin layout (sidebar + header)
- [ ] `src/lib/components/admin/Sidebar.svelte` - Sidebar navigation component
- [ ] `src/lib/components/admin/AdminHeader.svelte` - Header component
- [ ] `src/routes/admin/+page.server.ts` - Dashboard stats loader
- [ ] `src/routes/admin/+page.svelte` - Dashboard page dengan summary cards
- [*] Test: login dengan admin user yang di-seed
- [*] Test: akses `/admin` tanpa login -> redirect ke login
- [*] Test: akses `/admin/login` saat sudah login -> redirect ke dashboard
- [*] Test: logout -> redirect ke login
- [ ] Test: responsive sidebar (mobile toggle)

---

## Tips Implementasi

1. **Svelte 5 runes** - Gunakan `$state`, `$derived`, `$effect` bukan `let` reactive
2. **Active menu** - Gunakan `$page.url.pathname` dari `$app/stores` atau `$page` rune
3. **Transition sidebar** - Gunakan `fly` dari `svelte/transition` untuk mobile slide
4. **Auth client error handling** - `authClient.signIn` return `{ data, error }`, cek `error` untuk tampilkan pesan
5. **Type safety** - Import type `PageData` dari `$types` untuk typed load data
