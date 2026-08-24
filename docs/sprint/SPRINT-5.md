# Sprint 5: CRUD Program Kerja (Blog System)

> Full CRUD Program Kerja dengan markdown editor, publish/draft system, dan public detail page
> Estimasi: 2-3 hari

---

## Prerequisites

- Sprint 3-4 selesai (reusable components, CRUD pattern sudah established)
- `marked` sudah terinstall sebagai dependency
- `src/lib/utils/slug.ts` sudah diimplementasi (Sprint 1)
- `src/lib/utils/markdown.ts` sudah diimplementasi (Sprint 1)

---

## Task 5.1: Utility Functions (jika belum dari Sprint 1)

### File: `src/lib/utils/slug.ts`

```ts
/**
 * Generate URL-safe slug dari title
 * "Lomba Slicing Design tingkat SMA/SMK" -> "lomba-slicing-design-tingkat-sma-smk"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // hapus special chars
    .replace(/\s+/g, "-")           // spasi -> dash
    .replace(/-+/g, "-")            // multiple dash -> single
    .replace(/^-|-$/g, "");          // trim dash di awal/akhir
}
```

### File: `src/lib/utils/markdown.ts`

```ts
import { marked } from "marked";

// Konfigurasi marked
marked.setOptions({
  breaks: true,    // \n -> <br>
  gfm: true,       // GitHub Flavored Markdown
});

/**
 * Parse markdown string ke HTML
 */
export function parseMarkdown(content: string): string {
  return marked.parse(content) as string;
}

/**
 * Parse markdown async (untuk content yang besar)
 */
export async function parseMarkdownAsync(content: string): Promise<string> {
  return await marked.parse(content);
}
```

---

## Task 5.2: List Program Kerja

### File: `src/routes/admin/proker/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || ""; // "published" | "draft" | ""

  // Build where clause
  const where: any = {};

  if (search) {
    where.title = { contains: search };
  }

  if (status === "published") {
    where.publishedAt = { not: null };
  } else if (status === "draft") {
    where.publishedAt = null;
  }

  const [prokerList, totalCount] = await Promise.all([
    prisma.proker.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        date: true,
        thumbnailUrl: true,
        description: true,  // short description saja, bukan full content
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.proker.count({ where }),
  ]);

  return {
    prokerList,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    filters: { search, status },
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id || isNaN(id)) return fail(400, { error: "ID tidak valid" });

    const proker = await prisma.proker.findUnique({ where: { id } });
    if (!proker) return fail(404, { error: "Program kerja tidak ditemukan" });

    await prisma.proker.delete({ where: { id } });
    return { success: true, message: `"${proker.title}" berhasil dihapus` };
  },

  togglePublish: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id || isNaN(id)) return fail(400, { error: "ID tidak valid" });

    const proker = await prisma.proker.findUnique({ where: { id } });
    if (!proker) return fail(404, { error: "Program kerja tidak ditemukan" });

    // Toggle: jika published -> draft, jika draft -> publish
    const publishedAt = proker.publishedAt ? null : new Date();

    await prisma.proker.update({
      where: { id },
      data: { publishedAt },
    });

    const action = publishedAt ? "dipublish" : "dijadikan draft";
    return { success: true, message: `"${proker.title}" berhasil ${action}` };
  },
};
```

### File: `src/routes/admin/proker/+page.svelte`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Program Kerja                             [+ Tambah Proker]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Filter:                                                         │
│ [🔍 Cari judul...    ] [Status ▼: Semua/Published/Draft]        │
│                                                                 │
│ ┌────┬──────────────────┬────────────┬───────────┬────────────┐ │
│ │ No │ Judul            │ Tanggal    │ Status    │ Aksi       │ │
│ ├────┼──────────────────┼────────────┼───────────┼────────────┤ │
│ │ 1  │ Upgrading Org... │ 1 Jun 2024 │ Published │ 👁 ✏️ 🔄 🗑│ │
│ │ 2  │ Lomba Slicing... │ 21 Mei 2026│ Published │ 👁 ✏️ 🔄 🗑│ │
│ │ 3  │ HIMATIF Intro... │ 1 Jan 2027 │ Draft     │ 👁 ✏️ 🔄 🗑│ │
│ └────┴──────────────────┴────────────┴───────────┴────────────┘ │
│                                                                 │
│ Pagination:  « 1 »                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Kolom Aksi:**

| Tombol | Icon | Fungsi |
|--------|------|--------|
| Preview | `Eye` | Link ke public page `/proker/[slug]` (target: _blank) |
| Edit | `Pencil` | Navigate ke `/admin/proker/[id]/edit` |
| Toggle | `ToggleLeft`/`ToggleRight` | Publish/Unpublish (form action `togglePublish`) |
| Delete | `Trash2` | Delete dengan ConfirmDialog |

**Status badge:**
- `Published` -> badge hijau
- `Draft` -> badge abu-abu/kuning

---

## Task 5.3: Markdown Editor Component

### File: `src/lib/components/admin/MarkdownEditor.svelte`

Ini komponen kunci untuk Sprint 5. Editor markdown dengan live preview.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ Konten (Markdown)                                   │
│                                                     │
│ Tab: [Editor] [Preview] [Split]  ← mode switcher    │
│                                                     │
│ ┌─────────────────────┬───────────────────────────┐ │
│ │                     │                           │ │
│ │ # Heading           │ Heading                   │ │
│ │                     │                           │ │
│ │ Paragraph text      │ Paragraph text rendered   │ │
│ │ **bold**            │ as HTML with prose style   │ │
│ │                     │                           │ │
│ │ - list item 1       │ • list item 1             │ │
│ │ - list item 2       │ • list item 2             │ │
│ │                     │                           │ │
│ │    TEXTAREA         │      PREVIEW              │ │
│ └─────────────────────┴───────────────────────────┘ │
│                                                     │
│ Toolbar (opsional, nice to have):                   │
│ [B] [I] [H] [Link] [Image] [List] [Code]           │
└─────────────────────────────────────────────────────┘
```

