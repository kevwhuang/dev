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
7. Stage all files and commit if all steps pass

## Commit

- Format: `type: lowercase description`
- Types: `chore` | `content` | `feat` | `fix` | `init` | `refactor`
- Concise and general when appropriate
- Always include `Co-Authored-By: Claude <noreply@anthropic.com>`
