---
description: "Use when writing or editing Playwright end-to-end tests or page objects under e2e/. Covers locators and structure."
applyTo: "e2e/**"
---
# Playwright e2e standards

- Page objects live in `e2e/pages/`, specs in `e2e/tests/`.
- Use role-based locators only: `getByRole`, `getByLabel`. Never CSS or XPath selectors.
- Sign in with the demo accounts from `AGENTS.md`. No other credentials.
- Run: `cd e2e && npm install && npx playwright install chromium && npm test`. Dependency installs need human approval.
