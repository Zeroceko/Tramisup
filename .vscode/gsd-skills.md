# GSD Skills Reference

When user types `/` commands, map them to these instructions:

## /skills
List all available skills:
- **@accessibility** - WCAG 2.1 audit, ARIA fixes, keyboard navigation
- **@agent-browser** - Playwright automation, form filling, data extraction
- **@best-practices** - Security audit, code quality, modernization
- **@code-optimizer** - Performance audit across 14 domains (DB, memory, algorithms, etc)
- **@core-web-vitals** - LCP, INP, CLS optimization for page experience
- **@debug-like-expert** - Methodical root cause analysis for complex issues
- **@frontend-design** - Production-grade UI with distinctive design
- **@lint** - Auto-detect ESLint/Biome/Prettier and run with fixes
- **@review** - Security, performance, bug review of code changes
- **@test** - Generate comprehensive tests or run existing suite

## /lint [path]
1. Detect linter: ESLint, Biome, Prettier, or native formatter
2. Run with `--fix` flag
3. Report remaining issues with file:line:column
4. Suggest fixes for unfixable issues

## /review [--staged|--unstaged|commit-hash]
1. Get diff via git
2. Review for: security vulnerabilities, performance issues, bugs, code quality
3. Output: file:line findings with severity (critical/warning/info)
4. Suggest specific fixes

## /test [path]
- If path is source file: generate tests (detect Jest/Vitest/etc)
- If path is test file: run tests and analyze failures
- No path: run full test suite

## /optimize
Run @code-optimizer: parallel specialist agents hunt performance issues across all domains without reading full source first (pattern-based detection)

## /debug
Activate @debug-like-expert: systematic investigation with evidence gathering, hypothesis testing, rigorous verification

## /design [description]
Use @frontend-design to create distinctive, polished UI avoiding generic AI aesthetics

## /a11y [path]
Run @accessibility audit: WCAG compliance, screen reader support, keyboard navigation

## /browser [task]
Use @agent-browser for web automation: navigate, click, type, extract data

---

**Implementation**: When user types these commands, invoke the corresponding skill with appropriate context.
