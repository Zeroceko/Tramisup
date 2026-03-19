# Tramisu - Project Instructions

## GSD Skills

This project uses GSD (Get Shit Done) skills. When the user types any of the following commands, execute them according to the instructions below:

### /lint [path]
1. Detect linter: ESLint, Biome, Prettier, or native formatter
2. Run with `--fix` flag
3. Report remaining issues with file:line:column
4. Suggest fixes for unfixable issues

### /review [--staged|--unstaged|commit-hash]
1. Get diff via git (staged by default)
2. Review for: security vulnerabilities, performance issues, bugs, code quality
3. Output: file:line findings with severity (critical/warning/info)
4. Suggest specific fixes

### /test [path]
- If path is source file: generate tests (using Vitest, configured in vitest.config.ts)
- If path is test file: run tests and analyze failures
- No path: run full test suite with `npm test`

### /optimize [path]
Run deep performance audit across: DB queries, memory usage, algorithms, bundle size, rendering, caching, network, async operations, data structures, error handling, build config, API design, state management, type safety.

### /debug [description]
Systematic debugging: gather evidence, form hypotheses, test them, verify fix.

### /design [description]
Create production-grade, distinctive UI components avoiding generic AI aesthetics.

### /a11y [path]
WCAG 2.1 audit: ARIA attributes, keyboard navigation, screen reader support, color contrast.

### /browser [task]
Playwright automation: navigate, click, type, extract data.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Prisma 7 (PostgreSQL)
- NextAuth 4 (Credentials + JWT)
- Tailwind CSS 3
- Vitest for testing
