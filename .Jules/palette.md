## 2025-02-23 - Filter Button Accessibility
**Learning:** Custom "pill-style" filter buttons functioning as toggles in the exercise library require the `aria-pressed` attribute. Relying only on a visual `.active` class is insufficient for screen readers to recognize the currently selected filter.
**Action:** Use `aria-pressed="true"` for the active filter pill and `aria-pressed="false"` for siblings, ensuring both hardcoded HTML elements and dynamically rendered ones are updated properly.
