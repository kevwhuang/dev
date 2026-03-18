---
description: Enforce HTML and Astro markup conventions
user-invocable: true
---

Audit `.astro` and `.html` files.
Skip paths in `.gitignore`.

## Attributes

Sort attributes on every element in this order:

1. `id`
2. `class` or `class:list`
3. Remaining attributes lexicographically, case-sensitive, uppercase before lowercase

## Architecture

- Pages in `src/pages/` only load layout and section components. No direct markup.
- Sections in `src/sections/` contain the core frontend markup and logic.
- SVGs must be extracted into components in `src/components/` and imported. No inline SVGs in pages, sections, or layouts.

## Markup

- Semantic elements over `div`/`span`: `nav`, `main`, `section`, `article`, `header`, `footer`, `aside`
- No comments
- Self-closing void elements: `<img />`, `<input />`, `<br />`
- 4-space indentation
- No blank lines between elements

## Accessibility

- `alt` on all images
- All interactive elements focusable and operable via keyboard
- Color contrast meets WCAG AA: 4.5:1 for text, 3:1 for UI
- No skipped heading levels
- `aria-label` or `aria-labelledby` on elements without visible text
- ARIA roles and states on custom widgets
- `sr-only` text for icon-only controls
- `aria-hidden` on decorative elements

## Astro

- At most one `<style>` block and one `<script>` block per file
- Defer `<script>` content rules to audit-js and `<style>` content rules to audit-css

## Rules

- Only report files with issues
- Report issues in a table with columns: File, Lines, Issue
- Report only. No recommendations, no editorializing, no offering to fix.
- Get user approval before making any fixes
- No logic changes. Reorder attributes and fix markup only.
- Run `bun run lint` after all changes are applied
