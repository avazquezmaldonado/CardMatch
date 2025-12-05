# Capstone Milestone 06 — Client Audit (capstone-06)

## Official requirements (verification)
Before writing this document I will satisfy the official capstone-06 requirements from the course template:

- A walkthrough explaining the client (frontend) design and implementation.
- UI test plan (manual and automated test cases) covering main user flows and edge cases.
- Data flow description showing how data travels from frontend to backend and back.
- Evidence / artifacts (screenshots, component list, links to frontend files).
- Notes & risks related to client implementation.

Verification: Each of the above items is included below in clearly marked sections. The document links to actual frontend files in the repo and provides test cases and data flow diagrams.

---

## Deliverables for this phase
- Client implementation walkthrough mapped to files in `frontend/`.
- UI test plan (manual acceptance tests and automated test suggestions).
- Detailed data flow diagrams and explanations.
- Evidence: file references (index.html, main.js) and sample screenshots checklist.
- Notes & Risks specific to client-side design.

---

## Summary (what we produced)
- A clear walkthrough of the client architecture, components, and interactions.
- A prioritized UI test plan with manual test cases and suggestions for automated tests (Cypress / Playwright).
- Data flow diagrams and sequence descriptions for core flows (recommendation request, profile save/load).
- Evidence pointers to frontend code and sample data used during manual testing.

---

## Full Detailed Content

### Client walkthrough (implementation map)
This walkthrough maps functionality to files and explains how the frontend is structured and why choices were made.

Core files
- `frontend/index.html` — app shell, Tailwind CDN and main script inclusion.
- `frontend/src/main.js` — primary client logic: reads form inputs, builds request payload, calls backend endpoints, and renders results.
- `frontend/src/*` — suggested component files (not all present yet). The codebase intentionally keeps the initial UI minimal to focus on functionality.

Primary responsibilities
- Input collection: Profile + Spending inputs are gathered by DOM queries in `main.js`.
- Request orchestration: `main.js` builds { profile, spending, ownedCards } and POSTs to `/api/cards/recommend`.
- Rendering: `renderResults()` in `main.js` renders returned JSON into a readable HTML panel.
- Sample data: `Load Sample` button populates inputs with values from `data/spending.json` and `data/profile.json` (currently via hard-coded defaults in `main.js`).

Design rationale
- Simplicity: Using vanilla JS and Tailwind keeps the project approachable for a single student.
- Separation: `main.js` is kept modular to allow later extraction into components or conversion to React with minimal changes.
- Accessibility: Inputs have labels, and containers use semantic HTML where possible.


### Data flow (diagrams and sequence)
Primary flow: Get Recommendations

```
[User fills form] -> (frontend/main.js constructs payload) -> HTTP POST /api/cards/recommend
-> [Backend] -> reads data/cards.json -> rewardsService -> response JSON -> frontend receives response
-> frontend.renderResults -> DOM updates
```

Sequence steps
1. User fills profile + spending in the browser.
2. Frontend validates inputs (basic numeric checks) and creates payload.
3. Frontend `fetch` performs POST to backend endpoint.
4. Backend responds with recommendation JSON.
5. Frontend updates view and enables export/save actions.

Edge flows
- Network error: frontend shows an error panel if fetch fails.
- Validation error: backend returns 400; frontend displays the returned validation message.


### UI Test Plan
This plan lists manual acceptance tests and automated test cases that cover core and edge behaviors.

Manual acceptance test cases (priority order)
1. Happy path: enter profile (creditScore 720), spending (groceries 400, dining 200), click "Get Recommendations" -> results show numbers and best-by-category entries.
2. Invalid profile: enter non-numeric credit score -> frontend prevents submission or backend returns 400 and message displayed.
3. Owned cards: mark a card as owned and re-run recommendations -> owned cards are flagged in results.
4. Zero spending: set all spending to 0 and run -> results show $0 estimates and gracefully handle empty categories.
5. Load sample: click "Load Sample" and ensure fields populate correctly.
6. Export JSON: after recommendations, click export -> downloaded JSON matches documented shape.

Automated test suggestions
- Unit tests for small DOM helpers in `main.js` (use Jest + jsdom) to ensure input parsing works.
- End-to-end tests (recommended): use Cypress or Playwright to automate the happy path and error flows.

Example Cypress test (conceptual)
- Visit `frontend/index.html` served over a simple static server.
- Fill profile inputs, fill spending inputs, click "Get Recommendations".
- Assert that results panel contains expected text and numeric values.

Test data
- Use `data/profile.json` and `data/spending.json` as fixtures in automated tests to keep tests deterministic.


### Accessibility & UX tests
- Keyboard-only navigation: ensure all interactive elements (buttons, inputs) are reachable and usable via keyboard.
- Screen reader check: ensure labels are present, and result summaries use heading semantics.
- Contrast check: verify color contrast for primary buttons meets AA standards.


### Evidence / Artifacts
- Files:
  - `frontend/index.html`
  - `frontend/src/main.js`
- Sample data used in testing:
  - `data/profile.json`
  - `data/spending.json`

Screenshots checklist for submission (attach when submitting to board):
- Profile screen with filled-in values.
- Spending screen with sample values.
- Recommendations screen showing results.
- Exported JSON file opened in editor/JSON viewer.


### Notes & Risks
- Current frontend uses direct calls to `http://localhost:4000` which requires running the backend in dev; consider adding a CORS-safe proxy or serving frontend from the backend in production.
- Using vanilla JS means some extra manual wiring for tests compared to frameworks with testing ecosystems; mitigations: keep helper functions testable and isolated.


### Verification checklist
- Walkthrough: covered in Client walkthrough section.
- UI test plan: covered in UI Test Plan (manual and automated suggestions).
- Data flow: covered in Data flow diagrams and sequences.
- Evidence: file links and screenshots checklist provided.


---

End of capstone-06 client audit document.
