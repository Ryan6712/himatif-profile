# Sprint 6: File Upload & Image Management

> Sistem upload gambar untuk logo organisasi, foto member, thumbnail divisi & proker
> Estimasi: 1-2 hari

---

## Prerequisites

- Sprint 3-5 selesai (semua CRUD form sudah ada dengan input URL manual)
- Semua form sudah pakai field URL untuk gambar (logoUrl, imageUrl, thumbnailUrl)

---

## Task 6.1: Pilih Storage Strategy

### Opsi yang Tersedia

| Opsi | Pros | Cons | Free Tier |
|------|------|------|-----------|
| **Cloudinary** | CDN global, transformasi gambar (resize, crop, format), SDK lengkap | Vendor lock-in | 25GB storage, 25GB bandwidth/bulan |
| **UploadThing** | Simple API, built for Next/Svelte, type-safe | Lebih baru, less features | 2GB storage |
| **Supabase Storage** | Bagian dari Supabase ecosystem, S3-compatible | Perlu Supabase project | 1GB storage |
| **Local filesystem** | Simpel, no external deps | Tidak persist di Netlify (serverless), tidak scalable | - |
| **S3 + CloudFront** | Industry standard, sangat scalable | Setup lebih kompleks, butuh AWS account | 5GB (12 bulan) |

### Rekomendasi: **Cloudinary**

Alasan:
1. Free tier paling generous (25GB)
2. Auto-optimize gambar (WebP, resize)
3. SDK untuk Node.js tersedia
4. Transformation URL (resize on-the-fly tanpa simpan banyak versi)
5. Tidak perlu manage storage sendiri

### Setup Cloudinary

1. Daftar di https://cloudinary.com (gratis)
2. Dapatkan credentials dari Dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Tambahkan ke `.env`:

```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

4. Install SDK:

```bash
npm install cloudinary
```

---

## Task 6.2: Upload Service

### File: `src/lib/server/upload.ts`

```ts
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;          // folder di cloudinary (e.g., "himatif/members")
  maxWidth?: number;         // resize max width
  maxHeight?: number;        // resize max height
  allowedFormats?: string[]; // ["jpg", "png", "webp", "gif"]
  maxSizeBytes?: number;     // max file size
}

interface UploadResult {
  url: string;          // Optimized URL
  publicId: string;     // Cloudinary public ID (for deletion)
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const DEFAULT_OPTIONS: UploadOptions = {
  folder: "himatif",
  maxWidth: 1200,
  maxHeight: 1200,
  allowedFormats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
};

/**
 * Upload file ke Cloudinary
 * @param file - File object dari FormData
 * @param options - Upload options
 * @returns UploadResult dengan URL gambar
 */
export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validasi file type
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  if (fileExt && opts.allowedFormats && !opts.allowedFormats.includes(fileExt)) {
    throw new Error(
      `Format file tidak didukung. Gunakan: ${opts.allowedFormats.join(", ")}`
    );
  }

  // Validasi file size
  if (opts.maxSizeBytes && file.size > opts.maxSizeBytes) {
    const maxMB = (opts.maxSizeBytes / (1024 * 1024)).toFixed(1);
    throw new Error(`Ukuran file terlalu besar. Maksimal ${maxMB}MB`);
  }

  // Convert File to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload ke Cloudinary
  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: opts.folder,
          resource_type: "image",
          transformation: [
            {
              width: opts.maxWidth,
              height: opts.maxHeight,
              crop: "limit", // resize hanya jika lebih besar
              quality: "auto",
              fetch_format: "auto", // auto WebP/AVIF
            },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Hapus gambar dari Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate optimized URL dengan transformasi
 * Berguna untuk thumbnail on-the-fly tanpa upload ulang
 */
export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || "fill",
    quality: "auto",
    fetch_format: "auto",
    secure: true,
  });
}
```

---

## Task 6.3: Upload API Endpoint

### File: `src/routes/api/upload/+server.ts`

```ts
import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { uploadImage } from "$lib/server/upload";