```svelte
<script lang="ts">
  import { parseMarkdown } from "$lib/utils/markdown";

  interface Props {
    name: string;
    value?: string;
    label?: string;
    error?: string;
    rows?: number;
  }

  let { name, value = $bindable(""), label = "Konten",
        error = "", rows = 20 }: Props = $props();

  type ViewMode = "editor" | "preview" | "split";
  let viewMode: ViewMode = $state("split");

  // Render preview dari markdown
  let htmlPreview = $derived(parseMarkdown(value));
</script>

<div class="markdown-editor">
  <div class="editor-header">
    <label>{label}</label>
    <div class="mode-switcher">
      <button type="button" class:active={viewMode === "editor"}
              onclick={() => viewMode = "editor"}>Editor</button>
      <button type="button" class:active={viewMode === "preview"}
              onclick={() => viewMode = "preview"}>Preview</button>
      <button type="button" class:active={viewMode === "split"}
              onclick={() => viewMode = "split"}>Split</button>
    </div>
  </div>

  <div class="editor-body" class:split={viewMode === "split"}>
    {#if viewMode !== "preview"}
      <textarea {name} bind:value {rows} class="editor-textarea"
                class:error={!!error}></textarea>
    {/if}

    {#if viewMode !== "editor"}
      <div class="preview-pane prose">
        {@html htmlPreview}
      </div>
    {/if}
  </div>

  {#if error}
    <span class="error-text">{error}</span>
  {/if}
</div>

<style>
  .editor-body.split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .preview-pane {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-y: auto;
    max-height: 500px;
  }

  /* Mobile: force tab mode, no split */
  @media (max-width: 768px) {
    .editor-body.split {
      grid-template-columns: 1fr;
    }
    .editor-body.split .preview-pane {
      display: none; /* atau switch ke tab mode */
    }
  }
</style>
```

**Toolbar buttons (nice to have, bisa di-skip dulu):**

| Button | Insert text |
|--------|-------------|
| Bold | `**text**` |
| Italic | `*text*` |
| Heading | `## ` di awal baris |
| Link | `[text](url)` |
| Image | `![alt](url)` |
| List | `- ` di awal baris |
| Code | `` `code` `` atau code block |

