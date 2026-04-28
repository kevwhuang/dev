---
description: Run JS, CSS, HTML, and web audits in parallel
name: audit
---

Launch four audits concurrently. Send all four Agent invocations in a single message. Use `subagent_type: "general-purpose"` for each.

## Agents

| Agent      | Skill File                           |
| ---------- | ------------------------------------ |
| audit-css  | `.claude/skills/audit-css/SKILL.md`  |
| audit-html | `.claude/skills/audit-html/SKILL.md` |
| audit-js   | `.claude/skills/audit-js/SKILL.md`   |
| audit-web  | `.claude/skills/audit-web/SKILL.md`  |

Each prompt must include:

- Instruction to read its skill file and follow every rule exactly
- The project root is the current working directory
- Skip paths in `.gitignore`
- Return results as a Markdown table with columns: File, Lines, Issue
- If no issues are found, return "No issues."

## Output

After all four agents return, combine results into a single table grouped by file. Deduplicate overlapping issues.

## Rules

- Only report files with issues
- Report only. No recommendations, no editorializing, no offering to fix.
- Get user approval before making any fixes
- Run `bun run lint` after all changes are applied
