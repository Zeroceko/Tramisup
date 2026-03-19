---
name: gsd-review
description: Review code changes for security, performance, and bugs
disable-model-invocation: true
argument-hint: "[--staged|--unstaged|commit-hash]"
---

Review code changes ($ARGUMENTS, default: staged) for:

1. Get diff via git
2. Review for: security vulnerabilities, performance issues, bugs, code quality
3. Output findings as file:line with severity (critical/warning/info)
4. Suggest specific fixes for each finding
