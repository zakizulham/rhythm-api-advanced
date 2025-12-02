[![Status](https://img.shields.io/badge/Status-Under%20Maintenance-orange.svg)](https://github.com/zakizulham/rhythm-api-advanced/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v22+-darkgreen.svg)](https://nodejs.org/)
[![Hapi.js](https://img.shields.io/badge/Framework-Hapi.js-orange.svg)](https://hapi.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red.svg)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/Message_Broker-RabbitMQ-ff6600.svg)](https://www.rabbitmq.com/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT-red.svg)](https://jwt.io/)

# rhythm-api-advanced

Repositori ini berisi solusi *back-end* untuk layanan streaming musik "OpenMusic". Proyek ini merupakan implementasi tingkat lanjut yang memisahkan tanggung jawab antara **RESTful API (Producer)** dan **Message Consumer** untuk menangani proses bisnis yang berat secara asinkron.

Proyek V3 ini menambahkan tiga fitur krusial standar industri:
1.  **Pemrosesan Asinkron (Asynchronous):** Ekspor *playlist* ke email ditangani oleh *message broker* (RabbitMQ) dan aplikasi *consumer* terpisah.
2.  **Caching:** Permintaan *high-traffic* (jumlah *likes* album) ditangani oleh Redis untuk mengurangi beban *database*.
3.  **File Upload:** Pengguna dapat mengunggah sampul album yang disimpan di server lokal.

## Arsitektur & Struktur Proyek

Proyek ini dipecah menjadi dua aplikasi independen yang saling berkomunikasi melalui RabbitMQ.

```
.
├── openmusic-api/        # Aplikasi Utama (Producer - Hapi.js)
│   ├── src/
│   ├── migrations/
│   ├── package.json      # Dependencies khusus API
│   └── ...
├── openmusic-consumer/   # Aplikasi Worker (Consumer - Node.js)
│   ├── src/
│   ├── package.json      # Dependencies khusus Consumer
│   └── ...
├── docker-compose.yml    # Infrastruktur (Postgres, Redis, RabbitMQ)
└── README.md
```

* **API Service (`openmusic-api`):** Menangani HTTP Request, Autentikasi, CRUD Database, Upload File, dan Caching. Bertindak sebagai **Producer** yang mengirim pesan ke RabbitMQ saat ada permintaan ekspor.
* **Consumer Service (`openmusic-consumer`):** Aplikasi yang berjalan di latar belakang (*background process*). Bertindak sebagai **Consumer** yang mendengarkan antrean RabbitMQ, mengambil data playlist dari database, dan mengirimkannya via Email (Nodemailer).

## Fitur & Endpoint

### Fitur V1 & V2 (Dasar)
* **Users & Auth:** Registrasi, Login, Logout, Refresh Token.
* **Music Data:** CRUD Album & Lagu.
* **User Features:** Playlist, Menambah Lagu ke Playlist, Kolaborasi.
* **Activities:** Riwayat aktivitas playlist.

### Fitur Baru (V3)
* **Exports (`POST /export/playlists/{id}`):** Meminta ekspor playlist. API merespons `201 Accepted` dan tugas diserahkan ke *Consumer*.
* **Album Covers (`POST /albums/{id}/covers`):** Upload sampul album (Max 512KB, Images only).
* **Album Likes:** Fitur like/unlike album dengan implementasi **Server-Side Caching (Redis)**. Cache akan kedaluwarsa dalam 30 menit atau dihapus saat ada perubahan data like.

## Teknologi Utama

* **Core:** Node.js (v18+)
* **Framework:** Hapi.js
* **Database:** PostgreSQL
* **Message Broker:** RabbitMQ
* **Cache:** Redis
* **Tools:** ESLint, Nodemon, node-pg-migrate

## Replikasi Lokal

Untuk menjalankan proyek ini secara lokal, pastikan **Node.js**, **Docker Desktop**, dan **Git** sudah terinstal.

### 1. Setup Infrastruktur
Jalankan container untuk database, cache, dan message broker.

```bash
# Di root folder repositori
docker-compose up -d
```

### 2. Menjalankan API (Producer)
Buka terminal baru.

```bash
# 1. Masuk ke folder API
cd openmusic-api

# 2. Install dependencies API
npm install

# 3. Setup Environment API
# Salin .env.example ke .env dan sesuaikan isinya (SMTP, DB, RabbitMQ)
cp .env.example .env

# 4. Jalankan Migrasi Database
npm run migrate

# 5. Jalankan Server API
npm run start-dev
# Server berjalan di http://localhost:5000
```

### 3. Menjalankan Consumer
Buka terminal baru lagi (biarkan terminal API tetap jalan).

```bash
# 1. Masuk ke folder Consumer
cd openmusic-consumer

# 2. Install dependencies Consumer
npm install

# 3. Setup Environment Consumer
# Salin .env.example ke .env
# PENTING: Pastikan konfigurasi SMTP dan RabbitMQ SAMA dengan API
cp .env.example .env

# 4. Jalankan Consumer
npm run start
```

### 4. Pengujian
Gunakan Postman Collection V3 yang telah disediakan.

1.  Import Collection dan Environment ke Postman.
2.  Isi variabel `exportEmail` di Environment Postman dengan email tujuan (atau email sandbox Mailtrap).
3.  Jalankan pengujian.

## Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE).