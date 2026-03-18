---
description: Enforce CSS and Tailwind conventions
user-invocable: true
---

Audit `.css` files and `<style>` blocks in `.astro` files.
Skip paths in `.gitignore`.

## Property Order

Sort all properties lexicographically, case-sensitive, uppercase before lowercase. No blank lines between properties. Vendor prefixes last.

## Block Order

Sort declaration blocks by selector type in this precedence, then sort selectors lexicographically, case-sensitive, uppercase before lowercase. Follow the same precedence within nested rules.

1. **Element and `:root`**: `html`, `body`, `:root`
2. **Class**: `.block`, `.block__element`, `.block--modifier`
3. **Pseudo-class**: `.block:hover`, `.block:focus`, `.block:first-child`
4. **Pseudo-element**: `.block::before`, `.block::after`, `::-webkit-scrollbar`
5. **`:global()`**: `:global(pre)`, `:global(.line)`
6. **`@media` and `@keyframes`**: media queries first, keyframes last

## Naming

BEM convention: `.block`, `.block__element`, `.block--modifier`.
No bare tag selectors for custom styles. `:global()` scoped selectors are acceptable.

## Formatting

- No dead code: unused rules, unreachable selectors, redundant overrides
- No duplicate properties
- No deprecated properties
- No comments
- Minimize `@apply`. Prefer inline utilities.
- 4-space indentation
- Blank lines between `@keyframes` blocks

## Transitions

All transitions must use a shared set of durations and easing functions. Flag mismatched values.

## Interactive States

All interactive elements must have visible hover and focus states. States must match across similar elements.

## Responsiveness

No overflow, clipping, or broken layouts at any viewport.

## Tailwind Classes

Sort classes in this order. No duplicate classes. Prefer Tailwind over custom CSS.

1. **Custom/BEM**: `navbar`, `card__title`
2. **Group/state**: `group`, `peer`, `block`, `hidden`
3. **Position/layout**: `fixed`, `absolute`, `relative`, `flex`, `grid`, `items-*`, `justify-*`
4. **Stacking**: `z-*`
5. **Sizing**: `w-*`, `h-*`, `min-*`, `max-*`, `shrink-0`
6. **Spacing**: `p-*`, `px-*`, `py-*`, `m-*`, `gap-*`
7. **Borders**: `rounded-*`, `border`, `border-*`
8. **Typography**: `font-*`, `text-*` size, `uppercase`, `tracking-*`, `leading-*`
9. **Colors**: `bg-*`, `text-*` color, `placeholder-*`
10. **Effects**: `overflow-*`, `opacity-*`, `-translate-*`, `backdrop-blur-*`, `shadow-*`
11. **Interactions**: `transition-*`, `duration-*`, `outline-none`, `pointer-events-*`, `select-none`, `cursor-*`
12. **Responsive**: `sm:*`, `md:*`, `lg:*`

## Astro

- At most one `<style>` block per `.astro` file
- Define color theme tokens in `:root`. No hardcoded colors in component styles.

## Rules

- Only report files with issues
- Report issues in a table with columns: File, Lines, Issue
- Report only. No recommendations, no editorializing, no offering to fix.
- Get user approval before making any fixes
- No logic changes. Reorder and reformat only.
- Run `bun run lint` after all changes are applied
