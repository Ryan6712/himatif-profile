# Sprint 4: CRUD Anggota

> Full CRUD operations untuk data Anggota/Member dengan filter, search, dan pagination
> Estimasi: 2 hari

---

## Prerequisites

- Sprint 3 selesai (reusable form components sudah ada, CRUD Divisi berfungsi)
- Data divisi sudah ada di database (untuk dropdown relasi)

---

## Task 4.1: List Anggota

### File: `src/routes/admin/anggota/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url }) => {
  // Query params untuk filter, search, pagination
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 20;
  const search = url.searchParams.get("search") || "";
  const type = url.searchParams.get("type") || "";       // MemberType filter
  const devisiId = url.searchParams.get("devisi") || "";  // Devisi filter

  // Build where clause
  const where: any = {};

  if (search) {
    where.name = { contains: search };
  }

  if (type && ["BPH", "KADIV", "REGULAR", "ALUMNI"].includes(type)) {
    where.memberType = type;
  }

  if (devisiId && !isNaN(Number(devisiId))) {
    where.devisiId = Number(devisiId);
  }

  // Query dengan pagination
  const [members, totalCount, devisiList] = await Promise.all([
    prisma.member.findMany({
      where,
      include: { devisi: { select: { id: true, nama: true } } },
      orderBy: [
        { memberType: "asc" },  // BPH first, then KADIV, etc.
        { name: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.member.count({ where }),
    // Untuk dropdown filter devisi
    prisma.devisi.findMany({
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  return {
    members,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    filters: { search, type, devisiId },
    devisiList,
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id || isNaN(id)) {
      return fail(400, { error: "ID tidak valid" });
    }

    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      return fail(404, { error: "Anggota tidak ditemukan" });
    }

    await prisma.member.delete({ where: { id } });

    return { success: true, message: `Anggota "${member.name}" berhasil dihapus` };
  },
};
```

### File: `src/routes/admin/anggota/+page.svelte`

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Anggota                                  [+ Tambah Anggota] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Filter:                                                     │
│ [🔍 Cari nama...    ] [Tipe ▼] [Divisi ▼]  [Reset Filter]  │
│                                                             │
│ Menampilkan 20 dari 20 anggota                              │
│                                                             │
│ ┌────┬────────────────┬────────┬──────────┬──────┬────────┐ │
│ │ No │ Nama           │ Tipe   │ Divisi   │ Foto │ Aksi   │ │
│ ├────┼────────────────┼────────┼──────────┼──────┼────────┤ │
│ │ 1  │ Zaskia Az-zara │ BPH    │ -        │ 🖼️  │ ✏️ 🗑  │ │
│ │ 2  │ Haidar 'Ali    │ BPH    │ -        │ 🖼️  │ ✏️ 🗑  │ │
│ │ 3  │ M. Bayu A.     │ KADIV  │ Kominfo  │ 🖼️  │ ✏️ 🗑  │ │
│ │ ...│                │        │          │      │        │ │
│ └────┴────────────────┴────────┴──────────┴──────┴────────┘ │
│                                                             │
│ Pagination:  « 1 2 3 »                                      │
│                                                             │
│ Empty state: "Tidak ada anggota yang cocok dengan filter."  │
└─────────────────────────────────────────────────────────────┘
```

**Fitur detail:**

#### Search
- Input text, debounce 300ms
- Update URL search params: `?search=keyword`
- Cari berdasarkan nama (contains)

#### Filter by MemberType
- Dropdown/select: Semua, BPH, KADIV, REGULAR, ALUMNI
- Update URL search params: `?type=BPH`

#### Filter by Divisi
- Dropdown/select: Semua, lalu list divisi dari database
- Update URL search params: `?devisi=1`

#### Kombinasi filter
- Semua filter bisa dikombinasikan: `?search=bayu&type=KADIV&devisi=1`
- Tombol "Reset Filter" -> hapus semua query params

#### Pagination
- Default 20 item per page
- Navigation: Previous, page numbers, Next
- Update URL: `?page=2`
- Preserve filter saat ganti halaman

#### Badge warna per MemberType

| Type | Warna Badge |
|------|-------------|
| BPH | Biru / Primary |
| KADIV | Hijau / Secondary |
| REGULAR | Abu-abu / Neutral |
| ALUMNI | Kuning / Warning |

#### Thumbnail foto
- Tampilkan foto kecil (32x32 atau 40x40, rounded-full) di kolom foto
- Fallback jika gambar gagal load: inisial nama

### Komponen pendukung

#### `src/lib/components/admin/Pagination.svelte`

```svelte
<script lang="ts">
  interface Props {
    page: number;
    totalPages: number;
    baseUrl: string; // URL tanpa page param
  }

  let { page, totalPages, baseUrl }: Props = $props();

  // Generate array of page numbers to show
  // e.g., [1, 2, 3, ..., 10] or [1, ..., 4, 5, 6, ..., 10]
</script>

<nav class="pagination">
  <a href="{baseUrl}&page={page - 1}" class:disabled={page <= 1}>«</a>
  {#each visiblePages as p}
    <a href="{baseUrl}&page={p}" class:active={p === page}>{p}</a>
  {/each}
  <a href="{baseUrl}&page={page + 1}" class:disabled={page >= totalPages}>»</a>
</nav>
```

#### `src/lib/components/admin/SearchFilter.svelte` (opsional)

Komponen gabungan search + filter yang bisa dipakai ulang di halaman lain (proker list juga butuh search/filter).

---

## Task 4.2: Tambah Anggota

### File: `src/routes/admin/anggota/tambah/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  // Load divisi list untuk dropdown
  const devisiList = await prisma.devisi.findMany({
    select: { id: true, nama: true, namaLengkap: true },
    orderBy: { nama: "asc" },
  });
  return { devisiList };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const name = (formData.get("name") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const memberType = formData.get("memberType") as string;
    const devisiId = formData.get("devisiId") as string;

    // Validasi
    const errors: Record<string, string> = {};
    if (!name) errors.name = "Nama wajib diisi";
    if (!imageUrl) errors.imageUrl = "URL foto wajib diisi";
    if (!memberType) errors.memberType = "Tipe anggota wajib dipilih";
    if (!["BPH", "KADIV", "REGULAR", "ALUMNI"].includes(memberType)) {
      errors.memberType = "Tipe anggota tidak valid";
    }

    // Cek nama unik
    if (name) {
      const existing = await prisma.member.findUnique({ where: { name } });
      if (existing) errors.name = "Nama anggota sudah terdaftar";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { name, imageUrl, memberType, devisiId },
      });
    }

    await prisma.member.create({
      data: {
        name,
        imageUrl,
        memberType: memberType as any, // member_memberType enum
        devisiId: devisiId ? Number(devisiId) : null,
      },
    });

    throw redirect(303, "/admin/anggota");
  },
};
```

### File: `src/routes/admin/anggota/tambah/+page.svelte`

**Layout form:**

```
┌─────────────────────────────────────────────┐
│ ← Kembali    Tambah Anggota Baru            │
├─────────────────────────────────────────────┤
│                                             │
│ Nama Lengkap *:      [                  ]   │
│                                             │
│ URL Foto *:          [https://...       ]   │
│  (Preview foto rounded)                     │
│                                             │
│ Tipe Anggota *:      [▼ Pilih tipe     ]    │
│   Options: BPH, KADIV, REGULAR, ALUMNI      │
│                                             │
│ Divisi:              [▼ Pilih divisi   ]    │
│   Options: -, Kominfo, Humas, DBM           │
│   (Opsional - BPH dan ALUMNI biasanya       │
│    tidak punya divisi)                       │
│                                             │
│ [Batal]                    [Simpan Anggota] │
└─────────────────────────────────────────────┘
```

**UX Enhancements:**
- Saat pilih tipe `BPH` atau `ALUMNI`, field Divisi otomatis di-clear dan disabled (dengan hint "BPH/Alumni tidak memiliki divisi")
- Saat pilih tipe `KADIV` atau `REGULAR`, field Divisi enabled
- Preview foto: tampilkan gambar rounded jika URL valid
- Fallback preview: avatar placeholder dengan inisial

---

## Task 4.3: Edit Anggota

### File: `src/routes/admin/anggota/[id]/edit/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { error, fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw error(400, "ID tidak valid");

  const [member, devisiList] = await Promise.all([
    prisma.member.findUnique({
      where: { id },
      include: { devisi: { select: { id: true, nama: true } } },
    }),
    prisma.devisi.findMany({
      select: { id: true, nama: true, namaLengkap: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  if (!member) throw error(404, "Anggota tidak ditemukan");

  return { member, devisiList };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const id = Number(params.id);
    const formData = await request.formData();

    const name = (formData.get("name") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const memberType = formData.get("memberType") as string;
    const devisiId = formData.get("devisiId") as string;

    // Validasi
    const errors: Record<string, string> = {};
    if (!name) errors.name = "Nama wajib diisi";
    if (!imageUrl) errors.imageUrl = "URL foto wajib diisi";
    if (!memberType) errors.memberType = "Tipe anggota wajib dipilih";

    // Cek nama unik (exclude current)
    if (name) {
      const existing = await prisma.member.findFirst({
        where: { name, id: { not: id } },
      });
      if (existing) errors.name = "Nama anggota sudah terdaftar";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { name, imageUrl, memberType, devisiId },
      });
    }

    await prisma.member.update({
      where: { id },
      data: {
        name,
        imageUrl,
        memberType: memberType as any,
        devisiId: devisiId ? Number(devisiId) : null,
      },
    });

    throw redirect(303, "/admin/anggota");
  },
};
```

### File: `src/routes/admin/anggota/[id]/edit/+page.svelte`

Sama seperti form tambah, tapi pre-filled dengan data existing. Gunakan komponen form yang sama (bisa extract ke `MemberForm.svelte` jika mau DRY).

---

## Komponen Reusable (Opsional tapi Recommended)

### `src/lib/components/admin/MemberForm.svelte`

Extract form yang sama dipakai di tambah dan edit:

```svelte
<script lang="ts">
  import { FormField, TextArea } from "$lib/components/admin";

  interface Props {
    devisiList: Array<{ id: number; nama: string }>;
    values?: {
      name?: string;
      imageUrl?: string;
      memberType?: string;
      devisiId?: string | number | null;
    };
    errors?: Record<string, string>;
    submitLabel?: string;
  }

  let { devisiList, values = {}, errors = {},
        submitLabel = "Simpan" }: Props = $props();

  let selectedType = $state(values.memberType || "");

  // Auto-disable divisi for BPH and ALUMNI
  let devisiDisabled = $derived(
    selectedType === "BPH" || selectedType === "ALUMNI"
  );
</script>
```

---

## File Structure Setelah Sprint 4

```
src/routes/admin/
  anggota/
    +page.server.ts           # List + delete action + filters
    +page.svelte              # Table with search, filter, pagination
    tambah/
      +page.server.ts         # Load devisi list + create action
      +page.svelte            # Create form
    [id]/
      edit/
        +page.server.ts       # Load member + devisi list + update action
        +page.svelte          # Edit form (pre-filled)

src/lib/components/admin/
  Pagination.svelte           # Reusable pagination
  MemberForm.svelte           # Reusable member form (opsional)
  (existing components dari Sprint 3)
```

---

## Checklist

### List Anggota
- [ ] `admin/anggota/+page.server.ts` - Load with filters + pagination + delete action
- [ ] `admin/anggota/+page.svelte` - Table view
- [ ] Search by name (debounce, URL params)
- [ ] Filter by MemberType (dropdown)
- [ ] Filter by Divisi (dropdown)
- [ ] Kombinasi filter (semua filter bisa dipakai bersamaan)
- [ ] Tombol reset filter
- [ ] Pagination component + navigation
- [ ] Badge warna per MemberType
- [ ] Foto thumbnail di tabel
- [ ] Delete dengan confirmation dialog
- [ ] Empty state
- [ ] Info "Menampilkan X dari Y anggota"

### Tambah Anggota
- [ ] `admin/anggota/tambah/+page.server.ts` - Load devisi + create action
- [ ] `admin/anggota/tambah/+page.svelte` - Create form
- [ ] Dropdown MemberType (BPH, KADIV, REGULAR, ALUMNI)
- [ ] Dropdown Divisi (dari database, opsional)
- [ ] Auto-disable divisi untuk BPH/ALUMNI
- [ ] Validasi nama unik
- [ ] Preview foto
- [ ] Redirect setelah berhasil

### Edit Anggota
- [ ] `admin/anggota/[id]/edit/+page.server.ts` - Load + update
- [ ] `admin/anggota/[id]/edit/+page.svelte` - Edit form (pre-filled)
- [ ] Validasi nama unik (exclude current)
- [ ] Redirect setelah berhasil

### Testing
- [ ] Test create anggota baru (tiap tipe)
- [ ] Test edit anggota existing
- [ ] Test delete anggota
- [ ] Test filter: by type, by divisi, by search, kombinasi
- [ ] Test pagination: next, prev, direct page
- [ ] Test edge case: nama duplikat, field kosong
- [ ] Test: pilih BPH -> divisi disabled & cleared
