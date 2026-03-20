# Tiramisup Product Operating Model

Son güncelleme: Mart 2026

Bu belge roadmap’in stratejik tamamlayıcısıdır. Amacı feature listesi vermek değil; Tiramisup’ın kullanıcı için hangi işi hangi sistemle çözeceğini netleştirmektir.

---

## 1. Tiramisup’ın Temel Rolü

Tiramisup bir dashboard olmamalı. Dashboard’lar veri gösterir ama karar üretmez. Tiramisup’ın doğru formu şudur:

> **Launch-to-growth operating system for founders**

Yani sistem:
- ürünün şu anki durumunu anlamalı
- eksikleri göstermeli
- sonraki doğru aksiyonu önermeli
- karar ritmini oturtmalı
- zaman içinde kullanıcıya daha az soru sorup daha çok veri toplamalı

---

## 2. Kullanıcının Asıl Soruları

### Launch öncesi
- Ne kadar hazırım?
- Hangi alanlar eksik?
- Launch için beni ne blokluyor?
- Önümüzdeki 2 hafta neye odaklanmalıyım?

### Launch sonrası erken dönem
- Ürün gerçekten çalışıyor mu?
- Acquisition geliyor mu?
- Aktivasyon iyi mi?
- Kullanıcı kalıyor mu?
- Revenue sinyali oluşuyor mu?

### Growth aşaması
- Ana darboğazım ne?
- Hangi metrik bozuluyor?
- Bu hafta hangi işi yaparsam en çok kaldıraç yaratırım?
- Hangi ritimler sürdürülebilir, hangileri kağıt üstünde kalıyor?

### Daha olgun aşama
- Hangi ürünüm daha umut verici?
- Ekip kapasitesi nereye gitmeli?
- Paydaşlara ne raporlamalıyım?
- Hangi otomasyonlar manuel işi ortadan kaldırır?

---

## 3. Launch Phase: Kullanıcının Hazırlık Sistemi

Launch öncesi dönemde founder’ın asıl ihtiyacı “çok araç” değil, belirsizliği azaltan bir hazırlık sistemi.

### 3.1 Launch hazırlığı için gerekli boyutlar

#### Product readiness
- ürün değer önerisi net mi
- çekirdek kullanım akışı tamam mı
- onboarding akışı var mı
- bug seviyesi launch’a uygun mu
- feedback loop kurulmuş mu

#### Marketing readiness
- landing page var mı
- positioning net mi
- launch messaging hazır mı
- acquisition kanalları belli mi
- waitlist / email list / launch surfaces hazır mı

#### Legal & trust readiness
- privacy policy
- terms
- cookie consent
- payment / invoicing / compliance ihtiyaçları
- güven veren yüzeyler (contact, docs, pricing clarity)

#### Technical readiness
- hosting / environment
- analytics
- auth güvenilirliği
- error tracking / logging
- performance / uptime / backup temelleri

### 3.2 Launch phase’te Tiramisup ne yapmalı?

#### Kullanıcıdan sorulacaklar
- ürün ne satıyor
- kime satıyor
- ne zaman launch etmeyi planlıyor
- başarıyı nasıl tanımlıyor
- launch kanalı ne olacak
- hangi alanların en zayıf olduğunu düşünüyor

#### Kullanıcıdan sormadan alınabilecekler
- website var mı
- public launch surfaces var mı
- analytics bağlı mı
- pricing page var mı
- docs/help center yüzeyi var mı
- task backlog yoğunluğu
- checklist tamamlama hızı

#### Ürünün üretmesi gereken çıktılar
- launch score
- kategori bazlı readiness score
- blocker listesi
- kritik eksiklerden task üretimi
- launch review özeti
- “launch etmek için önce bunları çöz” listesi

