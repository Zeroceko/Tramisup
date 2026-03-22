# Sprint 3 — Operator Loop Closure

**Başlangıç:** 22 Mart 2026
**Hedef:** Kullanıcı ürün oluşturduktan sonra ne yapacağını bilir. Launch ettikten sonra workspace buna göre değişir.
**Milestone:** M002 — True MVP Operator Loop

---

## Tüm Ekibe Duyuru

Sprint 3 başladı.

Sprint 2'de foundation'ı tamamladık: production ayağa kalktı, AI plan çalışıyor, wizard URL analizi yapıyor, dashboard fallback düzeltildi. Kullanıcı artık ürün oluşturabiliyor.

Sprint 3'te bunu kapatıyoruz: **kullanıcı ürün oluşturduktan sonra kaybolmamalı.**

---

## Aktif Slices

### S1 — launchStatus → product.status mapping
- **Owner:** fullstack-developer
- **Dosya:** `app/api/products/route.ts`
- **İş:** Wizard'da "Launch oldu" veya "Büyüme aşamasında" seçilirse `product.status = "LAUNCHED"`, diğerleri `"PRE_LAUNCH"`
- **Kabul:** Product DB'de doğru status ile yaratılıyor

### S2 — "Ürünümü launch ettim" butonu
- **Owner:** fullstack-developer
- **Dosyalar:** `app/[locale]/pre-launch/page.tsx`, `app/api/products/[id]/route.ts`
- **İş:** Pre-launch sayfasında kullanıcı kendi kararıyla launch'a geçebilir. `PATCH /api/products/[id]` status günceller.
- **Kabul:** Buton görünür, tıklanınca status değişir, sayfa güncellenir

### S3 — Dashboard launch durumuna göre değişir
- **Owner:** fullstack-developer
- **Dosya:** `app/[locale]/dashboard/page.tsx`
- **İş:** `PRE_LAUNCH` → launch checklist ön planda. `LAUNCHED` → growth checklist + metrik öne çıkıyor.
- **Kabul:** İki farklı status için dashboard farklı içerik gösteriyor

### S4 — Dashboard AI eksik analizi kartı
- **Owner:** fullstack-developer
- **Dosyalar:** yeni `app/api/products/[id]/insights/route.ts` + dashboard card
- **İş:** URL verildiyse AI site analizi gösterir. "Şu an ürününüzde eksik olanlar" kartı.
- **Kabul:** URL olan ürünlerde kart görünür, olmayanlarda gizlenir

### S5 — Growth checklist erişimi
- **Owner:** fullstack-developer
- **Dosya:** `app/[locale]/growth/page.tsx`
- **İş:** LAUNCHED kullanıcı growth checklist'i görür ve işaretleyebilir
- **Kabul:** Checklist items render ediliyor, toggle çalışıyor

### S6 — Build + test + smoke
- **Owner:** qa-tester
- **İş:** 58 test geçer, build temiz, production'da wizard → dashboard → pre-launch → launch geçişi çalışır

---

## Kural Hatırlatmaları (bu sprint için)

- Her link `/${locale}/path` formatında — bare `/dashboard` yok
- `product.status` değişikliği için `PATCH /api/products/[id]` — yeni route gerekiyor
- `prisma.$transaction` kullanılacaksa Session Pooler (port 5432) zorunlu
- S1 bitmeden S2 başlamaz. S2 bitmeden S3 başlamaz. S4 ve S5 paralel yapılabilir.

---

## Out of Scope (bu sprint)

- Multi-product selector / ürün switching UI (M004)
- Gerçek entegrasyonlar / Stripe (M005)
- Dosya yükleme wizard'a (ileriki sprint)
- Email bildirimleri (kuruldu, henüz tetiklenmiyor — beklemede)

---

## Ekip Rolleri Bu Sprint

| Ajan | Sorumluluk |
|---|---|
| **fullstack-developer** | S1–S5 implementation |
| **qa-tester** | S6 smoke test + her slice sonrası regresyon kontrolü |
| **product-designer** | S2 buton UX + S3 dashboard layout direction |
| **principal-pm** | Scope koruma — yeni iş eklemek için onay gerekli |
| **sprint-planner** | Sprint sonu retrospektif + S4 önce mi S5 önce mi kararı |
| **first-time-user** | S3 sonrası dashboard deneyimini gözden geçirir |
| **docs-updater** | Sprint sonu HANDOFF güncellemesi |
