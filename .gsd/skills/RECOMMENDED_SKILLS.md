# Tramisu İçin Önerilen AITMPL Skills

## Hemen Kullan (High Priority) 🔥

### 1. React Performance Optimization
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/performance-testing/react-performance-optimization.md`
**Neden:** Tramisu React/Next.js kullanıyor, Recharts gibi ağır kütüphaneler var
**Kullanım:** "optimize react components" / "find react performance issues"

### 2. Database Optimization  
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/database/database-optimization.md`
**Neden:** Prisma queries optimize etmek, N+1 problems bulmak
**Kullanım:** "optimize database queries" / "find slow queries"

### 3. Web Vitals Optimizer
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/performance-testing/web-vitals-optimizer.md`
**Neden:** LCP, CLS, INP gibi Core Web Vitals'ı iyileştir
**Kullanım:** "optimize web vitals" / "improve page load"

### 4. Test Automator
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/performance-testing/test-automator.md`
**Neden:** Unit ve integration testleri otomatik oluştur
**Kullanım:** "generate tests" / "add test coverage"

### 5. Performance Engineer
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/performance-testing/performance-engineer.md`
**Neden:** Bundle size, code splitting, lazy loading analizi
**Kullanım:** "analyze bundle size" / "reduce bundle"

## Yakında Kullan (Medium Priority) ⭐

### 6. Postgres Pro
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/database/postgres-pro.md`
**Neden:** PostgreSQL spesifik optimizasyonlar ve best practices
**Kullanım:** "optimize postgres" / "improve database performance"

### 7. Database Architect
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/database/database-architect.md`
**Neden:** Schema tasarımı, index stratejisi, normalization
**Kullanım:** "review database schema" / "improve data model"

### 8. Security Expert
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/security/*.md`
**Neden:** Auth, encryption, OWASP güvenlik kontrolleri
**Kullanım:** "security audit" / "find vulnerabilities"

## İleride Kullan (Low Priority) 📅

### 9. Load Testing Specialist
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/performance-testing/load-testing-specialist.md`
**Neden:** Production'a çıkmadan önce yük testi
**Kullanım:** "setup load testing" / "stress test"

### 10. Neon Expert (PostgreSQL hosting)
**Dosya:** `~/.gsd/agent/skills/aitmpl-temp/cli-tool/components/agents/database/neon-expert.md`
**Neden:** Vercel'e deploy ederken Neon Postgres kullanabilirsiniz
**Kullanım:** "setup neon database" / "migrate to neon"

---

## Hızlı Kurulum

```bash
# Tüm AITMPL skill'lerini al
cd ~/.gsd/agent/skills
git clone https://github.com/davila7/claude-code-templates.git aitmpl

# Tramisu'da kullan
cd /path/to/Tramisu
gsd
# "use react-performance-optimization skill"
```

## Nasıl Kullanılır?

### Yöntem 1: Doğrudan isim ile
```
gsd> use react-performance-optimization
gsd> optimize my components
```

### Yöntem 2: Tetikleyici kelimelerle
```
gsd> optimize react components
# (Otomatik olarak react-performance-optimization skill'ini yükler)
```

### Yöntem 3: Manuel referans
```
gsd> read the react performance skill and apply it to MetricsOverview.tsx
```

---

## Skill Kombinasyonları

### 🎯 Startup İçin İdeal Workflow:

1. **Önce Database** → database-optimization
2. **Sonra React** → react-performance-optimization  
3. **Sonra Bundle** → performance-engineer
4. **Son Web Vitals** → web-vitals-optimizer
5. **Test Ekle** → test-automator

### 🚀 Pre-Production Checklist:

```bash
gsd> use security-expert and audit the codebase
gsd> use load-testing-specialist and setup tests
gsd> use database-optimization and review all queries
```

