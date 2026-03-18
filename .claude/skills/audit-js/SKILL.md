---
description: Enforce JavaScript and TypeScript conventions
user-invocable: true
---

Audit `.js`, `.ts`, `.tsx` files and frontmatter and `<script>` blocks in `.astro` files.
Skip paths in `.gitignore`.

## Ordering

Sort all identifiers lexicographically, case-sensitive, uppercase before lowercase. This applies to variable declarations, object properties, interface properties, type properties, destructured bindings, and nested properties at all levels.

Reorder top-level declarations in this sequence:

1. **Imports**: three groups separated by blank lines: external, internal, types. Sort by binding name, ignoring braces. Sort destructured bindings within braces.
2. **Types and interfaces**: types before interfaces. Sort properties.
3. **Constants**: static values known at definition time
4. **Variables**: derived or computed state
5. **Helpers**: internal utility functions
6. **Main logic**: primary functions and classes
7. **Exports**: `export` and `export default` at the very end

## Tests

Order test cases by rendering order, not alphabetically.

## Style

- No `console.log` or `debugger`
- No comments
- No `.then()` chains. Use `async`/`await`.
- Descriptive names. Flag ambiguous or abbreviated identifiers.
- Prefer `const` over `let` when never reassigned
- Prefer `function` declarations over arrows unless inline callbacks or `this`-binding
- `for` and `while` loops always use braces and multiple lines
- Avoid ternaries unless they fit on one line
- 4-space indentation. Indent `<script>` content inside the tag in `.astro` files.
- Blank lines around block elements: functions, if/else, for/while, try/catch, classes
- Blank lines between logical groups but not between consecutive declarations in the same category
- Consecutive single-line guards may stay grouped. Multi-line if blocks always need surrounding blank lines.

## Safety

- No unchecked nullable access. Type narrowing must carry into closures.
- No swallowed errors. Empty `catch` blocks must log or re-throw.
- Never mutate parameters
- Strict equality only: `===` and `!==`
- No magic numbers. Extract to named constants.

## Astro

At most one `<script>` block per `.astro` file.

## Rules

- Only report files with issues
- Report issues in a table with columns: File, Lines, Issue
- Report only. No recommendations, no editorializing, no offering to fix.
- Get user approval before making any fixes
- No logic changes. Reorder, rename, and reformat only.
- Run `bun run lint` after all changes are applied
