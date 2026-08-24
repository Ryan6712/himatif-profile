# HIMATIF Design Pattern & Styling Guide

Dokumen ini adalah pedoman bagi *developer* dan *AI agent* dalam membuat, mengubah, dan merawat tampilan UI/UX pada proyek profil HIMATIF ITB Yadika. Hal ini bertujuan untuk mempertahankan konsistensi antara halaman *public* dan halaman *admin dashboard*.

## 1. Core Principles
- **Modern & Clean**: Gunakan ruang kosong (whitespace) yang cukup, *border radius* melengkung (`rounded-xl` atau `rounded-2xl`), dan *typography* yang rapi.
- **Glassmorphism**: UI sangat bertumpu pada efek *glass* (latar transparan dengan blur) dan tumpukan kartu.
- **Subtle Gradient & Patterns**: Penggunaan pola (seperti `bg-dot-pattern`) dikombinasikan dengan warna solid memberikan kesan futuristik, namun tidak mencolok.
- **Smooth Animations**: Elemen interaktif harus bereaksi lembut saat disorot (`hover-lift`, `transition-all`).

---

## 2. Design Tokens (`token.css`)

Struktur desain dikendalikan oleh variabel CSS root pada `src/lib/styles/token.css`. Gunakan variabel ini secara langsung atau melalui class Tailwind yang mewarisinya.

### A. Palet Warna (The Green Palette)
- **Primary**: `--color-primary` (`#7BED4F`) - Hijau neon terang, untuk *highlight* dan aksi utama.
- **Secondary**: `--color-secondary` (`#2D9B5A`) - Hijau gelap/zamrud, untuk *gradients*, *badges*, dan elemen penegas sekunder.
- **Tertiary**: `--color-tertiary` (`#B8D98A`) - Hijau pucat/pastel, untuk latar belakang aksen.
- **Surfaces**: `--color-background` (Latar utama, paling terang) dan `--color-surface` (sedikit lebih gelap, untuk gradasi).
- **Text**: `--color-title-text` (gelap kontras tinggi untuk *Heading*) dan `--color-primary-text` (gelap netral untuk paragraf).

### B. Shadows (Bayangan)
Bayangan ini penting untuk membedakan kedalaman (*depth*) antar kartu (khususnya untuk class `glass-card`).
- `--shadow-card` (soft)
- `--shadow-card-md` (medium)
- `--shadow-card-lg` (tajam dan menyebar, saat di-*hover*)
- `--shadow-glow` (neon hijau menyala untuk `icon-container`)

---

## 3. Base Utilities (`base.css`)

Untuk memudahkan pengembangan, ada *custom class* yang di definisikan di `src/lib/styles/base.css`. Wajib gunakan *class* ini alih-alih membuat style manual:

### Kartu & Wadah (*Containers*)
- **`.glass-card`**: **Komponen terpenting.** Memberikan latar transparan dengan gradasi hijau yang sangat tipis dan *backdrop-blur*. Wajib dipadukan dengan utility tailwind: `.rounded-2xl` dan border shadow style: `style="box-shadow: var(--shadow-card-md);"`.
- **`.glass`**: Versi yang lebih sederhana dari `glass-card` tanpa border neon.
- **`.container`**: Max-width sentral dengan *padding* yang konsisten.
- **`.section`**: Wadah per section vertikal (menambahkan ruang besar di atas dan bawah).
- **`.stack`, `.stack-sm`, `.stack-lg`**: Mengatur jarak vertikal (`margin-top`) anak elemen di dalamnya secara otomatis.

### Background
- **`.bg-dot-pattern`**: Lapisan latar belakang bintik. Biasanya dipasang dengan `position: absolute; inset: 0; pointer-events: none; opacity: 0.35` di atas div ber-*gradient*.
- **`.bg-gradient-surface`**: Membuat *gradient* turun dari `color-background` ke `color-surface`.

### Interaksi
- **`.hover-lift`**: Menambahkan *smooth transition*, mengangkat kartu ke atas (`translateY`) dan mempertebal *shadow*.
- **`.btn-cta`**: Tombol hijau utama dengan gradasi. Mengubah bayangan dan bergerak saat di-klik.
- **`.icon-container`**: Kotak (box) dekoratif di sekitar ikon `lucide-svelte` dengan *glow effect* ketika disentuh.
- **`.badge-pill`**: Label bentuk kapsul dengan gradien atau warna solid, memberikan dimensi *pop-up*.

---

## 4. Pola Implementasi (Implementation Pattern)

### A. Layout Form & Card (Admin / Dashboard)
Untuk menjaga konsistensi pada bagian Admin, gunakan struktur berikut:

```html
<div class="glass-card rounded-2xl p-6 flex flex-col gap-4 border border-white/10 hover-lift" style="box-shadow: var(--shadow-card-md);">
  <!-- Header -->
  <div class="flex flex-col gap-1">
      <h2 class="text-xl font-bold text-title-text">Judul Panel</h2>
      <p class="text-sm opacity-70">Deskripsi singkat fungsi kartu.</p>
  </div>
  
  <!-- Content -->
  <div>
      ...
  </div>
</div>
```
*(Catatan: karena admin adalah panel pengelola, `border-white/10` atau `border-primary/20` sangat membantu pemisahan form)*

### B. Tabel (Admin / Dashboard)
Tabel diletakkan di dalam `.glass-card` dengan *overflow-hidden*:
- Header tabel ( `thead` ) menggunakan warna transparan ringan seperti `bg-white/5` atau `bg-primary/5`.
- Baris tabel (`tr`) diberi kelas `hover:bg-white/5` dengan garis bawah batas warna pudar.
- Badge status dalam tabel memanfaatkan utility bawaan Tailwind: `px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full`.

### C. Typography
- **Headings** (H1/H2): Gunakan warna `text-title-text`, font-bold/extrabold, dan `tracking-tight`.
- **Penekanan (*Emphasis*)**: Gunakan span kelas `.gradient-text`.
- **Text Biasa**: Gunakan kombinasi `leading-relaxed` dan atur `opacity-80` atau `opacity-70` untuk membuat teks yang tidak mencolok (*muted*).

---

## 5. Ringkasan Saat Melakukan Refactor (Untuk AI)
- Jangan gunakan warna bawaan tailwind jika sudah ada di `--color-primary`, `--color-secondary`. Jika memerlukan transparansi, kombinasikan class tailwind untuk background (misal: `bg-primary/20`) ATAU gunakan nilai rgba murni pada *inline-style*.
- Jangan buat elemen baru *from-scratch* (mulai dari nol) untuk tombol. Jika tombol itu bertindak sebagai aksi utama, gunakan `.btn-cta`.
- Jangan menggunakan `padding`/`margin` statis untuk spasi jika bisa di-handle oleh `.stack` atau Tailwind's `gap-*`.
- Tetap pakai *Lucide Icons* (`lucide-svelte`) dengan tebal `strokeWidth` umumnya disetel pada **2**.
- Setiap kali menambahkan halaman baru, perhatikan hierarki warna. Latar belakang harus terang dan lega (`bg-background` atau `.bg-gradient-surface`). Komponen form harus mengapung dengan `.glass-card`.
