---
description: Enforce JS and TS conventions
name: audit-js
user-invocable: true
---

- Audit `.js`, `.ts`, `.tsx` files, `<script>` blocks, and frontmatter in `.astro` files
- Skip paths in `.gitignore`

## Protocol

- Report issues in a table with columns: ID, File, Lines, Issue
- No editorializing
- Fix only with user approval

## Ordering

Sort identifiers lexicographically at all levels, declarations in this order:

1. Imports
2. Types
3. Constants
4. Variables
5. Functions
6. Components
7. Logic
8. Exports

## Imports

- Group in order of external, internal, and types
- Sort lexicographically by binding name, ordered side-effect, default, and named

## Style

- Concise, descriptive, and unabbreviated identifiers
- `const` for all non-reassigned variables
- Extract magic numbers to named constants
- `function` declarations, arrows only for inline callbacks
- Extract multi-statement inline handlers to named functions
- Hoist functions to module level when no component scope needed
- Deduplicate logic into utilities
- Prefer `async`/`await` over `.then()` chains
- Strict equality only
- Numeric separators for 4+ digits

## Formatting

- 4-space indentation
- Group independent declarations
- Guards always separate from declarations
- Single-line guards and returns may stay grouped
- Braces on all multi-line blocks
- Blank lines around blocks, returns, and between logical groups
- Inline conditionals when both branches fit on one line
- Alphabetize compound conditions
- Encode non-standard characters as HTML entities in JSX and Unicode in JS
- Delete dead code, logging, and comments

## Types

- Avoid explicit `any` and `!` assertions
- Derive types from existing types
- Type narrowing must carry into closures
- Annotate returns only for exports, hooks, and widening tuples
- Types before interfaces
- Alphabetize union members
- Shared types in `env.d.ts`

## Astro

- One `<script>` block per `.astro` file

## React

- Functional components except class for error boundaries
- Treat state and props as immutable
- `useEffect` placed after all declarations, before return
- `useEffect` cleanup for listeners, timers, and subscriptions
- Event handlers named `handle{EventName}` and colocated in their component
- Inline styles only for runtime-computed values