### 3.3 Launch phase ürün akışı
1. kullanıcı product oluşturur
2. launch wizard ile ürün bağlamı alınır
3. sistem checklist’i template’ler
4. kullanıcı eksikleri işaretler / task üretir
5. dashboard launch risk özetini verir
6. haftalık review ile launch readiness güncellenir

---

## 4. Growth Phase: Takip ve Karar Sistemi

Launch sonrası ihtiyaç checklist’ten çok decision loop’tur.

### 4.1 Growth phase’te izlenecek ana boyutlar

#### Acquisition
- trafik geliyor mu
- hangi kaynaklardan geliyor
- CAC/kanal verimi ne durumda
- qualified signups oluşuyor mu

#### Activation
- kullanıcı ürünün değerini ilk ne zaman görüyor
- onboarding funnel nerede kırılıyor
- first action completion iyi mi

#### Retention
- kullanıcı geri geliyor mu
- haftalık/aylık tutunma nasıl
- churn sinyalleri neler

#### Revenue
- ücretli dönüşüm var mı
- MRR büyüyor mu
- plan mix / annual vs monthly / upsell fırsatı ne durumda

### 4.2 Growth phase’te Tiramisup ne yapmalı?

#### Kullanıcıdan sorulacaklar
- primary KPI nedir
- growth bottleneck sence nerede
- dominant channel hangisi
- şu çeyrekte ana hedefin ne
- retention mı acquisition mı revenue mu ana problem

#### Sormadan alınabilecekler
- GA4/PostHog traffic ve user data
- Stripe revenue / subscriptions
- product analytics event’leri
- routine tamamlama davranışı
- goal sapmaları
- task velocity

#### Ürünün üretmesi gereken çıktılar
- growth score
- bottleneck summary
- KPI trend özeti
- weekly growth review
- next best actions
- routine adherence summary
- experiment backlog / öneri alanı

### 4.3 Growth phase ürün akışı
1. kullanıcı metrics ve goals tanımlar
2. sistem haftalık review ritmi kurar
3. integrations bağlanır
4. sistem acquisition/activation/retention/revenue sinyallerini toplar
5. growth checklist + goals + metrics birleştirilir
6. ürün “şimdi ne yapmalı?” önerisi üretir

---

## 5. Kullanıcıya Sormadan Bilgi Alma Katmanı

Uzun vadede Tiramisup’ın kalitesi, kullanıcıya daha az soru sorup daha fazla doğru çıkarım yapabilmesine bağlı.

### 5.1 Pasif veri kaynakları

#### Revenue sources
- Stripe
- Paddle / Lemon Squeezy (ileride)

#### Analytics sources
- GA4
- PostHog
- Mixpanel
- Amplitude
- Segment (aggregator)

#### Website intelligence
- public website crawl
- pricing page parse
- docs/help center / changelog surface detection
- technical signals (analytics present, auth present, forms present)

#### Internal behavioral data
- checklist tamamlama hızı
- task durumu
- overdue work
- goal drift
- routine completion frequency

### 5.2 Bu verilerle neler üretilebilir?
- “launch readiness düşük çünkü technical ve marketing alanları aynı anda geride”
- “activation iyi değil çünkü signup var ama first action completion zayıf”
- “revenue tarafı büyüyor ama retention düşüyor”
- “bu hafta en riskli alan acquisition değil retention”

---

## 6. AI Katmanı: Ürün Kullanıcı İçin Ne Yapacak?

AI Tiramisup’ta chat kutusu olmak zorunda değil. Doğru rolü karar destek sistemi olmak.

### 6.1 AI’nin görevleri

#### A. Yapılandırma
Kullanıcının dağınık cevaplarından ürün profilini çıkarır.

Örnek:
> “Biz küçük e-ticaret ekiplerine analytics dashboard satıyoruz.”

çıktı:
- category: SaaS / analytics
- audience: SMB e-commerce teams
- business model: subscription
- likely KPIs: activation, weekly active teams, MRR

