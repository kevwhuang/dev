---
description: Enforce web project standards
name: audit-web
user-invocable: true
---

- Audit all project files
- Skip paths in `.gitignore`
- Use Playwright for runtime checks

## Protocol

- Report issues in a table with columns: ID, File, Lines, Issue
- No editorializing
- Fix only with user approval

## Security

- Secrets excluded from source and client bundles
- Security headers configured
- Output encoded to prevent XSS
- CORS restricted to allowed origins
- User input validated and sanitized
- Rate limiting on API endpoints

## Accessibility

- Keyboard navigable with visible focus indicators
- Form inputs labeled, errors linked via `aria-describedby`
- Descriptive page titles
- Functional at 200% zoom

## Content

- Spelling, grammar, and punctuation correct
- No placeholder text or dummy data
- All links functional
- Unique and descriptive headings

## Visuals

- UI consistent across pages
- Spacing from design tokens
- Typography hierarchy maintained
- Icons match in style and sizing
- Loading and skeleton states for async content

## Interactivity

- Forms validate on submit with inline error messages
- Focus trapped in modals and restored on close
- No duplicate submissions or broken state from rapid repeated clicks
- Smooth scroll with anchor offsets

## Responsiveness

- Layout and navigation adapt across mobile, tablet, and desktop
- No horizontal scroll at any viewport
- Max-width container on large screens
- Typography scales with readable line lengths
- Images use `srcset` for responsive sizing
- Touch targets minimum 48×48px

## Compatibility

- Browsers: Chrome, Firefox, Safari, and Edge
- Mobile: iOS and Android
- Inputs: mouse, touch, and keyboard
