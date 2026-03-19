# GSD Skills for Claude Code

This project is **GSD-enabled**! 🚀

## Quick Start in Terminal

```bash
# Start GSD interactive mode
gsd

# Or use the alias
pi

# Single-shot commands
gsd "run tests"
gsd "review my changes"
gsd "lint all TypeScript files"
```

## Available Skills

Type `/skills` in GSD terminal to see all skills, or use these directly:

- **@lint** - Auto-detect and run linters (ESLint, Biome, Prettier)
- **@review** - Security, performance, bug review  
- **@test** - Generate or run tests
- **@code-optimizer** - Deep performance audit (14 domains)
- **@debug-like-expert** - Systematic debugging protocol
- **@frontend-design** - Production-grade UI design
- **@accessibility** - WCAG accessibility audit
- **@agent-browser** - Playwright automation

## Usage in Claude Code (VS Code)

Since Claude Code doesn't support GSD's native `/` commands, use these patterns:

### Method 1: @-mention (Recommended)
```
@gsd-skills /lint all files
@gsd-skills /review staged changes
@gsd-skills /test the auth module
```

### Method 2: Direct skill invocation
```
Run @lint with auto-fix
Do a @review of my changes  
Generate @test for this component
```

### Method 3: Natural language
```
"Lint all TypeScript files"
"Review my staged changes for security issues"
"Generate tests for the auth service"
```

## How It Works

- **GSD Terminal**: Full interactive mode with real `/` slash commands
- **Claude Code**: Reads this file + `.vscode/settings.json` for context
- **Skills auto-load**: Both systems recognize skill patterns

## Configuration Files

- `.gsd/` - GSD project state (partially gitignored)
- `gsd-skills.md` - This reference (Claude Code integration)
- `.vscode/settings.json` - VS Code context files
- `.vscode/gsd-skills.md` - Detailed skill implementations

## Tips

1. **For big tasks**: Use GSD terminal (`gsd`)
2. **For quick fixes**: Use Claude Code with `@gsd-skills`
3. **For code reading**: Either works great!

## Troubleshooting

If skills don't work in Claude Code:
1. Reload VS Code: `CMD+Shift+P` → "Developer: Reload Window"  
2. Check `.vscode/settings.json` has `gsd-skills.md` in `claude.contextFiles`
3. Try `@gsd-skills.md /skills` to verify it's loaded

---

**Pro tip**: Start tasks in GSD terminal, then switch to Claude Code for refinements!
