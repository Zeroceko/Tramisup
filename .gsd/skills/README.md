# Tiramisup Project Skills

Bu klasör projeye özel GSD skill'lerini içerir. Her skill belli bir görevi çözmek için özelleşmiş knowledge/pattern içerir.

---

## 📁 AVAILABLE SKILLS

| Skill | Ne Zaman Kullan | Dosya |
|-------|----------------|-------|
| **legal-advisor** | Privacy policy, terms, GDPR, contracts, compliance | `legal-advisor/SKILL.md` ⚖️ |
| **research-synthesizer** | Deep research, competitive analysis, synthesis | `research-synthesizer/SKILL.md` 🔬 |
| **product-strategist** | Product strategy, roadmap, PRD, OKRs, user research | `product-strategist/SKILL.md` 🎯 |
| **ui-ux-designer** | UI design, wireframes, design system, a11y, user testing | `ui-ux-designer/SKILL.md` 🎨 |
| **data-analyst** | Analytics, SQL, metrics, A/B testing, dashboards | `data-analyst/SKILL.md` 📊 |
| **sprint-development** | Sprint planning, task breakdown, test writing | `sprint-development/SKILL.md` ⭐ |
| **playwright** | E2E testing, browser automation, UI testing | `playwright/SKILL.md` ⭐ |
| **python-pro** | Python dev, FastAPI, async/await, testing | `python-pro/SKILL.md` ⭐ |
| **tramisu-optimizer** | Tiramisup odaklı optimization, audit, improvement work | `tramisu-optimizer/SKILL.md` |
| **frontend-design** | UI component, landing page, dashboard, React/CSS work | `frontend-design/SKILL.md` |
| **lint** | Code linting, formatting, ESLint/Biome/Prettier | `lint/SKILL.md` |
| **test** | Generate tests, run test suites, test coverage | `test/SKILL.md` |
| **review** | Code review, PR review, security/performance check | `review/SKILL.md` |

---

## 🎯 NASIL KULLANILIR

### Skill Loading (AI Agent için)

```markdown
When working on [task type], load the relevant project skill:

read .gsd/skills/[skill-name]/SKILL.md
```

### Manuel Kullanım

Her skill dosyası kendi başına okunabilir markdown dokümandır:
- Patterns
- Best practices
- Common pitfalls
- Code examples
- Decision frameworks

---

## 📦 SKILL EKLEMLERİ

### Yeni skill eklemek için:

1. Klasör oluştur: `.gsd/skills/my-skill/`
2. SKILL.md dosyası yaz
3. Bu README'ye ekle

### Skill Template:

```markdown
# My Skill Name

**When to use:** [Trigger conditions]

## Patterns

[Core patterns and approaches]

## Best Practices

[Dos and don'ts]

## Examples

[Code examples]

## Common Pitfalls

[What to avoid]
```

---

## 🔗 GLOBAL SKILLS

Global skill'ler için: `~/.gsd/agent/skills/`

Project-specific skill'ler için: `.gsd/skills/` (bu klasör)

---

**Maintained By:** Development Team  
**Last Updated:** 2026-03-20
