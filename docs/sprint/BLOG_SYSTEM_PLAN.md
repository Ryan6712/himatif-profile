# Rencana Sistem Blog Markdown (Program Kerja)

Dokumen ini menjelaskan strategi implementasi **Markdown Editor** dan **Blog System** untuk mengelola data "Program Kerja" pada Sprint 5.

## 1. Arsitektur Data (Prisma)

Berdasarkan skema `schema.prisma`, tabel `Proker` memiliki field berikut yang krusial untuk sistem blog:
- `title` (String, Unique) -> Judul blog/kegiatan.
- `slug` (String, Unique) -> URL-friendly string untuk akses publik (misal: `/proker/kunjungan-industri`).
- `description` (Text) -> Deskripsi pendek/ringkasan yang muncul di kartu (*card*) daftar Proker publik.
- `content` (LongText) -> Berisi **teks *raw* Markdown** yang nantinya dirender menjadi HTML pada halaman detail.
- `thumbnailUrl` (String, Opsional) -> Gambar sampul (terintegrasi dengan komponen ImageUpload Cloudinary).
- `date` (DateTime) -> Tanggal acara / pelaksanaan proker.
- `publishedAt` (DateTime, Opsional) -> Sistem status Draf vs Publish. Jika *null*, maka blog adalah draf. Jika terisi, blog sudah di-publish.

## 2. Editor WYSIWYG (Rich Text Editor)

Untuk memberikan pengalaman menulis (UX) terbaik yang ramah pengguna, kita akan membatalkan pendekatan *raw markdown editor* dan menggantinya dengan **WYSIWYG Editor (What You See Is What You Get)**. Admin HIMATIF tidak perlu mengingat sintaks Markdown; mereka dapat memblok teks dan mengklik tombol layaknya MS Word.

### Library: Tiptap
Kita akan menggunakan **Tiptap Editor** (https://tiptap.dev/docs/editor/installation/svelte), sebuah editor teks *headless* modern yang berjalan di atas ProseMirror.
- *Headless* berarti kita berkuasa penuh atas UI/Styling *Toolbar* editor agar sejalan dengan *Glassmorphism Design Pattern* HIMATIF.
- Hasil akhir dari tulisan admin bukanlah raw markdown, melainkan **HTML bersih terstruktur**. 

*Catatan Migrasi Model*: Meskipun kita menyimpan format HTML ke database di field `content` (bertipe `LongText`), kita bisa saja membuat Tiptap mengekspor kembali menjadi struktur teks murni atau HTML langsung. Agar lebih ringan dan kompatibel dengan SvelteKit SSR, kita akan simpan dalam format HTML saja langsung.

### Konsep Komponen `RichTextEditor.svelte`
Komponen ini akan menaungi dua elemen:
1. **Toolbar (Header)**: Berisi kumpulan tombol seperti `Bold`, `Italic`, `Heading 1-3`, `Bullet List`, dan `Blockquote` menggunakan icon `@lucide/svelte`.
2. **Canvas Teks (Area Mengetik)**: Berada tepat di bawahnya. Ketika admin mengetik, area teks ini tidak memakai *scroll* jika belum diperlukan, melainkan tumbuh (*grow*) menyesuaikan teks dengan minimum tinggi. Segala bentuk gaya seperti *heading* akan langsung tampil di saat admin mengetik (WYSIWYG).

### Pengaturan Styling Hasil Render (Prose)
Baik dalam area Editor *Canvas* maupun ketika ditampilkan ke audiens publik di halaman Detail, kita akan membungkus HTML tersebut menggunakan fitur Tailwind `@tailwindcss/typography` dengan *class* `prose`:
```svelte
<!-- Tampilan Publik -->
<div class="prose prose-lg max-w-none prose-img:rounded-xl">
    {@html proker.content}
</div>
```
Ini memastikan gaya *Heading*, paragraf, margin antarkalimat akan tertata sempurna tanpa memerlukan percampuran *class* tambahan dari kita.

## 3. Alur Kerja (Workflow) Pembuatan Blog

### Step 1: Penulisan Meta Data
Admin memasukkan `Judul`. Saat judul diketik, fungsi `generateSlug(judul)` (berjalan secara reaktif) akan **otomatis mengisi field `Slug`**. (Admin bisa mengubah slug tersebut secara manual jika ia menginginkan URL yang berbeda dengan judul). Admin juga mengisi `Tanggal Kegiatan`, mengunggah `Thumbnail`, dan mengisi `Deskripsi Singkat`.

### Step 2: Penulisan Konten 
Admin mengetikkan laporan/berita/artikel di komponen `MarkdownEditor.svelte`. Admin dapat memasukkan gambar sisipan ke dalam artikel dengan cara menempel (*paste*) URL gambar dari sumber eksternal menggunakan sintaks Markdown konvensional: `![Alt Text](URL Gambar)`.

### Step 3: Tindakan Penyimpanan (*Draft vs Publish*)
Formulir (*Form Action*) akan memiliki **dua tombol aksi** khusus:
- **Simpan sebagai Draf**: Sistem SvelteKit akan menerima inputan `published=false`. Data akan masuk DB tetapi `publishedAt` tetap `null`. Publik tidak bisa melihat halamannya.
- **Publish Sekarang**: Sistem akan menerima `published=true`. Data disave dan waktu di server disetel ke field `publishedAt: new Date()`. Secara instan, program kerja tampil ke halaman publik.

## 4. Keamanan dan Batasan

1. **XSS Protection**: Walau `marked` diklaim baik, biasanya disarankan menambahkan *Sanitizer* (seperti DOMPurify) untuk menghilangkan percobaan *script injection* jika admin menempel sintaks HTML terlarang. Namun, karena ini panel *internal* yang hanya diakses admin terpercaya, kita bisa sedikit longgar.
2. **Validasi Slug**: Database sudah menetapkan field `slug` sebagai *unique*. Namun, `+page.server.ts` harus memiliki mekanisme `try-catch` jika *slug* kebetulan bertabrakan (ada judul proker kembar), lalu menolaknya dengan `fail(400)` yang ramah pada admin.

## 5. Ringkasan Eksekusi pada Kode

Nanti di implementasinya kita akan membuat:
- `src/lib/components/admin/MarkdownEditor.svelte` -> Komponen Teks Editor.
- `src/routes/admin/dashboard/proker/tambah/+page.svelte` -> Halaman Buat Baru.
- `src/routes/admin/dashboard/proker/[id]/edit/+page.svelte` -> Halaman Ubah (Dilengkapi fitur Toggle Status "Jadikan Draft/Publish Kembali").

---
Silakan lakukan review dan konfirmasi jika kamu sudah puas dengan pola alur logika kerja Blog/Proker ini.