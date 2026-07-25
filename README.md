# Vehicle Stock Integration & Monitoring Platform

**Sistem integrasi dan pemantauan stok kendaraan terpusat** — mengagregasi data inventaris kendaraan dari berbagai cabang dealer ke dalam satu *single source of truth*.

[![Test Suite](https://img.shields.io/badge/tests-124%2F124%20passed-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)]()
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue)]()

---

## Daftar Isi

1. [Gambaran Aplikasi](#gambaran-aplikasi)
2. [Masalah yang Diselesaikan](#masalah-yang-diselesaikan)
3. [Tech Stack](#tech-stack)
4. [Diagram Arsitektur](#diagram-arsitektur)
5. [Struktur Database](#struktur-database)
6. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
7. [Environment Variables](#environment-variables)
8. [Daftar Endpoint](#daftar-endpoint)
9. [Contoh Request dan Response](#contoh-request-dan-response)
10. [Cara Menjalankan Migration](#cara-menjalankan-migration)
11. [Cara Menjalankan Test](#cara-menjalankan-test)
12. [Asumsi yang Digunakan](#asumsi-yang-digunakan)
13. [Keterbatasan PoC](#keterbatasan-poc)
14. [Risiko Jika Digunakan di Production](#risiko-jika-digunakan-di-production)
15. [Pengembangan Berikutnya](#pengembangan-berikutnya)
16. [FAQ: Pertanyaan Teknis](#faq-pertanyaan-teknis)

---

## Gambaran Aplikasi

Platform ini menerima data kendaraan dari sistem operasional cabang (dealer, gudang) melalui REST API, menyimpannya di PostgreSQL, dan menyediakan dashboard pemantauan serta *audit trail* lengkap. Sistem dirancang untuk mencegah duplikasi data, melacak setiap perubahan status kendaraan, dan mencatat seluruh aktivitas integrasi.

**Fase pengembangan saat ini:** Phase 1–5 selesai (MVP + hardening). Total 6 endpoint API + endpoint simulasi concurrency.

## Masalah yang Diselesaikan

| Masalah | Solusi |
|---|---|
| Tidak ada visibilitas stok terpusat antar cabang | API tunggal yang mengagregasi data dari seluruh cabang |
| Duplikasi data dari sistem cabang yang berbeda | **Idempotent upsert** berbasis atomic `INSERT ... ON CONFLICT` + unique constraint `(external_id, company_code, branch_code)` |
| Tidak ada riwayat perubahan status kendaraan | Tabel `vehicle_status_history` — *append-only*, tidak dapat dihapus |
| Tidak ada jejak audit untuk debugging integrasi | Tabel `integration_log` — setiap request dicatat dengan `correlation_id` |
| API *overload* saat jam sibuk | Rate limiting per-role × per-endpoint (branch: 100/min, ops: 300/min, admin: unlimited) |
| Data tidak valid atau berbahaya dari sistem eksternal | Validasi Zod ketat + regex VIN-like + sanitasi HTML/control chars + business rules |
| Kredensial tidak aman | Dual-auth JWT (HS256 signed role) + API key — keduanya wajib di setiap request |

## Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| **Runtime** | Node.js 20+ (TypeScript) | Async I/O untuk throughput tinggi |
| **Framework** | Express.js 4.x | Ekosistem middleware, ringan |
| **ORM** | Prisma 5.x | Type-safe, atomic upsert, auto-migration |
| **Database** | PostgreSQL 15+ | ACID, unique constraint, connection pooling |
| **Validasi** | Zod 3.x | TypeScript-first, async `.refine()` untuk business rules |
| **Auth** | JWT HS256 (Node `crypto`) + API key | Dual mandatory — zero dependency JWT |
| **Rate Limiting** | `express-rate-limit` 7.x | Pluggable store, per-IP+role key |
| **Logging** | Winston | Structured JSON logging |
| **Testing** | Jest + Supertest | 124 test case, integrasi + unit |
| **Dokumentasi** | Swagger/OpenAPI 3.0 | UI interaktif di `/api-docs` |
| **Container** | Docker + Docker Compose | App + PostgreSQL dengan health checks |

## Diagram Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                    BRANCH SYSTEMS                            │
│  Dealer A (JKT01)    Dealer B (JKT02)    Dealer C (SBY01)   │
└──────────┬───────────────────┬───────────────────┬───────────┘
           │ POST /api/vehicles│                   │
           ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     EXPRESS API (PORT 6300)                  │
│                                                              │
│  Middleware Pipeline:                                        │
│  cors → json(1mb) → correlationId → requestLogger           │
│  → querySizeLimit → requireJson                             │
│  → [per-route: auth → rateLimiter → validate → handler]     │
│  → errorHandler                                              │
│                                                              │
│  Routes:                                                     │
│  POST /api/vehicles          (idempotent upsert)             │
│  GET  /api/vehicles          (list + filter + pagination)    │
│  GET  /api/vehicles/:id      (detail + status history)       │
│  GET  /api/dashboard/summary (aggregated metrics, 5min TTL)  │
│  GET  /api/integration-logs  (audit trail, admin only)       │
│  GET  /health                (public, DB check)              │
│  POST /api/simulations/      (concurrency test, admin only)  │
│       duplicate-request                                     │
│                                                              │
│  Auth: JWT (Bearer) + API-Key (X-API-Key) — both mandatory   │
└──────────┬───────────────────────────────────────────────────┘
           │ Prisma ORM
           ▼
┌──────────────────────────────────────────────────────────────┐
│                     POSTGRESQL 15                            │
│                                                              │
│  Tables:         Indexes:                                    │
│  ┌────────────┐  ┌──────────────────────────────────────┐   │
│  │ company    │  │ PK, unique constraints,              │   │
│  │ branch     │  │ composite indexes,                   │   │
│  │ vehicle    │  │ foreign key indexes                   │   │
│  │ status_hist│  │ (16 total)                           │   │
│  │ integ_log  │  └──────────────────────────────────────┘   │
│  └────────────┘                                              │
└──────────────────────────────────────────────────────────────┘
```

**Flow request POST /api/vehicles secara detail:**

```
Request dengan JWT + API-Key
  │
  ▼
1. correlationId      → UUID untuk tracing
2. requestLogger      → Catat method, URL, durasi
3. querySizeLimit     → Tolak query > 2KB (413)
4. requireJson        → Tolak Content-Type selain application/json (415)
5. express.json(1mb)  → Tolak body > 1MB (413)
6. authenticate       → Verifikasi JWT signature + API key lookup
7. rateLimiter        → Cek kuota per role+endpoint (branch: 100/min)
8. validate           → Zod parseAsync + regex + business rules + sanitasi
9. handler            → upsertVehicle (atomic Prisma upsert)
10. errorHandler      → Format error sesuai API spec
```

## Struktur Database

```
┌──────────┐       ┌──────────┐
│ COMPANY  │ 1───* │ BRANCH   │
├──────────┤       ├──────────┤
│ code  PK │       │ code  PK │
│ name     │       │ company  │──FK→ COMPANY.code
└──────────┘       │ name     │
                   │ location │
                   └──────────┘
                        │ 1
                        │
                        │ *
                   ┌──────────┐       ┌─────────────────────┐
                   │ VEHICLE  │ 1───* │ VEHICLE_STATUS_     │
                   ├──────────┤       │ HISTORY             │
                   │ id    PK │       ├─────────────────────┤
                   │ external │       │ id              PK  │
                   │ company  │──FK   │ vehicle_id      FK  │
                   │ branch   │──FK   │ previous_status     │
                   │ brand    │       │ new_status          │
                   │ model    │       │ changed_at          │
                   │ year     │       │ changed_by          │
                   │ color    │       │ change_reason       │
                   │ chassis  │ UNIQUE└─────────────────────┘
                   │ engine   │
                   │ status   │       ┌─────────────────────┐
                   │ created  │ 1───* │ INTEGRATION_LOG     │
                   │ updated  │       ├─────────────────────┤
                   └──────────┘       │ id              PK  │
                        │             │ correlation_id  UNIQUE
                        │             │ request_timestamp   │
                        │             │ endpoint            │
                        │             │ http_method         │
                        │             │ external_id         │
                        │             │ success             │
                        │             │ http_status_code    │
                        │             │ error_message       │
                        │             │ processing_time_ms  │
                        │             │ payload_summary     │
                        │             │ company_code        │
                        └─────────────┴─────────────────────┘
```

**Constraints kunci:**

| Constraint | Tabel | Tujuan |
|---|---|---|
| `@@unique([externalId, companyCode, branchCode])` | vehicle | Mencegah duplikat; dasar atomic upsert |
| `@unique chassisNumber` | vehicle | Mencegah konflik chassis number global |
| `@unique correlationId` | integration_log | Tracing request; deteksi replay |

**Indexes:** 16 indexes mencakup seluruh kolom yang digunakan untuk filter, sort, dan lookup.

## Cara Menjalankan Aplikasi

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (atau Docker)
- `npm` 9+

### Development (lokal)

```bash
# 1. Clone dan install
git clone <repo-url> && cd Arista
npm install

# 2. Setup environment
cp .env.example .env
# Edit DATABASE_URL di .env sesuai koneksi PostgreSQL Anda

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4. Generate JWT tokens (Phase 4)
npm run jwt:generate -- --write

# 5. Jalankan
npm run dev
# Server berjalan di http://localhost:6300
# Swagger UI di http://localhost:6300/api-docs
```

### Docker (rekomendasi)

```bash
docker-compose up -d
# App + PostgreSQL 15 berjalan, database otomatis terbuat
```

## Environment Variables

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | Ya | — | PostgreSQL connection string |
| `PORT` | Tidak | 6300 | Port server |
| `NODE_ENV` | Tidak | development | `development` / `production` / `test` |
| `API_KEYS` | Ya | — | Comma-separated `role:key` pairs |
| `JWT_SECRET` | Ya (Phase 4) | — | Secret untuk HS256 JWT signing/verification |
| `LOG_LEVEL` | Tidak | info | `error` / `warn` / `info` / `debug` |
| `CACHE_TTL` | Tidak | 300 | Dashboard cache TTL (detik) |
| `APP_VERSION` | Tidak | 1.0.0 | Versi aplikasi |

**Format `API_KEYS`:**
```bash
API_KEYS="admin:secret-admin-key,ops:secret-ops-key,branch:secret-branch-key"
```

## Daftar Endpoint

| Method | Endpoint | Auth | Rate Limit | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/vehicles` | branch, admin | branch: 100/min | Idempotent upsert kendaraan |
| `GET` | `/api/vehicles` | ops, admin | ops: 300/min | List kendaraan (paginated, filterable) |
| `GET` | `/api/vehicles/:external_id` | ops, admin | ops: 300/min | Detail kendaraan + status history |
| `GET` | `/api/dashboard/summary` | ops, admin | ops: 300/min | Metrik agregat (cached 5 menit) |
| `GET` | `/api/integration-logs` | admin only | admin: unlimited | Audit trail request API |
| `GET` | `/health` | public | 120/min | Health check + status database |
| `POST` | `/api/simulations/duplicate-request` | admin only | — | Simulasi request paralel (N=2–50) |
| `GET` | `/api-docs` | public | — | Swagger UI |

## Contoh Request dan Response

### 1. POST /api/vehicles — Ingest Kendaraan

**Request:**
```bash
curl -X POST http://localhost:6300/api/vehicles \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "X-API-Key: ZBwdtFQs4DB-vcpt0P0KAVtA6_sT1t3t" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "ADM-00123",
    "company_code": "PT-AKA",
    "branch_code": "JKT01",
    "brand": "Hyundai",
    "model": "Creta",
    "year": 2026,
    "color": "Black",
    "chassis_number": "KMHXX1234567890",
    "engine_number": "G4FXX123456",
    "status": "READY_STOCK",
    "updated_at": "2026-07-25T10:30:00+07:00"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vehicle data processed successfully",
  "data": {
    "external_id": "ADM-00123",
    "status": "READY_STOCK"
  }
}
```

**Response (409 — chassis conflict):**
```json
{
  "success": false,
  "message": "Chassis number 'KMHXX1234567890' already exists with external_id 'ADM-00456'. Cannot create vehicle with external_id 'ADM-00123'."
}
```

**Response (429 — rate limited):**
```json
{
  "success": false,
  "message": "Too many requests — please wait 60 seconds and try again"
}
```

### 2. GET /api/vehicles — List dengan Filter

**Request:**
```bash
curl "http://localhost:6300/api/vehicles?company_code=PT-AKA&status=READY_STOCK,BOOKED&limit=5&page=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "X-API-Key: usG95gkLp6Bi4KC6t4S7oE62OmGS0WyT"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "external_id": "ADM-00123",
      "company_code": "PT-AKA",
      "branch_code": "JKT01",
      "brand": "Hyundai",
      "model": "Creta",
      "year": 2026,
      "color": "Black",
      "status": "READY_STOCK",
      "updated_at": "2026-07-25T10:30:00+07:00"
    }
  ],
  "pagination": {
    "total_count": 1,
    "current_page": 1,
    "total_pages": 1,
    "limit": 5
  }
}
```

### 3. GET /api/dashboard/summary — Dashboard

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "total_vehicles": 120,
    "updated_today": 15,
    "ready_stock_count": 55,
    "delivered_count": 25,
    "by_status": {
      "IN_TRANSIT": 10,
      "RECEIVED": 10,
      "READY_STOCK": 55,
      "BOOKED": 15,
      "DELIVERED": 25,
      "CANCELLED": 5
    },
    "by_company": { "PT-AKA": 65, "PT-AJN": 55 },
    "by_branch": { "JKT01": 30, "JKT02": 20, "SBY01": 15 },
    "top_5_models": [
      { "model": "Creta", "count": 25 },
      { "model": "Xpander", "count": 20 }
    ],
    "cache_timestamp": "2026-07-25T10:35:00+07:00"
  }
}
```

### 4. GET /health — Health Check

**Response (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "server_time": "2026-07-25T10:30:00+07:00",
  "response_time_ms": 15
}
```

### 5. POST /api/simulations/duplicate-request — Simulasi Concurrency

**Request:**
```json
{
  "external_id": "SIM-001",
  "company_code": "PT-AKA",
  "branch_code": "JKT01",
  "brand": "Toyota",
  "model": "Avanza",
  "year": 2025,
  "color": "Silver",
  "chassis_number": "SMHCHASSS00001",
  "engine_number": "SIMENG001",
  "status": "READY_STOCK",
  "updated_at": "2026-07-25T10:00:00+07:00",
  "parallel_count": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duplicate request simulation complete",
  "data": {
    "simulation_id": "sim-a1b2c3d4",
    "requests_sent": 10,
    "total_time_ms": 150,
    "results": { "created": 10, "updated": 0, "failed": 0 },
    "verification": {
      "vehicles_found": 1,
      "status_history_entries": 1,
      "integration_log_entries": 10,
      "successful_logs": 10,
      "database_consistent": true
    },
    "concurrency_proof": {
      "no_duplicate_vehicles": true,
      "no_duplicate_status_history": true,
      "all_requests_logged": true,
      "idempotent_upsert_working": true
    }
  }
}
```

## Cara Menjalankan Migration

```bash
# Development — generate + apply migration
npx prisma migrate dev --name <deskripsi>

# Production — apply migration tanpa prompt
npx prisma migrate deploy

# Push schema langsung ke DB (tanpa migration file)
npx prisma db push

# Seed data awal (company + branch)
npm run db:seed

# Buka Prisma Studio (GUI)
npx prisma studio
```

## Cara Menjalankan Test

```bash
# Semua test (sequentially — diperlukan karena shared database)
npm test

# Test spesifik
npx jest --runInBand tests/integration/vehicles.test.ts
npx jest --runInBand tests/integration/simulations.test.ts -t "10 parallel"

# Unit test saja (tanpa database)
npx jest tests/unit/

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Catatan:** Test integrasi memerlukan database PostgreSQL. Konfigurasi database test di `.env.test`.

**Hasil saat ini:** 12 test suites, 124 test cases, 100% passing.

## Asumsi yang Digunakan

| Asumsi | Dampak Jika Salah |
|---|---|
| `external_id` unik dalam satu `company_code` (dijaga sistem cabang) | Duplikasi data lintas company |
| `chassis_number` unik secara global (standar industri VIN) | Konflik 409 yang tidak terduga |
| Sistem cabang mengirim timestamp ISO 8601 dengan timezone `+07:00` | Perbedaan waktu pada `updated_at` |
| `company_code` dan `branch_code` sudah terkonfigurasi di sistem pusat | Request gagal dengan 400 |
| Latensi jaringan antara cabang dan API pusat < 5 detik | Timeout pada request POST |
| Sistem cabang bertanggung jawab atas validitas transisi status (tidak ada state machine di MVP) | Status tidak valid tersimpan |
| PostgreSQL 15+ tersedia dengan connection pooling | Performa query menurun |
| Hanya ada satu instance API (tidak ada load balancer di MVP) | Rate limit tidak terdistribusi |
| Tidak diperlukan enkripsi at-rest untuk `engine_number` di MVP | Data sensitif tersimpan plaintext |

## Keterbatasan PoC

| Keterbatasan | Dampak | Rencana |
|---|---|---|
| Rate limiter **in-memory** (tidak shared antar instance) | Rate limit reset saat restart; tidak berfungsi di multi-instance | Migrasi ke Redis store |
| **Tidak ada autentikasi login/OAuth** — JWT pre-generated statis | Tidak bisa membedakan user dalam satu role; tidak ada audit per-user | Auth.js/NextAuth integration |
| **Tidak ada validasi state machine** untuk transisi status | Status bisa berubah dari `DELIVERED` ke `IN_TRANSIT` | Tambahkan state machine di service layer |
| **Tidak ada job queue** — semua request diproses secara sinkron | Request lambat memblokir event loop | Bull/RabbitMQ untuk batch processing |
| **Single database** — tidak ada read replica | Dashboard query bersaing dengan write operation | Read replica untuk GET endpoints |
| **Status history tanpa unique constraint** untuk initial entry | Di bawah concurrency ekstrem, bisa ada >1 initial history entry | Partial unique index di database |
| **Tidak ada WebSocket** — dashboard menggunakan polling | Data dashboard bisa stale hingga 5 menit | WebSocket push saat data berubah |
| **Tidak ada enkripsi kolom** untuk `engine_number` | Data sensitif tersimpan plaintext di DB | `pgcrypto` atau application-level encryption |
| **Log retention manual** — tidak ada job otomatis | Tabel `integration_log` terus membesar | Scheduled job untuk archive/delete >90 hari |
| **JWT menggunakan HS256 simetris** — satu secret untuk semua | Jika secret bocor, semua token bisa dipalsukan | Migrasi ke RS256 (asimetris) untuk production |

## Risiko Jika Digunakan di Production

| Risiko | Severity | Mitigasi Sebelum Production |
|---|---|---|
| **Race condition pada status history** — concurrent request bisa membuat >1 initial entry | Medium | Tambahkan `@@unique([vehicleId, previousStatus])` partial index |
| **Rate limit tidak terdistribusi** — tiap instance server punya counter sendiri | High | Gunakan Redis store untuk rate limiter |
| **JWT secret tunggal** — kebocoran secret = semua role dikompromikan | High | Rotate secret secara berkala; migrasi ke RS256 dengan public/private key pair |
| **Tidak ada rate limit per API key** — satu API key branch bisa digunakan dari banyak IP | Medium | Tambahkan rate limit per `X-API-Key` selain per IP+role |
| **Connection pool exhaustion** — 20 koneksi maksimum bisa habis saat traffic tinggi | Medium | Monitor pool; gunakan PgBouncer untuk production |
| **Tidak ada circuit breaker** — kegagalan database membuat semua request gagal | Medium | Implementasikan circuit breaker dengan exponential backoff |
| **Body parser 1MB limit** — payload besar bisa ditolak | Low | Sesuaikan limit berdasarkan kebutuhan production |
| **Tidak ada CORS strict** — saat ini `cors()` tanpa konfigurasi origin | Low | Batasi origin yang diizinkan |
| **Log berisi error stack trace** di environment non-production | Low | Pastikan `NODE_ENV=production` |

## Pengembangan Berikutnya

### Phase 3 (Pending)
- Advanced filtering untuk GET /api/vehicles (range tanggal, multi-field search)
- Redis cache untuk dashboard (shared cache antar instance)
- Comprehensive test coverage > 80%
- Custom Swagger CSS

### Phase 6 (Direncanakan)
- **Production readiness:**
  - Redis store untuk rate limiter (shared state)
  - PgBouncer connection pooling
  - Helm chart untuk Kubernetes
  - Prometheus + Grafana monitoring
  - Structured logging ke ELK/Datadog
- **Keamanan:**
  - JWT RS256 (asymmetric) — public/private key pair
  - API key hashing di database
  - CORS strict origin whitelist
  - Helmet.js untuk HTTP security headers
- **Fungsional:**
  - State machine validasi transisi status
  - Bulk import/export CSV
  - Webhook notifikasi untuk status change
  - Soft delete untuk vehicle
  - Admin panel untuk manage company/branch

---

## FAQ: Pertanyaan Teknis

### Bagaimana sistem mencegah race condition?

Sistem menggunakan **atomic upsert** via Prisma ORM yang menghasilkan query `INSERT ... ON CONFLICT (external_id, company_code, branch_code) DO UPDATE` di level database PostgreSQL. Ini berarti:

1. **Database-lah yang memutuskan** apakah record baru di-INSERT atau existing di-UPDATE — bukan aplikasi
2. Unique constraint `@@unique([externalId, companyCode, branchCode])` mencegah dua INSERT berhasil secara bersamaan
3. Jika dua request identik masuk bersamaan, PostgreSQL akan: (a) menjalankan INSERT pertama, (b) untuk INSERT kedua, mendeteksi konflik unique constraint, lalu (c) mengkonversinya menjadi UPDATE secara atomik

**Sebelum perbaikan Phase 6**, sistem menggunakan pola `findFirst → if exists update else create` yang memiliki celah race condition: dua request bisa sama-sama melihat "tidak ada kendaraan" lalu sama-sama mencoba INSERT — salah satu gagal dengan error constraint violation yang tidak ditangani.

**Setelah perbaikan**, `findFirst` hanya digunakan untuk mendeteksi perubahan status (best-effort), bukan untuk keputusan INSERT/UPDATE. Keputusan tersebut diserahkan ke database melalui atomic upsert.

### Bagaimana jika dua request identik masuk pada milidetik yang sama?

**Hasil:** Hanya **satu record** kendaraan yang terbentuk. Database tetap konsisten. Status history mungkin memiliki >1 initial entry (jika guard di application layer ikut racing), tapi data kendaraan sendiri selalu benar.

**Penjelasan teknis:** PostgreSQL menangani concurrent write melalui MVCC (Multi-Version Concurrency Control). Unique constraint dievaluasi secara serial — hanya satu transaksi yang berhasil INSERT; transaksi lain yang konflik akan menunggu atau dikonversi ke UPDATE. Ini diuji oleh endpoint `/api/simulations/duplicate-request` yang membuktikan dengan 10 request paralel, tetap hanya 1 vehicle yang terbuat.

### Mengapa unique constraint saja belum tentu cukup?

Unique constraint **mencegah duplikasi data**, tapi tidak menangani:

1. **Status history duplication** — Jika guard di application layer menggunakan "check-then-create" tanpa unique constraint sendiri, concurrent request bisa sama-sama melihat "belum ada history" dan membuat >1 entry. Solusi: partial unique index `@@unique([vehicleId, previousStatus])` untuk initial entry.

2. **Response consistency** — Unique constraint membuat request kedua gagal dengan error (P2002), bukannya mengembalikan response sukses idempoten. Atomic upsert menyelesaikan ini: request kedua tetap mendapat 200 OK, bukan 500 error constraint violation.

3. **Business logic coupling** — Constraint hanya menjaga integritas data, bukan logika bisnis (seperti "jangan buat status history entry jika status tidak berubah"). Application layer tetap perlu menangani ini.

**Kesimpulan:** Unique constraint adalah **lapisan pertahanan terakhir** yang sangat penting. Tapi application layer harus dirancang untuk bekerja DENGAN constraint, bukan MELAWAN constraint. Atomic upsert adalah pola yang tepat.

### Bagaimana credential production seharusnya dikelola?

**Saat ini (PoC):** Semua credential disimpan di `.env` file. Tidak cocok untuk production.

**Untuk production:**

| Credential | Cara Production |
|---|---|
| `JWT_SECRET` | HashiCorp Vault / AWS Secrets Manager / GCP Secret Manager. Inject via environment variable dari CI/CD. Rotate setiap 90 hari. |
| `API_KEYS` | Simpan dalam database dengan hash (SHA-256 + salt). Jangan plaintext di `.env`. Rotate setiap 90 hari. |
| `DATABASE_URL` | Gunakan IAM role (RDS) atau secret manager. Jangan hardcode credential di connection string. |
| JWT token untuk client | Generate per-client (bukan per-role). Simpan `jti` (JWT ID) untuk revocation. Gunakan RS256 (asymmetric) sehingga hanya server yang bisa menandatangani. |

**Prinsip:** Jangan pernah commit `.env` ke repository. Gunakan `.env.example` sebagai template dengan nilai placeholder.

### Bagaimana langkah investigasi jika data duplikat tetap terjadi?

1. **Cek integration log** — `GET /api/integration-logs?external_id=<id>` untuk melihat semua request yang masuk untuk `external_id` tersebut. Periksa `correlation_id`, `request_timestamp`, dan `processing_time_ms`.

2. **Cek selisih timestamp** — Jika dua request memiliki `request_timestamp` dalam < 100ms, itu adalah concurrent request. Periksa apakah keduanya sukses (HTTP 200).

3. **Cek status history** — `SELECT * FROM vehicle_status_history WHERE vehicle_id = '<id>' ORDER BY changed_at`. Jika ada >1 entry dengan `previous_status = ''` (initial creation), itu tanda race condition pada guard application layer.

4. **Cek database langsung** — `SELECT external_id, company_code, branch_code, COUNT(*) FROM vehicle GROUP BY ... HAVING COUNT(*) > 1`. Jika ada hasil, unique constraint gagal atau pernah di-drop.

5. **Cek application log** — Cari `correlation_id` di log server (Winston) untuk melihat apakah ada error Prisma P2002 (unique constraint violation) yang tertangkap.

6. **Root cause:** Jika data duplikat ditemukan, kemungkinan penyebabnya adalah: (a) unique constraint pernah di-drop saat migration, (b) ada bypass API yang insert langsung ke database, atau (c) bug di application logic.

### Bagaimana rollback dilakukan jika deployment gagal?

**Strategy: Blue-Green Deployment**

```
1. Deploy versi baru ke port 3001 (green)
2. Health check green → healthy?
3. Jika ya: switch traffic ke green, stop blue
4. Jika tidak: green dihentikan, blue tetap berjalan
```

**Database migration rollback:**

```bash
# Sebelum deploy: buat backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Deploy migration
npx prisma migrate deploy

# Jika gagal:
npx prisma migrate resolve --rolled-back <migration_name>
# Atau restore dari backup
psql $DATABASE_URL < backup-*.sql
```

**Prinsip:** Selalu deploy database migration secara terpisah dari kode aplikasi. Migration harus backward-compatible (additive changes only — tambah kolom, jangan hapus kolom). Jangan pernah force-reset database production.

### Serangan apa yang paling mungkin terjadi pada API ini?

| Serangan | Kemungkinan | Dampak | Pertahanan Saat Ini |
|---|---|---|---|
| **Credential stuffing / API key brute force** | High | Akses tidak sah | Rate limiting (100 req/min per IP), dual-auth JWT+API key, 401 tanpa stack trace |
| **SQL Injection via query params** | Low | Kebocoran/penghancuran data | Prisma ORM (parameterized queries), Zod validation strict |
| **XSS via vehicle fields** | Medium | Data tidak valid tersimpan | Regex whitelist pada Zod + sanitasi HTML/control chars |
| **DoS / DDoS** | High | Service tidak tersedia | Rate limiting per-IP+role, body size limit 1MB, query size limit 2KB |
| **JWT alg=none attack** | Low | Bypass authentication | Explicit reject di `verifyJwt()` — hanya HS256 yang diizinkan |
| **JWT secret brute force** | Low | Pemalsuan token | Secret 64 karakter random (512 bit entropy) |
| **Replay attack** | Medium | Duplikasi request | Correlation ID unik, idempotent upsert. Tapi tidak ada nonce/timestamp check. |
| **Mass assignment** | Low | Field tidak sah ter-update | Zod schema dengan field whitelist — hanya field yang didefinisikan yang diterima |
| **Error stack trace leak** | Low | Informasi internal terekspos | Error handler menyembunyikan detail di production (`NODE_ENV=production`) |
| **Correlation ID injection** | Low | Log pollution | UUID v4 dari server, bukan dari client header |

**Yang perlu ditambahkan sebelum production:**
- Helmet.js untuk security headers (CSP, HSTS, X-Frame-Options)
- CORS strict dengan origin whitelist
- Input rate limiting per endpoint yang lebih granular
- Nonce/timestamp di JWT payload untuk cegah replay
- WAF (Web Application Firewall) di depan API — Cloudflare/AWS WAF
