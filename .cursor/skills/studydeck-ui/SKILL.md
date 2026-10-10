---
name: studydeck-ui
description: Apply StudyDeck UI/UX rules when creating or editing React pages, components, forms, responsive layouts, themes, navigation, or interaction states.
---

# StudyDeck UI/UX

Use this skill before changing any user-facing interface.

## Product direction

StudyDeck is an offline-first flashcard app with a clear neo-brutalist visual language. Keep the interface practical, readable, and easy to use on touch screens.

## Required rules

1. Reuse the existing visual tokens and primitives: `brutal-card`, `brutal-btn`, `brutal-input`, `--bg-page`, `--bg-card`, `--text-main`, and the existing accent colors.
2. Use mobile-first responsive layouts. Check narrow mobile, tablet, and desktop widths; do not let cards, search controls, tables, or modals overflow horizontally.
3. Make interactive controls keyboard accessible. Use semantic `button`, `a`, `input`, `label`, and `dialog` patterns; add an accessible label to icon-only buttons and keep visible focus states.
4. Keep touch targets comfortable on mobile. Important buttons and icon actions should be at least 44px when practical.
5. Use `useTranslation()` for user-facing copy. Add Thai translations when adding new English UI text.
6. Preserve the active theme. New surfaces must work in `brutalist-light`, `brutalist-high-contrast`, and `brutalist-dark`.
7. Provide clear loading, empty, success, error, hover, active, disabled, and focus states. Put an error next to the action or field that caused it.
8. Prefer short, descriptive labels and one clear primary action per empty state. Use `text-balance`, `text-pretty`, `truncate`, or `line-clamp` where dense content needs control.
9. Respect `prefers-reduced-motion`. Use motion only when it improves feedback, and animate transform/opacity rather than layout dimensions.

## Do not

- Do not introduce gradients, glow effects, a second design system, or a new UI library without explicit approval.
- Do not use `h-screen` for full-height layouts; prefer `min-h-dvh`.
- Do not make a clickable `div` when a semantic button or link is appropriate.
- Do not remove Offline Mode, IndexedDB persistence, responsive behavior, or existing navigation while polishing the UI.
- Do not add placeholder UI that looks complete but has no working action.

## UI workflow

1. Inspect the existing component and its parent layout before editing.
2. Identify the smallest reusable component or style change that solves the issue.
3. Implement the change without changing unrelated business logic.
4. Check keyboard focus, touch sizing, theme contrast, and mobile overflow.
5. Run `npm run build` and `npm test -- --run` before reporting completion.