#### B. Özetleme
- haftalık durum özeti
- launch review özeti
- growth review özeti
- integration health summary

#### C. Önceliklendirme
- en riskli alan ne
- hangi goal sapıyor
- hangi task’ler gerçekten kritik
- sonraki en iyi 3 aksiyon ne

#### D. Taslak üretimi
- launch plan summary
- investor update taslağı
- weekly ops brief
- experiment brief

### 6.2 AI’den ne beklenmemeli?
- her şeyi kullanıcı yerine karar vermesi
- ham gizli credential’lara erişmesi
- doğrulanmamış kesin öneriler vermesi

AI yorum katmanıdır; source of truth değil.

---

## 7. MCP / Tool Layer: Gelecekte Nerede Kullanılır?

Bugün projede yapılandırılmış MCP sunucusu yok. Ama ileride bu katman kritik olabilir.

### 7.1 Entegrasyon MCP’leri
Amaç: vendor API’lerine güvenilir tool-based erişim
- Stripe MCP veya resmi API wrapper tool’ları
- GA4 / analytics tools
- CRM tools

### 7.2 Crawl / browser MCP’leri
Amaç: kullanıcının public product surface’ini anlamak
- website crawl
- pricing/docs/support surface extraction
- launch readiness audit

### 7.3 Internal Tiramisup MCP
Amaç: AI’ye kontrollü iç veri erişimi sağlamak
- get_product_profile
- get_launch_risks
- get_growth_summary
- get_metrics_anomalies
- get_next_actions

Bu, AI layer’ın ham DB okuması yerine kontrollü tool kullanmasını sağlar.

---

## 8. Ürün Zekâsı Nasıl Derinleşecek?

### Level 1 — Record system
- kullanıcı veri girer
- sistem saklar

### Level 2 — Structured operating system
- checklist, tasks, goals, routines bağlanır
- sistem özet üretir

### Level 3 — Passive intelligence system
- integrations ile veri akar
- sistem otomatik sağlık görüntüsü oluşturur

### Level 4 — Recommendation system
- AI next best action önerir
- risk ve fırsatları özetler

### Level 5 — Compounding founder system
- benchmark’lar
- template’ler
- benzer ürün tipleri için playbook’lar
- portfolio intelligence

Tiramisup’ın uzun vadeli değeri Level 4–5’te başlar. Ama Level 1–3 sağlam kurulmadan oraya çıkılamaz.

---

## 9. Yakın Vadede Ürünün Kullanıcı İçin Yapması Gerekenler

### Hemen
- launch durumunu görünür yapmak
- eksikleri task’lere çevirmek
- metrics/growth loop’unu usable yapmak

### Sonra
- kullanıcıdan daha az veri istemek
- gerçek integrations ile otomatik veri toplamak
- haftalık review hazırlamak

### Daha sonra
- bir founder için operasyon tavsiye sistemi olmak
- birden fazla ürünü kıyaslayabilmek
- ekip ve paydaş katmanına açılmak

---

## 10. Uygulama İçin Net Çıkarımlar

Bu dokümanın engineering sonuçları şunlar:

1. Product creation wizard şart
2. Growth readiness ayrı sayfa olarak şart
3. Kanban board şart
4. Active product context şart
5. First real integration olarak Stripe + bir analytics provider şart
6. Weekly review mode şart
7. AI layer’ı feature değil, system layer olarak planlanmalı

---

## 11. Sonuç

Tiramisup’ın başarısı şu sıraya bağlı:

- ürünü doğru tanımak
- launch hazırlığını sistemleştirmek
- growth takibini ritme bağlamak
- kullanıcıdan sormadan veri toplamaya başlamak
- sonra öneri sistemine dönüşmek

Doğru son form şu:

> **Tiramisup, founder’ın ürününü anlamasına, launch’a hazırlanmasına, growth darboğazlarını görmesine ve doğru sonraki adımı seçmesine yardım eden operating system.**
