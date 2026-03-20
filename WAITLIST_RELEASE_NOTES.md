# Tiramisup — Waitlist Sistemi Release Notes

**Tarih:** 21 Mart 2026
**Commit:** `1e483ea` — feat: implement email waitlist system for MVP launch gating
**Branch:** main
**Build:** PASSED
**Testler:** 51/51 PASSED (5 dosya)

---

## 1. Ne Yapıldı?

Tiramisup MVP lansmanını kontrollü açmak için **email waitlist sistemi** eklendi. Kimse doğrudan kayıt olamaz — önce waitlist'e katılır, admin onayladıktan sonra kayıt yapabilir.

### Akış

```
Kullanıcı → Landing Page "Ücretsiz Başla" butonuna tıklar
         → WaitlistModal açılır (email + isim girer)
         → POST /api/waitlist/join → DB'ye PENDING olarak kaydedilir
         → /waitlist/thank-you sayfasına yönlendirilir

Admin    → /admin/waitlist paneline gider
         → Waitlist girişlerini görür (email, isim, tarih, durum)
         → "Onayla" butonuna tıklar → PATCH /api/waitlist/[id] → status: APPROVED

Kullanıcı → /signup sayfasına gider, email + şifre girer
         → Sistem GET /api/waitlist/check ile email'i kontrol eder
         → APPROVED ise → kayıt tamamlanır
         → PENDING ise → "Hesabın henüz onaylanmamış" hatası
         → NOT_FOUND ise → "Lütfen önce waitlist'e katıl" hatası
```

---

## 2. Oluşturulan / Değiştirilen Dosyalar

### Yeni Dosyalar (9 adet)

| Dosya | Açıklama |
|-------|----------|
| `prisma/schema.prisma` | Waitlist modeli + WaitlistStatus enum eklendi |
| `app/api/waitlist/join/route.ts` | Email toplama endpoint'i (POST) |
| `app/api/waitlist/check/route.ts` | Waitlist durumu kontrol endpoint'i (GET) |
| `app/api/waitlist/[id]/route.ts` | Admin onay/red/silme endpoint'i (PATCH, DELETE) |
| `components/WaitlistModal.tsx` | Landing page üzerindeki modal form bileşeni |
| `app/waitlist/thank-you/page.tsx` | Waitlist'e katılım sonrası teşekkür sayfası |
| `app/admin/waitlist/page.tsx` | Admin waitlist dashboard sayfası |
| `components/WaitlistTable.tsx` | Admin paneli için interaktif tablo bileşeni |
| `app/api/checklist/route.ts` | Mevcut build hatasını düzelten dosya |

### Değiştirilen Dosyalar (2 adet)

| Dosya | Değişiklik |
|-------|------------|
| `app/page.tsx` | CTA butonları artık modal açıyor (Link → button + WaitlistModal) |
| `app/signup/page.tsx` | Kayıt öncesi waitlist status kontrolü eklendi |

### Test Dosyaları (3 adet — yeni)

| Dosya | Test Sayısı |
|-------|-------------|
| `__tests__/api/waitlist/join.test.ts` | 12 test |
| `__tests__/api/waitlist/check.test.ts` | 7 test |
| `__tests__/api/waitlist/admin.test.ts` | 8 test |

---

## 3. Veritabanı Değişiklikleri

### Yeni Model: Waitlist

```prisma
model Waitlist {
  id        String         @id @default(cuid())
  email     String         @unique
  name      String?
  source    String         @default("landing")
  status    WaitlistStatus @default(PENDING)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@index([email])
  @@index([status])
  @@index([createdAt])
}

enum WaitlistStatus {
  PENDING    // Beklemede
  APPROVED   // Onaylandı — kayıt yapabilir
  INVITED    // Davet gönderildi (gelecek kullanım)
  REJECTED   // Reddedildi (gelecek kullanım)
}
```

**Migration:** `add_waitlist` — uygulandı ve çalışıyor.

---

## 4. API Endpoint'leri

### POST /api/waitlist/join
Email toplama. Landing page modal'ından çağrılır.

| Senaryo | Status | Response |
|---------|--------|----------|
| Email boş/eksik | 400 | `{ error: "Email is required" }` |
| Geçersiz email formatı | 400 | `{ error: "Invalid email format" }` |
| Email zaten waitlist'te | 409 | `{ error: "Email already in waitlist" }` |
| Başarılı kayıt | 201 | `{ success: true, email: "..." }` |
| Sunucu hatası | 500 | `{ error: "Failed to join waitlist" }` |