export const POST: RequestHandler = async ({ request, locals }) => {
  // Auth check - hanya admin yang bisa upload
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "himatif/general";

  if (!file || !(file instanceof File)) {
    throw error(400, "File tidak ditemukan");
  }

  // Validasi: harus image
  if (!file.type.startsWith("image/")) {
    throw error(400, "File harus berupa gambar");
  }

  try {
    const result = await uploadImage(file, { folder });

    return json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
      },
    });
  } catch (err: any) {
    throw error(400, err.message || "Upload gagal");
  }
};
```

---

## Task 6.4: ImageUpload Component

### File: `src/lib/components/admin/ImageUpload.svelte`

```svelte
<script lang="ts">
  interface Props {
    name: string;
    label?: string;
    value?: string;        // current image URL
    folder?: string;       // cloudinary folder
    previewSize?: "sm" | "md" | "lg";
    error?: string;
    required?: boolean;
    accept?: string;
  }

  let {
    name,
    label = "Gambar",
    value = $bindable(""),
    folder = "himatif/general",
    previewSize = "md",
    error: errorMsg = "",
    required = false,
    accept = "image/*",
  }: Props = $props();

  let uploading = $state(false);
  let uploadError = $state("");
  let dragOver = $state(false);
  let fileInput: HTMLInputElement;

  // Preview size classes
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  async function handleUpload(file: File) {
    uploading = true;
    uploadError = "";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Upload gagal");
      }

      const result = await response.json();
      value = result.data.url;
    } catch (err: any) {
      uploadError = err.message || "Upload gagal";
    } finally {
      uploading = false;
    }
  }

  function onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) handleUpload(file);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function onDragLeave() {
    dragOver = false;
  }

  function removeImage() {
    value = "";
  }
</script>

