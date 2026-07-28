---
description: Pre-deployment pipeline
name: predeploy
user-invocable: true
---

Run each step in order:

1. Kill processes on ports 4321 and 8888
2. Set `version` in `package.json` to `YY.M.D`
3. `bun update`
4. `bun run lint` and fix issues
5. `bun run test` and fix issues
6. `bun run build` and fix issues
7. If all steps pass, propose the commit message and stop
8. After approval, `git add .` and commit

## Commit

- Format: `type: lowercase description`, starting with a verb
- Types: `chore` | `content` | `feat` | `fix` | `init` | `refactor`
- Prefer one concise, general description over enumerating changes
- Always include `Co-Authored-By: Claude <noreply@anthropic.com>`
