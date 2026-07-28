---
description: Enforce Astro and TSX markup conventions
name: audit-html
user-invocable: true
---

- Audit `.astro` and `.tsx` files
- Skip paths in `.gitignore`

## Protocol

- Report issues in a table with columns: ID, File, Lines, Issue
- No editorializing
- Fix only with user approval

## Architecture

- Pages in `src/pages/` only load layout and section components
- Sections in `src/sections/` contain the core frontend markup and logic
- Extract SVGs into components in `src/components/`

## Markup

- Semantic elements over `div`/`span`
- HTML entities for typographic glyphs
- One attribute per line when an element has both multiple attributes and children
- Self-close every childless element
- 4-space indentation
- Blank lines only between root-level elements
- Delete comments

## Attributes

Sort attributes in this order:

1. `id`
2. `class`, `class:list`, or `className`
3. Remaining attributes lexicographically

## Accessibility

- No skipped heading levels
- `alt` on all images
- `aria-label` or `aria-labelledby` on elements without visible text
- `aria-hidden` on decorative elements