<div class="image-upload">
  <label>{label}{required ? " *" : ""}</label>

  <!-- Hidden file input -->
  <input
    type="file"
    {accept}
    bind:this={fileInput}
    onchange={onFileSelect}
    class="hidden"
  />

  <!-- Hidden input untuk form submission (menyimpan URL) -->
  <input type="hidden" {name} {value} />

  {#if value}
    <!-- Preview + Replace/Remove -->
    <div class="preview-container">
      <img src={value} alt="Preview" class="{sizeClasses[previewSize]} object-cover rounded-lg" />
      <div class="preview-actions">
        <button type="button" onclick={() => fileInput.click()} class="btn-sm">
          Ganti
        </button>
        <button type="button" onclick={removeImage} class="btn-sm btn-danger">
          Hapus
        </button>
      </div>
    </div>
  {:else}
    <!-- Drop zone -->
    <div
      class="drop-zone"
      class:drag-over={dragOver}
      class:uploading
      ondrop={onDrop}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      onclick={() => fileInput.click()}
      role="button"
      tabindex="0"
    >
      {#if uploading}
        <div class="upload-spinner">Mengupload...</div>
      {:else}
        <div class="drop-zone-content">
          <span class="drop-icon">📁</span>
          <p>Drag & drop gambar di sini</p>
          <p class="text-sm opacity-60">atau klik untuk pilih file</p>
          <p class="text-xs opacity-40">Max 5MB. Format: JPG, PNG, WebP, GIF</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Fallback: manual URL input -->
  <details class="mt-2">
    <summary class="text-sm cursor-pointer opacity-60">
      Atau masukkan URL manual
    </summary>
    <input
      type="url"
      bind:value
      placeholder="https://example.com/image.jpg"
      class="mt-1 w-full"
    />
  </details>

  {#if uploadError}
    <span class="error-text">{uploadError}</span>
  {/if}
  {#if errorMsg}
    <span class="error-text">{errorMsg}</span>
  {/if}
</div>

<style>
  .drop-zone {
    border: 2px dashed var(--color-border, #ccc);
    border-radius: 0.75rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .drop-zone:hover,
  .drop-zone.drag-over {
    border-color: var(--color-primary, #7BED4F);
    background: var(--color-primary, #7BED4F) / 0.05;
  }

  .drop-zone.uploading {
    opacity: 0.6;
    pointer-events: none;
  }

  .preview-container {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
</style>
```

**Fitur komponen:**
- **Drag & drop**: drag gambar ke drop zone
- **Click to select**: klik drop zone untuk buka file picker
- **Preview**: tampilkan gambar setelah upload
- **Replace/Remove**: ganti atau hapus gambar
- **Manual URL fallback**: collapsible input URL manual (untuk backward compatibility)
- **Loading state**: spinner saat upload
- **Hidden input**: menyimpan URL untuk form submission (kompatibel dengan form actions)
- **Validation**: tipe file, ukuran file

---

## Task 6.5: Update Semua Form CRUD

Ganti setiap input URL manual di form-form berikut dengan komponen `ImageUpload`:

### Organisasi (`admin/organisasi/+page.svelte`)

```diff
- <FormField label="URL Logo Kecil" name="logoSmallUrl" value={...} />
- <FormField label="URL Logo Besar" name="logoBigUrl" value={...} />
+ <ImageUpload name="logoSmallUrl" label="Logo Kecil" value={...}
+   folder="himatif/org" previewSize="sm" />
+ <ImageUpload name="logoBigUrl" label="Logo Besar" value={...}
+   folder="himatif/org" previewSize="lg" />
```

### Divisi - Tambah & Edit (`admin/divisi/tambah`, `admin/divisi/[id]/edit`)

```diff
- <FormField label="URL Logo" name="logoUrl" value={...} />
- <FormField label="URL Thumbnail" name="thumbnailUrl" value={...} />
+ <ImageUpload name="logoUrl" label="Logo Divisi" value={...}
+   folder="himatif/divisi" previewSize="sm" required />
+ <ImageUpload name="thumbnailUrl" label="Thumbnail" value={...}
+   folder="himatif/divisi" previewSize="md" />
```

### Anggota - Tambah & Edit (`admin/anggota/tambah`, `admin/anggota/[id]/edit`)

```diff
- <FormField label="URL Foto" name="imageUrl" value={...} />
+ <ImageUpload name="imageUrl" label="Foto Anggota" value={...}
+   folder="himatif/members" previewSize="md" required />
```

### Proker - Tambah & Edit (`admin/proker/tambah`, `admin/proker/[id]/edit`)

```diff
- <FormField label="URL Thumbnail" name="thumbnailUrl" value={...} />
+ <ImageUpload name="thumbnailUrl" label="Thumbnail" value={...}
+   folder="himatif/proker" previewSize="lg" />
```

---

## Task 6.6: Env Variables Update

### `.env` tambahan

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Update `.env.local` dan Netlify env vars sesuai

---

## Alternatif: Tanpa Cloud Storage

Jika tidak mau pakai cloud storage, bisa tetap pakai **input URL manual** saja:
- User upload gambar ke layanan lain (Imgur, Discord CDN, Google Drive, dll)
- Copy-paste URL ke form
- Komponen `ImageUpload` tetap bisa dipakai dengan mode "URL only" (tanpa drop zone)

Ini valid untuk project kecil/internal. Tinggal skip Task 6.1-6.3 dan langsung pakai `FormField` biasa untuk URL.

---

## File Structure Setelah Sprint 6

```
src/lib/server/
  upload.ts                    # Cloudinary upload service

src/routes/api/
  upload/
    +server.ts                 # Upload API endpoint (POST)

src/lib/components/admin/
  ImageUpload.svelte           # Drag & drop + preview upload component
  (existing components)
```

---

## Checklist

### Storage Setup
- [ ] Pilih storage provider (Cloudinary recommended)
- [ ] Buat account + dapatkan credentials
- [ ] Install SDK (`npm install cloudinary`)
- [ ] Tambah env variables

### Upload Service
- [ ] `src/lib/server/upload.ts` - Upload, delete, optimize functions
- [ ] Validasi file type (image only)
- [ ] Validasi file size (max 5MB)
- [ ] Auto-resize dan optimize

### API Endpoint
- [ ] `src/routes/api/upload/+server.ts` - POST handler
- [ ] Auth check (hanya admin)
- [ ] Error handling yang jelas

### ImageUpload Component
- [ ] `ImageUpload.svelte`
- [ ] Drag & drop zone
- [ ] Click to select file
- [ ] Upload progress / loading state
- [ ] Image preview setelah upload
- [ ] Replace / remove gambar
- [ ] Manual URL input fallback
- [ ] Hidden input untuk form submission
- [ ] Error display

### Update Forms
- [ ] Organisasi form - ganti URL input dengan ImageUpload
- [ ] Divisi tambah/edit form - ganti URL input dengan ImageUpload
- [ ] Anggota tambah/edit form - ganti URL input dengan ImageUpload
- [ ] Proker tambah/edit form - ganti URL input dengan ImageUpload

### Testing
- [ ] Test upload gambar (JPG, PNG, WebP)
- [ ] Test file terlalu besar (> 5MB) -> error message
- [ ] Test file bukan gambar -> error message
- [ ] Test drag & drop upload
- [ ] Test replace gambar
- [ ] Test remove gambar
- [ ] Test manual URL input fallback
- [ ] Test upload tanpa login -> 401
- [ ] Test form submit dengan gambar yang sudah diupload
- [ ] Test deploy: pastikan env vars ter-set di production