**Özellikler:**
- Email lowercase'e çevrilir ve boşluklar temizlenir
- Opsiyonel `name` ve `source` parametreleri
- Duplicate email'ler engellenir (unique constraint)

---

### GET /api/waitlist/check?email=...
Signup sayfası tarafından çağrılır. Email'in waitlist durumunu kontrol eder.

| Senaryo | Status | Response |
|---------|--------|----------|
| Email parametresi yok | 400 | `{ error: "Email parameter required" }` |
| Email waitlist'te yok | 200 | `{ status: "NOT_FOUND" }` |
| Email beklemede | 200 | `{ status: "PENDING" }` |
| Email onaylanmış | 200 | `{ status: "APPROVED" }` |

---

### PATCH /api/waitlist/[id]
Admin panelinden çağrılır. Waitlist girişinin durumunu günceller.

| Senaryo | Status | Response |
|---------|--------|----------|
| Geçersiz status değeri | 400 | `{ error: "Invalid status" }` |
| Başarılı güncelleme | 200 | Güncellenmiş waitlist nesnesi |
| Sunucu hatası | 500 | `{ error: "Failed to update waitlist entry" }` |

**Kabul edilen status değerleri:** PENDING, APPROVED, REJECTED, INVITED

---

### DELETE /api/waitlist/[id]
Admin panelinden çağrılır. Waitlist girişini siler.

| Senaryo | Status | Response |
|---------|--------|----------|
| Başarılı silme | 200 | `{ success: true }` |
| Sunucu hatası | 500 | `{ error: "Failed to delete waitlist entry" }` |

---

## 5. UI Bileşenleri

### WaitlistModal (components/WaitlistModal.tsx)
- Landing page üzerinde açılan modal
- Email (zorunlu) + İsim (opsiyonel) inputları
- Submit → POST /api/waitlist/join
- Başarılı → "Başarılı!" mesajı → 1sn sonra /waitlist/thank-you'ya yönlendirme
- Hata → kırmızı banner ile gösterim
- Loading state → buton disabled + "Kaydediliyor..." yazısı
- Design system'e uygun: teal (#95dbda) buton, rounded-[20px] modal

### WaitlistTable (components/WaitlistTable.tsx)
- Admin panelinde kullanılan interaktif tablo
- Sütunlar: Email, İsim, Tarih, Durum, Aksiyonlar
- Status badge renkleri: kırmızı (PENDING), teal (APPROVED), gri (diğer)
- "Onayla" butonu → PATCH ile APPROVED yapar
- "Sil" butonu → onay dialogu → DELETE ile siler
- Tarih formatı: Türkçe locale (date-fns)
- Router.refresh() ile sayfa yenileme

### Thank You Page (app/waitlist/thank-you/page.tsx)
- ✨ emoji ile kutlama
- "Email takip et" hatırlatması
- Opsiyonel sosyal paylaşım (Twitter/LinkedIn)
- "Ana sayfaya dön" butonu

### Admin Dashboard (app/admin/waitlist/page.tsx)
- Server component — DB'den direkt okur
- İstatistik kartları: Toplam, Bekleyen, Onaylanan
- WaitlistTable bileşenini render eder

---

## 6. Signup Guard (app/signup/page.tsx)

Kayıt formuna eklenen kontrol mantığı:

```
Form submit edildiğinde:
1. GET /api/waitlist/check?email=... çağrılır
2. NOT_FOUND → "Lütfen önce waitlist'e katıl" hatası gösterilir
3. PENDING → "Hesabın henüz onaylanmamış" hatası gösterilir
4. APPROVED → Normal kayıt akışı devam eder (POST /api/auth/signup)
```

---

## 7. Landing Page Değişiklikleri (app/page.tsx)

- `"use client"` eklendi (state yönetimi için)
- `useState` ile `showWaitlist` state'i eklendi
- 3 adet CTA butonu güncellendi:
  - Header: "Ücretsiz başla" → `onClick={() => setShowWaitlist(true)}`
  - Hero: "Çalışma alanı oluştur" → `onClick={() => setShowWaitlist(true)}`
  - CTA section: "Ücretsiz çalışma alanı aç" → `onClick={() => setShowWaitlist(true)}`
- `<WaitlistModal>` bileşeni sayfanın sonuna eklendi

---

## 8. Test Sonuçları

```
 ✓ 5 test dosyası — hepsi PASSED
 ✓ 51 test — hepsi PASSED
 ✓ Süre: 274ms
```

