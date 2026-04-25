---
description: Enforce web project standards across all categories
name: audit-web
user-invocable: true
---

Audit the web project against the checklist below.
Skip paths in `.gitignore`.

## Code Quality

1. TypeScript strict mode with zero type errors
2. ESLint passing with zero errors
3. No unsafe type casts or type holes
4. No dead code or unused dependencies
5. No `console.log` or `debugger` in production
6. HTML valid with no parsing errors
7. Path aliases configured for imports

## Security

1. Secrets excluded from version control and client bundles
2. Input validation and sanitization on all user data
3. XSS prevention with output encoding and CSP headers
4. CSRF protection on state-changing requests
5. Security headers: X-Frame-Options, Referrer-Policy, HSTS
6. Dependency vulnerabilities scanned
7. Rate limiting on API endpoints

## Accessibility

1. Semantic HTML with logical heading hierarchy
2. Keyboard navigation with visible focus indicators
3. Color contrast meets WCAG AA: 4.5:1 for text, 3:1 for UI
4. Images have descriptive alt text or are marked decorative
5. Form inputs have associated labels and error announcements
6. ARIA labels and roles on elements without visible text
7. No information conveyed by color alone
8. Decorative elements hidden from assistive technology
9. Reduced motion respected via `prefers-reduced-motion`
10. Page functional at 200% zoom
11. Skip link to bypass navigation

## Performance

1. Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
2. Lighthouse performance score 90+ on mobile
3. No render-blocking resources in critical path
4. JavaScript bundle minimized with tree shaking and code splitting
5. Images optimized: modern formats, srcset, lazy loading, dimensions set
6. Critical CSS inlined, non-critical deferred
7. Fonts preloaded with font-display swap
8. Assets compressed and cached
9. Third-party scripts async or deferred
10. No unused dependencies in production bundle
11. HTTP requests minimized and batched
12. Preconnect hints for third-party origins

## Testing

1. All tests passing in CI before merge
2. E2E tests cover critical user flows
3. Unit tests cover critical functions and utilities
4. Integration tests verify module interactions
5. Accessibility tests automated

## Error Handling

1. Error boundaries catch component failures
2. 404 and error pages styled and helpful
3. API errors show user-friendly messages
4. Graceful degradation when features unavailable
5. Network failures trigger retry logic
6. Fallback UI for failed component loads
7. Errors logged to monitoring service

## Responsiveness

1. No horizontal scroll at any viewport
2. Mobile layout functional from 320px
3. Navigation adapts per breakpoint
4. Touch targets minimum 44x44px
5. Typography scales with readable line lengths
6. Large screens capped with max-width container
7. Tables scroll or stack on mobile

## Visuals

1. Typography hierarchy consistent
2. Hover and focus states visible on all interactive elements
3. Transitions and animations use shared durations and easing
4. Spacing uses design tokens
5. UI components visually consistent across pages
6. Icons consistent in style and sizing
7. Loading and skeleton states for async content
8. Empty and error states designed
9. Visual alignment follows grid rhythm

## Interactivity

1. Interactive elements respond immediately
2. Focus trapped in modals and restored on close
3. Disabled states prevent interaction and appear muted
4. Form inputs validate inline with error messages
5. Scroll behavior smooth with anchor offsets
6. Double-submit prevented on forms

## SEO

1. Meta title and description unique per page
2. Canonical URLs prevent duplicate content
3. Open Graph tags for social sharing
4. Structured data with JSON-LD
5. Descriptive URL structure
6. XML sitemap submitted and updated
7. Robots.txt configured
8. Favicon in multiple formats

## Project Structure

1. Folder structure with separation of concerns
2. File naming convention consistent throughout
3. .gitignore excludes build artifacts and dependencies
4. Package.json scripts documented
5. README with setup and usage instructions
6. Environment example file provided

## Compatibility

1. Cross-browser: Chrome, Firefox, Safari, Edge
2. Mobile: iOS and Android
3. Input methods: mouse, touch, keyboard
4. Progressive enhancement without JS
5. High DPI display support

## Content

1. All links functional
2. No placeholder text or dummy data
3. Spelling, grammar, and punctuation correct
4. Dates and numbers formatted for locale

## DevOps

1. CI/CD pipeline passes all checks before deploy
2. Monitoring and alerting for errors
3. Environment variables configured per deploy context
4. Staging environment mirrors production
5. Smoke tests run post-deploy
6. Rollback mechanism tested
7. Logs aggregated and searchable

## Legal

1. Privacy policy present and linked
2. Cookie consent with opt-in controls
3. Third-party tracking disclosed
4. Copyright notice current
5. Licensed assets attributed

## Rules

- Only report files with issues
- Report issues in a table with columns: File, Lines, Issue
- Report only. No recommendations, no editorializing, no offering to fix.
- Get user approval before making any fixes
- No logic changes. Report and flag only.
- Run `bun run lint` after all changes are applied
