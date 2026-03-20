# E2E Testing with Playwright

Playwright E2E testleri Sprint 1-2-3 için manuel test case'lerini otomatikleştirir.

---

## 🚀 KURULUM

Zaten kurulu! (playwright.config.ts + tests/e2e/ hazır)

```bash
# Browserları kur (ilk seferinde)
npx playwright install
```

---

## ▶️ TESTLERI ÇALIŞTIR

### Tüm testler (headless):
```bash
npm run test:e2e
```

### UI mode (interactive):
```bash
npm run test:e2e:ui
```

### Headed mode (browser görünür):
```bash
npm run test:e2e:headed
```

### Sadece mobile testler:
```bash
npm run test:e2e:mobile
```

### Spesifik test dosyası:
```bash
npx playwright test sprint-1-manual.spec.ts
```

---

## 📁 DOSYA YAPISI

```
tests/e2e/
├── sprint-1-manual.spec.ts    # Sprint 1 manuel testleri (TC-050, TC-051, ...)
├── sprint-2-e2e.spec.ts        # Sprint 2 testleri (TODO)
└── helpers.ts                  # Test helper functions (login, createProduct, ...)

playwright.config.ts            # Playwright config (ports, browsers, etc.)
```

---

## 🧪 SPRINT 1 MANUAL TESTS

**Dosya:** `tests/e2e/sprint-1-manual.spec.ts`

**Test Cases:**
- ✅ TC-050: Empty state (no products)
- ✅ TC-051: Second product creation
- ✅ TC-053: Product switching & data verification
- ✅ TC-071: Mobile product dropdown
- ✅ TC-072: Mobile responsive test
- ✅ TC-082: Browser compatibility (Chrome)

**Çalıştır:**
```bash
npm run test:e2e
```

**Sadece mobile testler:**
```bash
npm run test:e2e:mobile
```

---

## 🔧 TEST YAZMA

### Yeni test ekle:
```typescript
import { test, expect } from '@playwright/test';
import { login, createProduct } from './helpers';

test('My new test', async ({ page }) => {
  await login(page);
  
  await page.goto('/my-page');
  
  await expect(page.getByText('Expected text')).toBeVisible();
});
```

### Helper kullan:
```typescript
import { login, switchProduct } from './helpers';

test('Test with helpers', async ({ page }) => {
  await login(page);
  await switchProduct(page, 'My Product');
  
  // Continue testing...
});
```

---

## 📊 RAPORLAR

Test bittikten sonra HTML raporu otomatik açılır:

```bash
npx playwright show-report
```

---

## ⚙️ KONFİGÜRASYON

**Dosya:** `playwright.config.ts`

**Port:** `http://localhost:3001` (dev server otomatik başlar)

**Browserlar:**
- Desktop Chrome (default)
- Mobile (iPhone 12)

**Screenshots:** Sadece fail olan testlerde

**Trace:** İlk retry'da

---

## 🎯 CI/CD İÇİN

```yaml
# .github/workflows/test.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

---

## 📝 TODO

- [ ] Sprint 1 testlerinde login helper'ı implement et
- [ ] Product wizard'ın 7 adımını complete et
- [ ] Sprint 2 testlerini yaz
- [ ] Sprint 3 testlerini yaz
- [ ] CI/CD pipeline ekle

---

## 🐛 DEBUGGING

### Screenshot + trace al:
```bash
npx playwright test --trace on --screenshot on
```

### Trace viewer aç:
```bash
npx playwright show-trace trace.zip
```

### Debug mode:
```bash
npx playwright test --debug
```

---

**Last Updated:** 2026-03-20  
**Maintained By:** QA Team
