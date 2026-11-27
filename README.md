# MIV - Maxime Illust Video

Ubah kode animasi HTML/CSS/JS menjadi video MP4 atau MOV langsung di browser (WebCodecs, Chrome/Edge).

## Menjalankan

```
npm install
npm run dev      # mode pengembangan, buka alamat yang muncul
npm run build    # hasil jadi di folder dist
npm run preview  # coba hasil build
```

Butuh Node.js 18 atau lebih baru.

## Struktur

- `index.html`, `public/` : halaman, ikon, manifest PWA, service worker
- `src/App.tsx` : kerangka aplikasi
- `src/components/` : editor, pratinjau, pengaturan, export, antrian, dialog render
- `src/lib/` : renderer video, encoder MP4, shim animasi, Three.js dan library bawaan (gsapLite, p5Lite, dll.)
- `src/styles.*.ts` : tampilan (styles.retro.ts = gaya 90-an)

## Catatan

- Three.js dibaca dari `node_modules/three` saat build (lihat `src/lib/three.ts` dan `src/lib/threeAddons.ts`), jadi versi `three` di package.json jangan diubah tanpa dites.
- Deploy: Vercel atau Netlify, perintah build `npm run build`, folder output `dist` (sudah diatur di vercel.json dan netlify.toml).
