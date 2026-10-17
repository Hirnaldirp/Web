# IMEI.REG — Starter Online Shop

Starter e-commerce responsif berbahasa Indonesia: landing page, katalog demo, filter, keranjang belanja, form pelanggan, dan kerangka checkout Midtrans Snap.

## Status fitur

| Fitur | Status |
|---|---|
| Desain responsif dan katalog demo | Aktif secara lokal |
| Filter produk dan keranjang | Aktif di browser; keranjang belum disimpan lintas perangkat |
| Backend Express | Tersedia di `server.js` |
| Pembuatan sesi Midtrans Snap | Kerangka tersedia; perlu kredensial dan pengujian |
| Pembayaran otomatis produksi | **Belum siap untuk pelanggan nyata** |
| Verifikasi status pembayaran/webhook | **Belum dibuat** |
| Database pesanan dan inventaris | **Belum dibuat** |
| Login/admin untuk mengelola produk | **Belum dibuat** |
| Pengiriman, pajak, refund, email notifikasi | **Belum terhubung** |
| Nama/foto/harga produk | Data contoh, wajib diganti |
| Email kontak | Alamat contoh, wajib diganti |

## Jalankan di komputer

Persyaratan: Node.js 20 atau lebih baru.

```bash
npm install
cp .env.example .env
npm start
```

Buka `http://localhost:3000`. Untuk Windows, salin `.env.example` menjadi `.env` secara manual jika `cp` tidak tersedia.

Tanpa `MIDTRANS_SERVER_KEY`, checkout akan sengaja menampilkan pesan bahwa pembayaran belum dikonfigurasi. Ini mencegah kesan palsu bahwa pembayaran sudah aktif.

## Konfigurasi Midtrans

1. Buat akun merchant Midtrans dan selesaikan proses verifikasi sesuai ketentuan mereka.
2. Ambil kredensial Sandbox untuk pengujian dari dashboard resmi Midtrans.
3. Isi `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` pada environment backend. Jangan menaruh Server Key di file frontend atau membagikannya.
4. Deploy backend sebagai layanan Node.js yang mendukung environment variables.
5. Set `NODE_ENV=production` hanya setelah pengujian selesai dan kredensial produksi sudah disetujui.
6. Sebelum menerima uang sungguhan, implementasikan database pesanan, endpoint notifikasi/webhook Midtrans dengan verifikasi signature, idempotensi, pemeriksaan status transaksi dari server, pembaruan stok, serta penanganan pembatalan/refund. Jangan menganggap pelanggan sudah membayar hanya karena browser kembali ke situs.

Backend saat ini memakai katalog contoh yang ada di `server.js`. Perbarui daftar produk server-side dan `products` pada `public/app.js` secara konsisten. Total harga dihitung ulang di backend; jangan menerima total dari browser sebagai sumber kebenaran.

Dokumentasi resmi: https://docs.midtrans.com/

## Publikasi dengan subdomain gratis

### Opsi A — frontend statis di Netlify

1. Buat repository Git di GitHub dan unggah isi folder proyek ini.
2. Di Netlify, pilih **Add new site / Import an existing project**, hubungkan repository.
3. Set publish directory ke `public`. Tidak ada build command untuk frontend statis.
4. Netlify memberi subdomain `*.netlify.app` yang tersedia; pilih nama yang masih kosong di pengaturan domain situs.

**Catatan:** opsi ini hanya menerbitkan frontend. Backend Express tidak berjalan pada publikasi statis ini, jadi checkout belum berfungsi sampai API ditempatkan di host Node.js terpisah.

### Opsi B — satu layanan Node.js

Deploy repository ini pada host yang mendukung aplikasi Node.js dan menetapkan `npm start`, lalu atur environment variables. Pilih paket gratis yang saat ini tersedia dan sesuai untuk penggunaan komersial; kuota, kebijakan tidur otomatis, dan subdomain mengikuti penyedia dan dapat berubah. Pastikan host mendukung penggunaan komersial dan ketentuan pembayaran Anda.

Jika frontend dan backend di domain berbeda, ubah pemanggilan `fetch("/api/checkout", ...)` di `public/app.js` menjadi URL backend Anda, dan konfigurasi CORS di server hanya untuk domain toko. Jangan gunakan wildcard CORS untuk produksi.

## Checklist sebelum peluncuran

- [ ] Ganti nama, foto, deskripsi, harga, kategori dan stok dengan data produk asli.
- [ ] Ganti email kontak contoh serta tambahkan WhatsApp/alamat bisnis yang benar.
- [ ] Tambahkan kebijakan privasi, syarat layanan, pengiriman, pembatalan dan pengembalian.
- [ ] Uji checkout Sandbox untuk pembayaran berhasil, gagal, tertunda dan kedaluwarsa.
- [ ] Tambahkan database, webhook terverifikasi, dan halaman status pesanan.
- [ ] Periksa biaya penyedia, syarat merchant, pajak dan kewajiban hukum yang berlaku.
- [ ] Jangan menerima pembayaran nyata sebelum semua langkah penting di atas selesai.

Ini adalah starter proyek, bukan toko produksi yang telah terhubung ke akun merchant.
