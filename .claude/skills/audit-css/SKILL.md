---
description: Enforce CSS and Tailwind conventions
name: audit-css
user-invocable: true
---

- Audit `.css` files, `<style>` blocks in `.astro` files, and Tailwind classes in `.astro` and `.tsx` files
- Skip paths in `.gitignore`

## Protocol

- Report issues in a table with columns: ID, File, Lines, Issue
- No editorializing
- Fix only with user approval

## Theme

- All colors and fonts defined in `@theme`
- Tokens defined as 6- or 8-digit hex
- Reference via `var()`, no raw color values outside `@theme`
- `:root` for durations, dimensions, and layout constants
- WCAG AA contrast: 4.5:1 for text, 3:1 for UI
- Delete unused `@theme` and `:root` tokens

## Selectors

Sort declaration blocks lexicographically within each tier, pseudos follow their base selector:

1. `*`
2. Bare globals
3. Elements
4. Classes
5. Pseudo-classes
6. Pseudo-elements
7. Attributes
8. `@media`
9. `@keyframes`

## Properties

- Sort properties lexicographically
- No manual vendor prefixes
- `px` or `rem` for fixed measurements, one dialect per repo

## Naming

- BEM: `.block`, `.block__element`, `.block--modifier`
- Keyframes: `block__animation-name`
- Bare tag selectors only in global styles

## Layout

- Desktop-first, `max-width` exclusively
- Two breakpoints only: `768px` and `1024px`
- `@media` for layout changes only, `prefers-reduced-motion` the only non-width query
- `clamp()` for fluid sizing, targeting 320–1280px

## Spacing

- Padding for internal element spacing
- `margin-bottom` only for external element spacing
- `gap` for flex and grid children
- Consistent values across similar elements

## Interactivity

- Hover, active, and focus-visible states on all interactive elements
- Disabled controls dimmed via `:disabled`
- `cursor: pointer` on clickable non-link elements, `cursor: not-allowed` on disabled controls
- Consistent states across similar elements

## Motion

- `s` for all time values
- Explicit transition properties
- `:root` duration tokens, shared easing functions, decorative loops exempt

## Formatting

- 4-space indentation
- Single blank line between blocks
- `!important` only for `prefers-reduced-motion`
- Delete dead code and comments

## Tailwind

- Prefer Tailwind over custom CSS

Sort classes lexicographically within each tier:

1. Custom
2. State
3. Layout
4. Stacking
5. Sizing
6. Spacing
7. Borders
8. Typography
9. Colors
10. Effects
11. Interactions
12. Responsive

## Astro

- One `<style>` block per `.astro` file
