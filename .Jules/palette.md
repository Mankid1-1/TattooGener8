## 2024-05-23 - Tooltip Accessibility
**Learning:** Custom Tooltip components often don't propagate ARIA attributes to their children. Wrapping an icon-only button in a Tooltip doesn't automatically give it an accessible name.
**Action:** Always verify if the Tooltip component applies `aria-label` or `aria-describedby` to the trigger. If not, explicitly add `aria-label` to the button element itself, even if a visual tooltip is present.
