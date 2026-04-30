## 2026-04-23 - Dynamic ARIA labels for stateful buttons
**Learning:** When a button toggles state by changing its text content (e.g., 'Show' to 'Hide' for password fields), screen readers need corresponding updates. A static `aria-label` becomes incorrect after the state changes.
**Action:** When implementing text-toggling buttons, always attach an event listener to dynamically update the `aria-label` to match the new visible state (e.g., switching between 'Show password' and 'Hide password').

## 2026-04-26 - Adding ARIA labels to password toggle buttons
**Learning:** Password visibility toggle buttons that just say "Show" or "Hide" lack context for screen reader users when navigating outside the form context or jumping between form elements. This can be especially confusing when there are multiple inputs.
**Action:** Always ensure toggle buttons acting on specific inputs (like password visibility toggles) contain an explicit, descriptive `aria-label` (e.g. "Toggle password visibility") so that the intent is clear regardless of the current visual text.