Implementasi toolbar: insert text di posisi cursor textarea. Gunakan `textarea.selectionStart` dan `textarea.selectionEnd`.

---

## Task 5.4: Tambah Program Kerja

### File: `src/routes/admin/proker/tambah/+page.server.ts`

```ts
import type { Actions } from "./$types";
import { prisma } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";
import { generateSlug } from "$lib/utils/slug";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const title = (formData.get("title") as string)?.trim();
    const dateStr = formData.get("date") as string;
    const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;
    const description = (formData.get("description") as string)?.trim();
    const content = (formData.get("content") as string) || "";
    let slug = (formData.get("slug") as string)?.trim();
    const shouldPublish = formData.get("publish") === "true";

    // Auto-generate slug jika kosong
    if (!slug && title) {
      slug = generateSlug(title);
    }

    // Validasi
    const errors: Record<string, string> = {};
    if (!title) errors.title = "Judul wajib diisi";
    if (!dateStr) errors.date = "Tanggal wajib diisi";
    if (!description) errors.description = "Deskripsi singkat wajib diisi";
    if (!content) errors.content = "Konten wajib diisi";
    if (!slug) errors.slug = "Slug wajib diisi";

    // Validasi unik
    if (title) {
      const existingTitle = await prisma.proker.findUnique({ where: { title } });
      if (existingTitle) errors.title = "Judul sudah digunakan";
    }
    if (slug) {
      const existingSlug = await prisma.proker.findUnique({ where: { slug } });
      if (existingSlug) errors.slug = "Slug sudah digunakan";
    }

    // Validasi date format
    let date: Date | null = null;
    if (dateStr) {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) errors.date = "Format tanggal tidak valid";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { title, date: dateStr, thumbnailUrl, description, content, slug },
      });
    }

    await prisma.proker.create({
      data: {
        title,
        date: date!,
        thumbnailUrl,
        description,
        content,
        slug,
        publishedAt: shouldPublish ? new Date() : null,
      },
    });

    throw redirect(303, "/admin/proker");
  },
};
```

### File: `src/routes/admin/proker/tambah/+page.svelte`

**Layout form:**

```
┌─────────────────────────────────────────────────────────┐
│ ← Kembali    Tambah Program Kerja Baru                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Judul *:             [                              ]   │
│ Slug:                [auto-generated-dari-judul     ]   │
│   (auto-generate dari judul, bisa diedit manual)        │
│                                                         │
│ Tanggal *:           [📅 date picker               ]   │
│ URL Thumbnail:       [https://...                   ]   │
│  (Preview thumbnail)                                    │
│                                                         │
│ Deskripsi Singkat *:                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ (textarea pendek, 2-3 baris, untuk card preview)    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Konten (Markdown) *:                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Editor] [Preview] [Split]                          │ │
│ │ ┌───────────────────┬─────────────────────────────┐ │ │
│ │ │ # Heading         │ Heading                     │ │ │
│ │ │ paragraph         │ paragraph rendered          │ │ │
│ │ │ ...               │ ...                         │ │ │
│ │ └───────────────────┴─────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Batal]          [Simpan Draft]  [Publish Sekarang]     │
└─────────────────────────────────────────────────────────┘
```

**Auto-slug behavior:**
- Saat user ketik di field "Judul", slug otomatis di-generate
- User bisa manual edit slug (override auto-generate)
- Jika user sudah manual edit slug, auto-generate berhenti (flag `slugManuallyEdited`)

```svelte
<script lang="ts">
  import { generateSlug } from "$lib/utils/slug";
  import MarkdownEditor from "$lib/components/admin/MarkdownEditor.svelte";

  let title = $state("");
  let slug = $state("");
  let slugManuallyEdited = $state(false);

  // Auto-generate slug dari title
  $effect(() => {
    if (!slugManuallyEdited && title) {
      slug = generateSlug(title);
    }
  });

  function onSlugInput() {
    slugManuallyEdited = true;
  }
</script>
```

**Dua tombol submit:**
- "Simpan Draft" -> submit form tanpa `publish=true`
- "Publish Sekarang" -> submit form dengan hidden input `publish=true`

