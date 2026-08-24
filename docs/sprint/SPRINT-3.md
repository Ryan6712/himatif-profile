# Sprint 3: CRUD Organisasi & Divisi

> Full CRUD operations untuk data Organisasi (singleton) dan Divisi
> Estimasi: 2-3 hari

---

## Prerequisites

- Sprint 2 selesai (admin layout, auth guard, dashboard berfungsi)
- Admin bisa login dan akses dashboard

---

## Task 3.1: Reusable Form Components

Sebelum mulai CRUD, buat komponen form reusable yang akan dipakai di semua halaman admin.

### `src/lib/components/admin/FormField.svelte`

Input field dengan label dan error message.

```svelte
<script lang="ts">
  interface Props {
    label: string;
    name: string;
    type?: "text" | "email" | "password" | "url" | "number" | "date";
    value?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
  }

  let { label, name, type = "text", value = "", placeholder = "",
        required = false, error = "", disabled = false }: Props = $props();
</script>

<div class="form-group">
  <label for={name}>{label}{required ? ' *' : ''}</label>
  <input {type} {name} id={name} {value} {placeholder} {required} {disabled}
         class:error={!!error} />
  {#if error}
    <span class="error-text">{error}</span>
  {/if}
</div>
```

### `src/lib/components/admin/TextArea.svelte`

Textarea dengan label dan error message.

```svelte
<script lang="ts">
  interface Props {
    label: string;
    name: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    error?: string;
    disabled?: boolean;
  }

  let { label, name, value = "", placeholder = "", required = false,
        rows = 4, error = "", disabled = false }: Props = $props();
</script>

<div class="form-group">
  <label for={name}>{label}{required ? ' *' : ''}</label>
  <textarea {name} id={name} {rows} {placeholder} {required} {disabled}
            class:error={!!error}>{value}</textarea>
  {#if error}
    <span class="error-text">{error}</span>
  {/if}
</div>
```

### `src/lib/components/admin/Toast.svelte`

Notification toast untuk feedback operasi CRUD.

```svelte
<script lang="ts">
  import { fly } from "svelte/transition";

  interface Props {
    message: string;
    type?: "success" | "error" | "info";
    visible?: boolean;
    duration?: number; // auto-hide after ms
  }

  let { message, type = "success", visible = $bindable(false),
        duration = 3000 }: Props = $props();

  $effect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => { visible = false }, duration);
      return () => clearTimeout(timer);
    }
  });
</script>

{#if visible}
  <div class="toast toast-{type}" transition:fly={{ y: -20 }}>
    {message}
  </div>
{/if}
```

### `src/lib/components/admin/ConfirmDialog.svelte`

Dialog konfirmasi sebelum delete.

```svelte
<script lang="ts">
  interface Props {
    title?: string;
    message: string;
    visible?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let { title = "Konfirmasi", message, visible = $bindable(false),
        onConfirm, onCancel }: Props = $props();
</script>

{#if visible}
  <!-- Overlay + centered dialog -->
  <div class="dialog-overlay" onclick={onCancel}>
    <div class="dialog-card glass-card" onclick|stopPropagation>
      <h3>{title}</h3>
      <p>{message}</p>
      <div class="dialog-actions">
        <button class="btn-secondary" onclick={onCancel}>Batal</button>
        <button class="btn-danger" onclick={onConfirm}>Hapus</button>
      </div>
    </div>
  </div>
{/if}
```

### `src/lib/components/admin/index.ts`

Barrel export semua admin components:

```ts
export { default as FormField } from "./FormField.svelte";
export { default as TextArea } from "./TextArea.svelte";
export { default as Toast } from "./Toast.svelte";
export { default as ConfirmDialog } from "./ConfirmDialog.svelte";
```

---

## Task 3.2: CRUD Organisasi (Singleton Edit)

Organisasi adalah singleton (hanya 1 record, id=1). Jadi halaman ini hanya **Edit**, tidak ada Create/Delete/List.

