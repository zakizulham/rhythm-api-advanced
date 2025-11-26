[![Status](https://img.shields.io/badge/Status-Completed-brightgreen.svg)](https://github.com/zakizulham/rhythm-api-advanced/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v22+-darkgreen.svg)](https://nodejs.org/)
[![Hapi.js](https://img.shields.io/badge/Framework-Hapi.js-orange.svg)](https://hapi.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red.svg)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/Message_Broker-RabbitMQ-ff6600.svg)](https://www.rabbitmq.com/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT-red.svg)](https://jwt.io/)

# rhythm-api-advanced

Repositori ini berisi *back-end* API untuk layanan streaming musik "OpenMusic". Ini adalah evolusi dari V1 dan V2, dibangun di atas fondasi Hapi yang modular dan diperluas untuk menangani skenario *back-end* yang kompleks dan beperforma tinggi.

Proyek V3 ini menambahkan tiga fitur krusial yang umum di industri:
1.  **Pemrosesan Asinkron (Asynchronous):** Ekspor *playlist* ke email ditangani oleh *message broker* (RabbitMQ) dan *service consumer* terpisah, sehingga API bisa memberi respons instan.
2.  **Caching:** Permintaan *high-traffic* (jumlah *likes* album) ditangani oleh Redis untuk mengurangi beban *database* secara drastis.
3.  **File Upload:** Pengguna kini dapat mengunggah sampul album, yang diproses dan disajikan oleh API.

## Arsitektur & Prinsip Desain

API ini dirancang menggunakan arsitektur berlapis (*layered architecture*) yang bersih dan modular.



* **Plugin Architecture (via Hapi):** Setiap *resource* utama (Albums, Songs, Users, Playlists, dll.) diisolasi ke dalam Hapi Plugin-nya sendiri untuk modularitas maksimum.
* **Service Layer:** Semua logika bisnis dan kueri *database* diekstraksi ke dalam *Service* (`services/`). *Handler* tetap "tipis" dan hanya bertugas mengorkestrasi validasi, pemanggilan *service*, dan respons.
* **Producer-Consumer Pattern:** Untuk tugas berat (ekspor playlist & kirim email), API utama (`server.js`) bertindak sebagai **Producer** yang hanya mengirim "pesan" (berisi `playlistId` dan `targetEmail`) ke **RabbitMQ**. *Service* **Consumer** (`consumer.js`) yang berjalan terpisah mendengarkan antrian, mengambil data dari *database*, dan mengirim email.
* **Cache-Aside Pattern:** Untuk `GET /albums/{id}/likes`, *service* akan terlebih dahulu mencoba mengambil data jumlah *likes* dari **Redis**. Jika data tidak ada (*cache miss*), *service* akan mengambil data dari **PostgreSQL**, menyimpannya di Redis dengan masa kedaluwarsa (TTL), lalu mengembalikannya ke pengguna.
* **Centralized Error Handling:** Menggunakan *event extension* `onPreResponse` Hapi untuk menangkap semua *error* (Client & Server) secara terpusat, memastikan format respons *error* selalu konsisten.
* **Static File Serving:** Menggunakan *plugin* `@hapi/inert` untuk menyajikan *file cover* album yang telah diunggah dari *storage* lokal.

## Fitur & Endpoint

Repositori ini mencakup semua fitur dari V1, V2, dan V3.

### Fitur V1 & V2 (Dasar)
* **Users (`/users`):** Registrasi pengguna (`bcrypt`).
* **Authentications (`/authentications`):** Login/Logout/Refresh Token (`@hapi/jwt`).
* **Albums (`/albums`):** CRUD penuh.
* **Songs (`/songs`):** CRUD penuh dengan *query parameter* pencarian (`?title`, `?performer`).
* **Playlists (`/playlists`):** CRUD penuh untuk *playlist* milik pengguna.
* **PlaylistSongs (`/playlists/{id}/songs`):** Menambah dan menghapus lagu dari *playlist*.
* **Collaborations (`/collaborations`):** Menambah dan menghapus kolaborator *playlist*.
* **PlaylistActivities (`/playlists/{id}/activities`):** Melihat riwayat aktivitas *playlist*.

### Fitur Baru (V3)
* **Exports (`/export/playlists/{id}`):**
    * `POST`: Meminta ekspor *playlist* ke email. API akan mengirim pesan ke RabbitMQ dan merespons `201` (Accepted) secara instan.
* **Album Covers (`/albums/{id}/covers`):**
    * `POST`: Mengunggah *file* gambar (`multipart/form-data`) sebagai sampul album. Disimpan ke *storage* lokal.
    * `GET /albums/{id}`: Sekarang mengembalikan *field* `coverUrl` yang menunjuk ke *file* statis yang disajikan oleh Hapi (`@hapi/inert`).
* **Album Likes (`/albums/{id}/likes`):**
    * `POST`: Menambah *like* ke album (membutuhkan autentikasi).
    * `DELETE`: Menghapus *like* dari album (membutuhkan autentikasi).
    * `GET`: Mengambil jumlah *like* untuk album. Respons ini **disajikan dari cache Redis (TTL 30 menit)** untuk performa tinggi. *Cache* akan otomatis dihapus (`DELETE`) setiap kali ada `POST` atau `DELETE` baru.

## Teknologi Utama

* **Framework:** Hapi.js (`@hapi/hapi`)
* **Database:** PostgreSQL (`pg`)
* **Message Broker:** RabbitMQ (`amqplib`)
* **Cache:** Redis (`redis`)
* **Migrasi:** `node-pg-migrate`
* **Autentikasi:** `@hapi/jwt` (JWT)
* **Validasi:** `Joi`
* **Password Hashing:** `bcrypt`
* **Email:** `nodemailer`
* **File Handling:** `@hapi/inert` (Serving), File System (Storage)
* **Environment:** `dotenv`
* **Dev Tools:** `nodemon`, `eslint`

## Replikasi Lokal

Untuk menjalankan proyek ini, Anda **wajib** memiliki **Node.js (v22+)** dan **Docker Desktop** yang sudah terinstal dan berjalan.

### 1. Setup Awal
```bash
# 1. Clone repositori
git clone https://github.com/zakizulham/rhythm-api-advanced.git
cd rhythm-api-advanced

# 2. Install dependencies
npm install
```

### 2. Setup Database & Services
```bash
# 3. Jalankan semua service (Postgres, Redis, RabbitMQ)
docker-compose up -d

# 4. Salin file environment example
# PENTING: Buka file .env dan isi kredensial SMTP_USER & SMTP_PASSWORD Anda
# (Rekomendasi: gunakan kredensial Mailtrap.io untuk development)
cp .env.example .env

# 5. Jalankan migrasi database untuk membuat semua tabel
npm run migrate
```

### 3. Menjalankan Server
Proyek ini terdiri dari **dua** proses Node.js yang harus berjalan bersamaan. Buka **dua terminal terpisah**.

**Terminal 1: Menjalankan API (Producer)**
```bash
# 6. Jalankan server API utama (Producer)
npm run start-dev
# Server akan berjalan di http://localhost:5000
```

**Terminal 2: Menjalankan Consumer**
```bash
# 7. Jalankan service consumer (Worker)
# (Script ini perlu Anda tambahkan ke package.json: "start-consumer": "node src/consumer.js")
npm run start-consumer
# Consumer akan mendengarkan pesan dari RabbitMQ
```

### 4. Pengujian
```bash
# 8. Menjalankan linter
npm run lint

# 9. Menjalankan tes otomatisasi API
# - Impor collection Postman "OpenMusic API V3 Test.zip"
# - Set environment "OpenMusic API Test"
# - Pastikan mengisi 'exportEmail' di environment Postman dengan email Anda
# - Konfigurasi file gambar untuk tes upload
# - Jalankan Collection Runner.
```

## Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE).