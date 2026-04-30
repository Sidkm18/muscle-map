## 2026-04-23 - Dynamic ARIA labels for stateful buttons
**Learning:** When a button toggles state by changing its text content (e.g., 'Show' to 'Hide' for password fields), screen readers need corresponding updates. A static `aria-label` becomes incorrect after the state changes.
**Action:** When implementing text-toggling buttons, always attach an event listener to dynamically update the `aria-label` to match the new visible state (e.g., switching between 'Show password' and 'Hide password').