### File: `src/routes/admin/organisasi/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  const organization = await prisma.organization.findUnique({
    where: { id: 1 },
  });
  return { organization };
};

export const actions: Actions = {
  update: async ({ request }) => {
    const formData = await request.formData();

    const nama = formData.get("nama") as string;
    const namaLengkap = formData.get("namaLengkap") as string;
    const visi = formData.get("visi") as string;
    const misi = formData.get("misi") as string;
    const tujuan = formData.get("tujuan") as string;
    const logoSmallUrl = formData.get("logoSmallUrl") as string;
    const logoBigUrl = formData.get("logoBigUrl") as string;

    // Validasi
    const errors: Record<string, string> = {};
    if (!nama?.trim()) errors.nama = "Nama wajib diisi";
    if (!namaLengkap?.trim()) errors.namaLengkap = "Nama lengkap wajib diisi";
    if (!visi?.trim()) errors.visi = "Visi wajib diisi";
    if (!misi?.trim()) errors.misi = "Misi wajib diisi";
    if (!tujuan?.trim()) errors.tujuan = "Tujuan wajib diisi";

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors, values: { nama, namaLengkap, visi, misi, tujuan, logoSmallUrl, logoBigUrl } });
    }

    await prisma.organization.upsert({
      where: { id: 1 },
      update: { nama, namaLengkap, visi, misi, tujuan, logoSmallUrl, logoBigUrl },
      create: {
        id: 1, nama, namaLengkap, visi, misi, tujuan, logoSmallUrl, logoBigUrl,
      },
    });

    return { success: true, message: "Data organisasi berhasil diperbarui" };
  },
};
```

### File: `src/routes/admin/organisasi/+page.svelte`

**Layout form:**

```
┌─────────────────────────────────────────────┐
│ Edit Data Organisasi                        │
├─────────────────────────────────────────────┤
│                                             │
│ Nama Organisasi:     [HIMATIF           ]   │
│ Nama Lengkap:        [Himpunan Maha...  ]   │
│                                             │
│ Logo Kecil URL:      [https://...       ]   │
│ Logo Besar URL:      [https://...       ]   │
│  (Preview gambar jika URL valid)            │
│                                             │
│ Visi:                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ Menjadi wadah yang mendorong...         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Misi:                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ (textarea - JSON array of strings       │ │
│ │  atau satu misi per baris)              │ │
│ └─────────────────────────────────────────┘ │
│ Hint: "Tulis satu misi per baris"           │
│                                             │
│ Tujuan:                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ Menjadi wadah yang mendorong...         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│                          [Simpan Perubahan] │
└─────────────────────────────────────────────┘
```

**Catatan penting tentang field Misi:**
- Di database, `misi` disimpan sebagai `Text` (string)
- Di seed script, misi disimpan sebagai JSON array: `["misi 1", "misi 2", "misi 3"]`
- Di form: tampilkan sebagai textarea, satu misi per baris
- Saat load: `JSON.parse(misi)` -> join dengan `\n`
- Saat save: split by `\n` -> filter empty -> `JSON.stringify(array)`

**Behavior:**
- Form pakai `use:enhance` dari SvelteKit untuk progressive enhancement
- Sukses: tampilkan Toast "Data organisasi berhasil diperbarui"
- Error: tampilkan error per field

---

## Task 3.3: CRUD Divisi

### 3.3.1 List Divisi

#### File: `src/routes/admin/divisi/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  const divisiList = await prisma.devisi.findMany({
    include: {
      _count: { select: { member: true } },
    },
    orderBy: { nama: "asc" },
  });
  return { divisiList };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id || isNaN(id)) {
      return fail(400, { error: "ID tidak valid" });
    }

    // Cek apakah divisi ada
    const divisi = await prisma.devisi.findUnique({ where: { id } });
    if (!divisi) {
      return fail(404, { error: "Divisi tidak ditemukan" });
    }

    // Delete (member yang terkait akan di-set devisiId = null karena onDelete: SetNull)
    await prisma.devisi.delete({ where: { id } });

    return { success: true, message: `Divisi "${divisi.nama}" berhasil dihapus` };
  },
};
```

#### File: `src/routes/admin/divisi/+page.svelte`

**Layout:**

```
┌──────────────────────────────────────────────────┐
│ Divisi                          [+ Tambah Divisi]│
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌────┬──────────┬─────────────┬────────┬───────┐ │
│ │ No │ Nama     │ Nama Lkp    │ Member │ Aksi  │ │
│ ├────┼──────────┼─────────────┼────────┼───────┤ │
│ │ 1  │ Kominfo  │ Kominfo ... │ 5      │ ✏️ 🗑 │ │
│ │ 2  │ Humas    │ Humas - ... │ 3      │ ✏️ 🗑 │ │
│ │ 3  │ DBM      │ DBM - De... │ 4      │ ✏️ 🗑 │ │
│ └────┴──────────┴─────────────┴────────┴───────┘ │
│                                                  │
│ Empty state: "Belum ada divisi. Klik tombol       │
│ '+ Tambah Divisi' untuk menambahkan."            │
└──────────────────────────────────────────────────┘
```

**Fitur:**
- Tabel dengan kolom: No, Nama, Nama Lengkap, Jumlah Member, Aksi
- Tombol Edit -> navigate ke `/admin/divisi/[id]/edit`
- Tombol Delete -> tampilkan `ConfirmDialog`, submit form action `delete`
- Tombol "+ Tambah Divisi" -> navigate ke `/admin/divisi/tambah`
- Empty state jika belum ada data

### 3.3.2 Tambah Divisi

#### File: `src/routes/admin/divisi/tambah/+page.server.ts`

```ts
import type { Actions } from "./$types";
import { prisma } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const nama = (formData.get("nama") as string)?.trim();
    const namaLengkap = (formData.get("namaLengkap") as string)?.trim();
    const logoUrl = (formData.get("logoUrl") as string)?.trim();
    const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;
    const deskripsi = (formData.get("deskripsi") as string)?.trim();

    // Validasi
    const errors: Record<string, string> = {};
    if (!nama) errors.nama = "Nama divisi wajib diisi";
    if (!namaLengkap) errors.namaLengkap = "Nama lengkap wajib diisi";
    if (!logoUrl) errors.logoUrl = "URL logo wajib diisi";
    if (!deskripsi) errors.deskripsi = "Deskripsi wajib diisi";

    // Cek nama unik
    if (nama) {
      const existing = await prisma.devisi.findUnique({ where: { nama } });
      if (existing) errors.nama = "Nama divisi sudah digunakan";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi },
      });
    }

    await prisma.devisi.create({
      data: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi },
    });

    throw redirect(303, "/admin/divisi");
  },
};
```

#### File: `src/routes/admin/divisi/tambah/+page.svelte`

**Layout form:**

```
┌─────────────────────────────────────────────┐
│ ← Kembali    Tambah Divisi Baru             │
├─────────────────────────────────────────────┤
│                                             │
│ Nama Divisi *:       [                  ]   │
│ Nama Lengkap *:      [                  ]   │
│ URL Logo *:          [https://...       ]   │
│ URL Thumbnail:       [https://...       ]   │
│  (Preview gambar)                           │
│                                             │
│ Deskripsi *:                                │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Batal]                     [Simpan Divisi] │
└─────────────────────────────────────────────┘
```

- Form menggunakan `use:enhance`
- Tombol "Batal" -> kembali ke list divisi
- Validasi error ditampilkan di bawah masing-masing field
- Setelah sukses -> redirect ke list divisi

### 3.3.3 Edit Divisi

#### File: `src/routes/admin/divisi/[id]/edit/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { error, fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw error(400, "ID tidak valid");

  const divisi = await prisma.devisi.findUnique({ where: { id } });
  if (!divisi) throw error(404, "Divisi tidak ditemukan");

  return { divisi };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const id = Number(params.id);
    const formData = await request.formData();

    const nama = (formData.get("nama") as string)?.trim();
    const namaLengkap = (formData.get("namaLengkap") as string)?.trim();
    const logoUrl = (formData.get("logoUrl") as string)?.trim();
    const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;
    const deskripsi = (formData.get("deskripsi") as string)?.trim();

    // Validasi
    const errors: Record<string, string> = {};
    if (!nama) errors.nama = "Nama divisi wajib diisi";
    if (!namaLengkap) errors.namaLengkap = "Nama lengkap wajib diisi";
    if (!logoUrl) errors.logoUrl = "URL logo wajib diisi";
    if (!deskripsi) errors.deskripsi = "Deskripsi wajib diisi";

    // Cek nama unik (exclude current divisi)
    if (nama) {
      const existing = await prisma.devisi.findFirst({
        where: { nama, id: { not: id } },
      });
      if (existing) errors.nama = "Nama divisi sudah digunakan";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi },
      });
    }

    await prisma.devisi.update({
      where: { id },
      data: { nama, namaLengkap, logoUrl, thumbnailUrl, deskripsi },
    });

    throw redirect(303, "/admin/divisi");
  },
};
```

#### File: `src/routes/admin/divisi/[id]/edit/+page.svelte`

Sama seperti form tambah, tapi pre-filled dengan data existing dari `data.divisi`.

---

## File Structure Setelah Sprint 3

```
src/routes/admin/
  organisasi/
    +page.server.ts         # Load org + form action update
    +page.svelte            # Edit form (singleton)
  divisi/
    +page.server.ts         # List + delete action
    +page.svelte            # Table list
    tambah/
      +page.server.ts       # Create action
      +page.svelte          # Create form
    [id]/
      edit/
        +page.server.ts     # Load divisi + update action
        +page.svelte        # Edit form

