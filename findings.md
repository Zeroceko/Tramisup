# Findings

## Flow inventory

### Public flows
1. Landing page
   - Entry: `/`
   - Goal: ürünün değer önerisini anlatmak, login/signup'a yönlendirmek
   - State: çalışıyor
   - Gap: ürün gerçekliğinden daha parlak, iç ürün akışları kadar güçlü değil

2. Signup
   - Entry: `/signup`
   - Steps:
     - name/email/password alınır
     - `POST /api/auth/signup`
     - `User` yaratılır
     - default `Product` yaratılır
     - `seedProductData(product.id)` çağrılır
     - kullanıcı login ekranına gitmeden dashboard’a geçmeye hazır hale gelir
   - State: çalışıyor
   - Gap: product wizard yok; herkes tek bir varsayılan ürünle başlıyor

3. Login
   - Entry: `/login`
   - Steps:
     - next-auth credentials signIn
     - jwt session oluşur
     - `/dashboard`
   - State: çalışıyor
   - Gap: forgot password / email verification yok

### Authenticated flows
4. Dashboard overview
   - Entry: `/dashboard`
   - Reads:
     - first product by `userId`
     - launch checklist counts
     - latest metric
     - goal count
     - connected integrations count
   - Gives:
     - readiness score
     - latest DAU/MRR
     - quick actions
     - goal pulse
   - State: çalışıyor
   - Gap: active product selector yok; dashboard tek product varsayıyor

5. Pre-launch control
   - Entry: `/pre-launch`
   - Reads:
     - `LaunchChecklist[]`
     - open `Task[]`
   - User actions:
     - checklist toggle (`PATCH /api/checklist/[id]`)
     - add task (`POST /api/actions`)
     - task done/undo (`PATCH /api/actions/[id]`)
   - State: çalışıyor
   - Gap: blocker extraction, task<->checklist linkage, launch review mode yok

6. Metrics loop
   - Entry: `/metrics`
   - Reads:
     - last 30 days `Metric[]`
     - latest metric
     - retention cohorts
     - activation funnel
   - User actions:
     - manual metric upsert (`POST /api/metrics`)
   - State: çalışıyor
   - Gap: KPI configuration, source-of-truth mapping, real integrations yok

7. Growth loop
   - Entry: `/growth`
   - Reads:
     - `Goal[]`
     - `GrowthRoutine[]`
     - `TimelineEvent[]`
   - User actions:
     - goal create (`POST /api/goals`)
     - goal progress update (`PATCH /api/goals/[id]`)
     - routine create (`POST /api/routines`)
     - routine complete (`POST /api/routines/[id]/complete`)
   - State: çalışıyor
   - Gap: `GrowthChecklist` modeli var ama growth-readiness flow yok

8. Integrations shell
   - Entry: `/integrations`
   - Reads:
     - `Integration[]` by product
   - User actions:
     - connect (`POST /api/integrations`) with API key shell
     - disconnect (`DELETE /api/integrations/[id]` expected)
     - test (`POST /api/integrations/[id]/test`)
   - State: kısmen çalışıyor / façade
   - Gap: real sync, encryption, provider-specific flows yok

9. Settings
   - Entry: `/settings`
   - Reads:
     - user + first product
   - User actions:
     - profile/product patch (`PATCH /api/settings`)
   - State: çalışıyor
   - Gap: multi-product settings yok

### Missing but schema-supported flows
10. Products management
   - Schema support: `User -> Product[]`
   - Missing UI: products list, create-product wizard, active product switch

11. Growth readiness
   - Schema support: `GrowthChecklist`
   - Missing UI/API flow: dedicated page and toggle UX

12. Kanban board
   - Schema support: `Task.status` TODO/IN_PROGRESS/DONE
   - Current UX: list only
   - Missing UX: board view, filters, drag/drop or move actions

## Product observations
- Kod tabanı feature breadth olarak MVP’nin önünde gidiyor; data model ürün deneyiminden daha zengin.
- En büyük eksik tek bir güçlü operator loop: create product -> assess launch -> track metrics -> run growth cadence.
- Multi-product gerçekliği schema’de var ama kullanıcı deneyiminde yok.
- Integrations yüzeyi ürün vaadini gösteriyor ama henüz veri değeri üretmiyor.
- Growth tarafında goals/routines var; growth-readiness checklist missing olduğu için launch sonrasına geçiş yarım kalıyor.

## Documentation gaps
- README/HANDOFF bazı yerlerde kodun ilerisindeki dünyayı anlatıyor; bunlar ekip için karıştırıcı.
- `.gsd/` belgeleri bugünkü ürün gerçekliği ve gelecek yönü için yetersiz.