### Test Detayları

#### __tests__/api/waitlist/join.test.ts (12 test)
```
✓ should return 400 if email is missing
✓ should return 400 if email is empty string
✓ should return 400 if email is not a string
✓ should return 400 for invalid email format
✓ should return 400 for email without domain
✓ should return 409 if email already in waitlist
✓ should create waitlist entry successfully
✓ should normalize email to lowercase and trim whitespace
✓ should use custom source when provided
✓ should handle name as null when not provided
✓ should return 500 on unexpected errors
✓ should not leak error details in 500 response
```

#### __tests__/api/waitlist/check.test.ts (7 test)
```
✓ should return 400 if email parameter is missing
✓ should return NOT_FOUND for unknown email
✓ should return PENDING for pending email
✓ should return APPROVED for approved email
✓ should normalize email to lowercase
✓ should return 500 on unexpected errors
✓ should not leak error details in 500 response
```

#### __tests__/api/waitlist/admin.test.ts (8 test)
```
✓ should return 400 for invalid status value
✓ should update entry to APPROVED
✓ should update entry to REJECTED
✓ should accept all valid status values (PENDING, APPROVED, REJECTED, INVITED)
✓ should return 500 on unexpected errors
✓ should delete entry successfully
✓ should return 500 if entry not found (delete)
✓ should not leak error details in 500 response (delete)
```

#### __tests__/api/auth/signup.test.ts (9 test — mevcut)
```
✓ should return 400 if email is missing
✓ should return 400 if password is missing
✓ should return 400 if both email and password are missing
✓ should return 400 if password is too short
✓ should return 400 if user already exists
✓ should create user with hashed password and default product
✓ should handle signup without name
✓ should return 500 on unexpected errors
✓ should not leak error details in 500 response
```

#### __tests__/lib/auth.test.ts (15 test — mevcut)
```
✓ Provider configuration (3 test)
✓ authorize() (6 test)
✓ JWT callback (3 test)
✓ Session callback (3 test)
```

---

## 9. Build Doğrulaması

```
✓ next build — Compiled successfully
✓ Linting and checking validity of types — PASSED
✓ Tüm sayfalar başarıyla derlendi
✓ Waitlist endpoint'leri build output'ta görünüyor:
  - /api/waitlist/[id]
  - /api/waitlist/check
  - /api/waitlist/join
  - /waitlist/thank-you
  - /admin/waitlist (implicit)
```

---

## 10. Güvenlik Notları

| Konu | Durum |
|------|-------|
| Email normalization (lowercase + trim) | ✅ Tüm endpoint'lerde |
| Duplicate email prevention | ✅ DB unique constraint + uygulama seviyesi kontrol |
| Error detail leaking | ✅ 500 hatalarında hassas bilgi sızdırılmıyor |
| Admin panel auth | ⚠️ Şu anda auth yok — lansman öncesi eklenecek |
| Rate limiting | ⚠️ Şu anda yok — gerekirse eklenecek |
| SQL injection | ✅ Prisma ORM kullanılıyor (parametrized queries) |
| XSS | ✅ React auto-escaping |

---

## 11. Bilinen Kısıtlamalar

1. **Admin paneli kimlik doğrulaması yok** — `/admin/waitlist` URL'ini bilen herkes erişebilir. Lansman öncesi session kontrolü eklenmeli.
2. **Email bildirimi yok** — Onaylanan kullanıcılara email gönderilmiyor. İleride entegre edilebilir (SendGrid, Resend vb.).
3. **Rate limiting yok** — Waitlist join endpoint'i rate limit'siz. Kötüye kullanımı engellemek için eklenebilir.
4. **Bulk approve yok** — Admin panelinde tek tek onay yapılıyor. Toplu onay özelliği eklenebilir.

---

## 12. Lansmanı İçin Yapılması Gerekenler

- [ ] Admin paneline auth ekle (session.user.role === "admin" kontrolü)
- [ ] Vercel'e deploy et (`git push` → otomatik deploy)
- [ ] Supabase DB migration'ı çalıştır (production)
- [ ] Landing page'i test et (modal açılıyor mu, email kaydediliyor mu)
- [ ] Admin panelini test et (onay çalışıyor mu)
- [ ] Onaylı email ile signup'ı test et
- [ ] (Opsiyonel) Rate limiting ekle
- [ ] (Opsiyonel) Email bildirim entegrasyonu ekle
