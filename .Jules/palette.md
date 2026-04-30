## 2024-05-18 - [Accessibility] Password Toggle State
**Learning:** Screen reader users need explicit context for toggle buttons whose text changes ("Show" to "Hide"). Using `aria-pressed` alongside `aria-label` provides a consistent accessible name and communicates the toggle state clearly.
**Action:** Always include `aria-pressed` on stateful toggle buttons.
