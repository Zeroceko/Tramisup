---
name: gsd-test
description: Generate or run tests (Vitest)
disable-model-invocation: true
argument-hint: "[path or module name]"
---

Handle testing for $ARGUMENTS (or full suite if no argument):

- If argument is a source file/module: generate tests using Vitest
- If argument is a test file: run it and analyze failures
- No argument: run full test suite with `npm test`

This project uses Vitest (config: vitest.config.ts). Tests go in `__tests__/` mirroring the source structure.
