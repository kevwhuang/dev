---
description: Run all audits in parallel
name: audit
---

Launch concurrently in a single message using `subagent_type: "general-purpose"`:

1. `.claude/skills/audit-css/SKILL.md`
2. `.claude/skills/audit-html/SKILL.md`
3. `.claude/skills/audit-js/SKILL.md`
4. `.claude/skills/audit-web/SKILL.md`

## Protocol

- Combine and deduplicate results into a single table grouped by file