---

## Task 5.5: Edit Program Kerja

### File: `src/routes/admin/proker/[id]/edit/+page.server.ts`

```ts
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { error, fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw error(400, "ID tidak valid");

  const proker = await prisma.proker.findUnique({ where: { id } });
  if (!proker) throw error(404, "Program kerja tidak ditemukan");

  return { proker };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const id = Number(params.id);
    const formData = await request.formData();

    const title = (formData.get("title") as string)?.trim();
    const dateStr = formData.get("date") as string;
    const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;
    const description = (formData.get("description") as string)?.trim();
    const content = (formData.get("content") as string) || "";
    const slug = (formData.get("slug") as string)?.trim();
    const shouldPublish = formData.get("publish") === "true";
    const shouldUnpublish = formData.get("unpublish") === "true";

    // Validasi (sama seperti create, tapi cek unik exclude current)
    const errors: Record<string, string> = {};
    if (!title) errors.title = "Judul wajib diisi";
    if (!dateStr) errors.date = "Tanggal wajib diisi";
    if (!description) errors.description = "Deskripsi singkat wajib diisi";
    if (!content) errors.content = "Konten wajib diisi";
    if (!slug) errors.slug = "Slug wajib diisi";

    if (title) {
      const existing = await prisma.proker.findFirst({
        where: { title, id: { not: id } },
      });
      if (existing) errors.title = "Judul sudah digunakan";
    }
    if (slug) {
      const existing = await prisma.proker.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) errors.slug = "Slug sudah digunakan";
    }

    let date: Date | null = null;
    if (dateStr) {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) errors.date = "Format tanggal tidak valid";
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { title, date: dateStr, thumbnailUrl, description, content, slug },
      });
    }

    // Determine publishedAt
    let publishedAt: Date | null | undefined = undefined; // don't change
    if (shouldPublish) publishedAt = new Date();
    if (shouldUnpublish) publishedAt = null;

    await prisma.proker.update({
      where: { id },
      data: {
        title,
        date: date!,
        thumbnailUrl,
        description,
        content,
        slug,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      },
    });

    throw redirect(303, "/admin/proker");
  },
};
```

### File: `src/routes/admin/proker/[id]/edit/+page.svelte`

Sama seperti form tambah, tapi:
- Pre-filled dengan data existing
- Slug field: `slugManuallyEdited = true` by default (karena sudah ada slug)
- Tambahan tombol: "Unpublish" jika status published, "Publish" jika draft
- Tampilkan status saat ini (Published on [date] / Draft)

---

## Task 5.6: Update Public Proker Detail Page

### File: `src/routes/(public)/proker/[slug]/+page.server.ts`

```ts
import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const proker = await prisma.proker.findUnique({
    where: { slug: params.slug },
  });

  // Hanya tampilkan yang sudah published
  if (!proker || !proker.publishedAt) {
    throw error(404, "Program kerja tidak ditemukan");
  }

  return { proker };
};
```

### File: `src/routes/(public)/proker/[slug]/+page.svelte`

```svelte
<script lang="ts">
  import { parseMarkdown } from "$lib/utils/markdown";

  let { data } = $props();

  const htmlContent = $derived(parseMarkdown(data.proker.content));

  // Format tanggal
  const formattedDate = $derived(
    new Date(data.proker.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
</script>

<article class="container section stack-lg">
  <!-- Header -->
  <header class="stack-sm">
    <a href="/proker" class="text-sm opacity-60">← Kembali ke Program Kerja</a>
    <h1 class="text-3xl font-bold">{data.proker.title}</h1>
    <time class="text-sm opacity-60">{formattedDate}</time>
  </header>

  <!-- Thumbnail -->
  {#if data.proker.thumbnailUrl}
    <img src={data.proker.thumbnailUrl} alt={data.proker.title}
         class="w-full max-h-96 object-cover rounded-2xl" />
  {/if}

  <!-- Content (rendered markdown) -->
  <div class="prose prose-lg max-w-none">
    {@html htmlContent}
  </div>
</article>
```

