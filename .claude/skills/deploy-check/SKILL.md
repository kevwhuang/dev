---
description: Bump version, update packages, lint, test, build, and commit
user-invocable: true
---

Run each step in order. Stop on failure. Do not commit partial work.

1. **Kill ports**: kill processes on ports 4321 and 8888 if occupied
2. **Version**: set `version` in `package.json` to today's date as `YY.M.D`
3. **Update**: `bun update`
4. **Lint**: `bun run lint` and fix issues
5. **Test**: `bun run test` not `bun test`
6. **Build**: `bun run build`
7. **Commit**: stage changed files and commit

## Commit Format

`type: lowercase description`

Types: `chore` | `feat` | `fix` | `refactor` | `style`

## Rules

- Do not push
- Commit message must be concise
