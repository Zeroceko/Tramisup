---
name: gsd-lint
description: Auto-detect and run linters with auto-fix
disable-model-invocation: true
argument-hint: "[path]"
---

Lint the code in $ARGUMENTS (or entire project if no argument):

1. Detect linter: ESLint, Biome, Prettier, or native formatter
2. Run with `--fix` flag
3. Report remaining issues with file:line:column format
4. Suggest fixes for unfixable issues
