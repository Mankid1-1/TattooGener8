## 2024-05-23 - Skip Link & Aria Current
**Learning:** Adding a "Skip to content" link is a high-impact, low-effort accessibility win for keyboard users, especially on pages with sticky headers.
**Action:** Always include a hidden, focusable `<a>` tag at the start of the `<body>` or root component that links to `#main-content` (ensure the target has `tabIndex={-1}` for focus management).
**Learning:** Navigation buttons should use `aria-current="page"` to indicate the active state, rather than just relying on visual styling (like background color). This provides essential context to screen reader users.
