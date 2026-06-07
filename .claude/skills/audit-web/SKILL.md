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

- Semantic HTML with logical heading hierarchy
- Alt text on all images or marked decorative
- ARIA labels on elements without visible text
- Keyboard navigable with visible focus indicators
- Form inputs labeled, errors linked via `aria-describedby`
- Decorative elements hidden from assistive technology
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
- Shared transition durations and easing
- Loading and skeleton states for async content

## Interactivity

- Hover, focus, active, and disabled states on all interactive elements
- Form inputs validate inline with error messages
- Focus trapped in modals and restored on close
- Rapid repeated clicks handled gracefully
- Smooth scroll with anchor offsets

## Responsiveness

- Layout and navigation adapt across mobile, tablet, and desktop
- No horizontal scroll at any viewport
- Max-width container on large screens
- Typography scales with readable line lengths
- Images use `srcset` for responsive sizing
- Touch targets minimum 48x48px

## Compatibility

- Browsers: Chrome, Firefox, Safari, and Edge
- Mobile: iOS and Android
- Inputs: mouse, touch, and keyboard