src/lib/components/admin/
  FormField.svelte          # Reusable input
  TextArea.svelte           # Reusable textarea
  Toast.svelte              # Notification
  ConfirmDialog.svelte      # Delete confirmation
  index.ts                  # Barrel export
```

---

## Checklist

### Reusable Components
- [ ] `FormField.svelte` - Input field dengan label + error
- [ ] `TextArea.svelte` - Textarea dengan label + error
- [ ] `Toast.svelte` - Notification toast
- [ ] `ConfirmDialog.svelte` - Delete confirmation dialog
- [ ] `index.ts` - Barrel export

### Organisasi
- [ ] `admin/organisasi/+page.server.ts` - Load + update action
- [ ] `admin/organisasi/+page.svelte` - Edit form
- [ ] Handle misi as JSON array <-> textarea (satu per baris)
- [ ] Image preview untuk logo URL
- [ ] Toast feedback setelah save

### Divisi - List
- [ ] `admin/divisi/+page.server.ts` - List + delete action
- [ ] `admin/divisi/+page.svelte` - Table view dengan member count
- [ ] Delete dengan confirmation dialog
- [ ] Empty state

### Divisi - Create
- [ ] `admin/divisi/tambah/+page.server.ts` - Create action
- [ ] `admin/divisi/tambah/+page.svelte` - Create form
- [ ] Validasi nama unik
- [ ] Redirect setelah berhasil

### Divisi - Edit
- [ ] `admin/divisi/[id]/edit/+page.server.ts` - Load + update action
- [ ] `admin/divisi/[id]/edit/+page.svelte` - Edit form (pre-filled)
- [ ] Validasi nama unik (exclude current)
- [ ] Redirect setelah berhasil

### Testing
- [ ] Test create divisi baru
- [ ] Test edit divisi existing
- [ ] Test delete divisi (cek member jadi devisiId null)
- [ ] Test validasi: nama kosong, nama duplikat
- [ ] Test edit organisasi + save + reload (data persist)