**Styling:**
- Gunakan `@tailwindcss/typography` plugin (sudah terinstall)
- Class `prose` otomatis style headings, paragraphs, lists, code blocks, dll
- Custom prose styling kalau perlu (warna link, heading sizes) via CSS

### Hapus route lama

- [ ] **Hapus** `src/routes/(public)/proker/proker-detail/` (route static placeholder)

### Update proker list page link

Di `(public)/proker/+page.svelte`, update link "baca selengkapnya" dari hardcoded `/proker/proker-detail` ke dynamic `/proker/${proker.slug}`.

---

## File Structure Setelah Sprint 5

```
src/routes/admin/
  proker/
    +page.server.ts             # List + delete + togglePublish actions
    +page.svelte                # Table with filters
    tambah/
      +page.server.ts           # Create action
      +page.svelte              # Create form with markdown editor
    [id]/
      edit/
        +page.server.ts         # Load + update action
        +page.svelte            # Edit form with markdown editor

src/routes/(public)/
  proker/
    [slug]/
      +page.server.ts           # Load by slug (published only)
      +page.svelte              # Render markdown content

src/lib/components/admin/
  MarkdownEditor.svelte         # Markdown editor with preview
  (existing components)

src/lib/utils/
  slug.ts                       # generateSlug function
  markdown.ts                   # parseMarkdown function
```

---

## Checklist

### Utilities
- [ ] `src/lib/utils/slug.ts` - generateSlug (jika belum dari Sprint 1)
- [ ] `src/lib/utils/markdown.ts` - parseMarkdown dengan marked

### List Proker
- [ ] `admin/proker/+page.server.ts` - List + delete + togglePublish
- [ ] `admin/proker/+page.svelte` - Table view
- [ ] Search by title
- [ ] Filter by status (Published/Draft)
- [ ] Pagination
- [ ] Toggle publish/unpublish action
- [ ] Delete dengan confirmation
- [ ] Preview link (buka public page di tab baru)
- [ ] Status badge (Published hijau, Draft abu)

### Tambah Proker
- [ ] `admin/proker/tambah/+page.server.ts` - Create action
- [ ] `admin/proker/tambah/+page.svelte` - Create form
- [ ] Auto-generate slug dari title
- [ ] Slug bisa diedit manual
- [ ] Validasi title dan slug unik
- [ ] Date picker
- [ ] Deskripsi singkat (textarea)
- [ ] Markdown editor untuk content
- [ ] Dua opsi submit: "Simpan Draft" dan "Publish Sekarang"

### Edit Proker
- [ ] `admin/proker/[id]/edit/+page.server.ts` - Load + update
- [ ] `admin/proker/[id]/edit/+page.svelte` - Edit form (pre-filled)
- [ ] Publish/Unpublish toggle di edit page
- [ ] Tampilkan status saat ini

### Markdown Editor Component
- [ ] `MarkdownEditor.svelte` - Split editor/preview
- [ ] 3 view modes: Editor, Preview, Split
- [ ] Live preview menggunakan marked
- [ ] Preview styled dengan prose (typography plugin)
- [ ] Responsive (mobile: tab mode)
- [ ] Toolbar buttons (nice to have / bisa skip dulu)

### Public Proker Detail
- [ ] `(public)/proker/[slug]/+page.server.ts` - Load by slug
- [ ] `(public)/proker/[slug]/+page.svelte` - Render markdown
- [ ] Hanya tampilkan proker yang published
- [ ] 404 untuk slug tidak ditemukan atau draft
- [ ] Styled dengan prose/typography
- [ ] Back link ke list proker
- [ ] Hapus route lama `proker/proker-detail/`
- [ ] Update link di list proker ke dynamic `/proker/[slug]`

### Testing
- [ ] Test create proker (draft dan publish)
- [ ] Test edit proker
- [ ] Test delete proker
- [ ] Test toggle publish/unpublish
- [ ] Test auto-slug generation
- [ ] Test manual slug edit
- [ ] Test markdown preview (headings, lists, bold, links, images)
- [ ] Test public detail page render
- [ ] Test 404 untuk slug invalid dan draft proker
- [ ] Test filter published vs draft
