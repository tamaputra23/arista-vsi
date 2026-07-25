Fitur Utama yang Wajib Dibuat
1. Penerimaan Data Kendaraan
Buat endpoint:
POST /api/vehicles
Ketentuan:
Melakukan validasi request.
external_id wajib diisi.
chassis_number wajib diisi.
company_code dan branch_code wajib diisi.
Status harus sesuai dengan daftar status yang diperbolehkan.
Data dengan external_id yang sama tidak boleh menghasilkan duplikasi.
Jika data sudah ada, lakukan update.
Jika status berubah, simpan perubahan ke tabel riwayat status.
Request yang sama dikirim berulang kali tidak boleh menimbulkan efek ganda.
Berikan HTTP status dan pesan error yang sesuai.
Contoh respons berhasil:
{
  "success": true,
  "message": "Vehicle data processed successfully",
  "data": {
    "external_id": "ADMS-000123",
    "status": "READY_STOCK"
  }
}
Contoh respons gagal:
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "chassis_number": [
      "Chassis number is required"
    ]
  }
}

2. Daftar Kendaraan
Buat endpoint:
GET /api/vehicles
Endpoint minimal mendukung:
Pagination
Filter berdasarkan perusahaan
Filter berdasarkan cabang
Filter berdasarkan merek
Filter berdasarkan model
Filter berdasarkan status
Pencarian chassis number
Pengurutan berdasarkan tanggal update
Contoh:
GET /api/vehicles?company_code=PT-AKA&status=READY_STOCK&page=1&limit=20

3. Detail Kendaraan
Buat endpoint:
GET /api/vehicles/{external_id}
Respons harus menampilkan:
Data kendaraan
Status terakhir
Riwayat perubahan status
Waktu data pertama diterima
Waktu data terakhir diperbarui

4. Monitoring Dashboard
Buat endpoint:
GET /api/dashboard/summary
Minimal menghasilkan:
Total kendaraan
Total kendaraan per status
Total kendaraan per perusahaan
Total kendaraan per cabang
Total data yang diperbarui hari ini
Total kendaraan berstatus READY_STOCK
Total kendaraan berstatus DELIVERED
Lima model kendaraan dengan stok terbanyak
Contoh respons:
{
  "total_vehicles": 120,
  "updated_today": 15,
  "by_status": {
    "IN_TRANSIT": 10,
    "RECEIVED": 10,
    "READY_STOCK": 55,
    "BOOKED": 15,
    "DELIVERED": 25,
    "CANCELLED": 5
  },
  "by_company": {
    "PT-AKA": 65,
    "PT-AJN": 55
  }
}
Dashboard web sederhana bersifat opsional. Endpoint API tetap wajib dibuat.

5. Integration Log
Setiap request ke endpoint integrasi harus dicatat.
Data minimal yang disimpan:
Request ID atau correlation ID
Waktu request
Endpoint
HTTP method
External ID
Status berhasil atau gagal
HTTP response status
Pesan error
Processing time
Request payload atau payload summary
Buat endpoint:
GET /api/integration-logs
Endpoint mendukung filter:
Status berhasil atau gagal
External ID
Rentang tanggal
Data sensitif tidak boleh ditulis ke log.

6. Health Check
Buat endpoint:
GET /health
Minimal memeriksa:
Status aplikasi
Koneksi database
Waktu server
Versi aplikasi
Contoh:
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "server_time": "2026-07-20T10:30:00+07:00"
}

7. Docker
Aplikasi harus dapat dijalankan menggunakan:
docker compose up -d
Minimal terdiri dari:
Application container
Database container
Tambahkan:
Dockerfile
docker-compose.yml
.env.example
Health check container
Persistent database volume

8. Dokumentasi
Repository wajib memiliki README.md yang menjelaskan:
Gambaran aplikasi
Masalah yang diselesaikan
Tech stack
Diagram arsitektur
Struktur database
Cara menjalankan aplikasi
Environment variable
Daftar endpoint
Contoh request dan response
Cara menjalankan migration
Cara menjalankan test
Asumsi yang digunakan
Keterbatasan PoC
Risiko jika digunakan di production
Pengembangan berikutnya

Fitur Tambahan Bersama
Pilih minimal dua fitur berikut:
API key authentication
JWT authentication
Swagger/OpenAPI
Unit test
Integration test
Rate limiting
GitHub Actions

Soal Khusus Kandidat 
Bryantama Putra
Berdasarkan hasil screening, Anda memiliki kekuatan pada Linux, CI/CD, security, AI agent, dan penanganan insiden transaksi duplikat.
Selain fitur utama, Anda wajib membuat fitur berikut.
A. Security Layer
Implementasikan minimal:
API key authentication
Rate limiting
Input validation
Secret melalui environment variable
Sanitasi log
Pembatasan akses endpoint integration log
API key dikirim melalui header:
X-API-Key: your-api-key
Kandidat harus memastikan API key tidak ditulis langsung di source code.

B. Duplicate Transaction Incident Simulation
Buat endpoint khusus untuk simulasi:
POST /api/simulations/duplicate-request
Endpoint tersebut mensimulasikan request yang sama dikirim beberapa kali secara paralel.
Sistem harus menunjukkan bahwa:
Hanya satu data kendaraan yang terbentuk
Riwayat status tidak terduplikasi
Request berulang tetap dicatat
Database tetap konsisten
Sediakan dokumentasi atau test yang membuktikan hasilnya.

C. CI/CD
Buat GitHub Actions minimal untuk:
Install dependency
Menjalankan linting
Menjalankan test
Build Docker image
Deployment ke server tidak wajib.
