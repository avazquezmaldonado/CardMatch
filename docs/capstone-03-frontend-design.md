# Capstone Milestone 03 — Frontend Design (capstone-03)

## Official requirements (verification)
Before writing this document I will satisfy the following official requirements for capstone-03 according to the capstone template and rubric:

- Mockups (ASCII or markdown diagrams) showing the main screens and their layout.
- Screen flow (how users move between screens) and interactions.
- Component structure / component tree mapping UI pieces to code responsibilities.
- Controllers / views outline (what each view does and the data it needs).
- Minimal CSS/layout plan (Tailwind utility strategy or simple CSS classes).
- Deliverables list for the phase.

Verification: Each of these requirements is present as a clearly marked section below. This document contains mockups, screen flow, component list, controllers/views, and a CSS plan.

---

## Deliverables for this phase
- Mockups for Profile, Spending, Owned Cards, Recommendations, and Settings screens.
- Screen flow diagram and descriptions of interactions.
- Component tree and mapping to files in `frontend/`.
- Controllers/views outline and data requirements for each screen.
- Minimal CSS layout and Tailwind usage plan.

---

## Summary (what we produced)
- Page-level mockups (ASCII/markdown) showing layout and key UI controls.
- Screen flow and user journeys for core scenarios (get recommendations, save profile, mark owned cards).
- Component tree mapping to `frontend/src` and suggested file names.
- Controller/view responsibilities and sample data flows for each screen.
- Tailwind-based layout plan and accessibility notes.

---

## Full Detailed Content

### Mockups (ASCII / markdown)

1) Home / Dashboard (Profile + quick summary)

```
+-----------------------------------------------------------+
| CardMatch (logo)                 [Profile] [Spending] [Rec]|
+-----------------------------------------------------------+
| Profile Summary:  Credit: 740   Accounts(24m): 1         |
| [Edit Profile]  [Load Sample]  [Save Profile]            |
+-----------------------------------------------------------+
| Quick Actions: [Get Recommendations] [Export JSON]        |
+-----------------------------------------------------------+
| Recent Recommendations (summary)                          |
| - Best overall: Travel Explorer (+$123/yr)               |
| - Best groceries: GrocerPlus (5%)                        |
+-----------------------------------------------------------+
```

2) Profile Screen

```
+ Profile
| Name: [__________]
| Credit score: [720]   Accounts opened (24mo): [1]
| Owned cards: [x] GrocerPlus  [ ] Travel Explorer
| [Save profile]  [Back]
```

3) Spending Screen

```
+ Spending (monthly)
| Groceries: [ 400 ]  Dining: [ 200 ]  Travel: [ 100 ]
| Entertainment: [ 50 ]  Gas: [ 80 ]  Other: [ 0 ]
| [Calculate]  [Reset to sample]
```

4) Recommendations Screen

```
+ Recommendations
| Best by Category:
|  - Groceries: GrocerPlus (5%) — est $20/mo  $240/yr
|  - Dining: Dining Rewards (4%) — est $8/mo $96/yr
|
| Best overall combination (top 3):
| 1) GrocerPlus — $240/yr
| 2) Cash Everywhere — $150/yr
| 3) Travel Explorer — $120/yr
|
| [Apply Filters] [Export JSON] [Save as PDF]
```

5) Owned Cards / Settings

```
+ Owned Cards
| [x] Cash Everywhere
| [ ] Travel Explorer
| [ ] GrocerPlus
| [Save] [Back]
```


### Screen flow
Primary flows (happy path)
- Start -> Profile (enter credit score, accounts) -> Spending (enter monthly amounts) -> Recommendations -> Review/Export
- From Recommendations user can mark a card as owned, re-run recommendations, or apply filters.

Secondary flows
- Start -> Load Sample -> Quick Recommendations
- Profile -> Save -> LocalStorage / Backend (optional) -> Confirmation

State management
- Local short-term state (in-memory JS objects) for edits.
- Saved state persisted to localStorage or a JSON file via a backend endpoint if implemented.

Navigation notes
- Use a simple top nav or stepper to move between Profile -> Spending -> Recommendations.
- Keep actions prominent (primary CTA: "Get Recommendations").


### Component structure
Mapping UI pieces to components (vanilla JS or React; this design assumes lightweight React-like components naming but is implementable with plain JS modules):

- App (root)
  - NavBar (logo + nav links)
  - ProfileView (`frontend/src/views/ProfileView.js`)
  - SpendingView (`frontend/src/views/SpendingView.js`)
  - OwnedCardsView (`frontend/src/views/OwnedCardsView.js`)
  - RecommendationsView (`frontend/src/views/RecommendationsView.js`)
  - Shared components:
    - InputNumber (reusable numeric input)
    - CardList (renders list of card items)
    - Spinner / Loading
    - Modal (for details / exporting)

File mapping suggestion (simple):
- `frontend/index.html` (shell)
- `frontend/src/main.js` (router + boot)
- `frontend/src/views/ProfileView.js`
- `frontend/src/views/SpendingView.js`
- `frontend/src/views/RecommendationsView.js`
- `frontend/src/components/CardList.js`
- `frontend/src/components/InputNumber.js`


### Controllers / Views outline
What each view does, what data it needs, and which backend endpoints it uses.

ProfileView
- Purpose: collect creditScore, accountsOpened24, name, ownedCards
- Data required: user profile (optional default)
- Actions: Save profile (local), Set owned cards (toggle)
- Backend calls: optional `POST /api/profiles` if server-side save is implemented

SpendingView
- Purpose: collect monthly spending amounts per category
- Data required: categories list (hard-coded or derived from cards.json)
- Actions: Calculate -> call Recommendations
- Backend calls: none (frontend can call `/api/cards/recommend` directly with profile+spending)

RecommendationsView
- Purpose: display scored cards, best-by-category, bestOverall
- Data required: response from `POST /api/cards/recommend`
- Actions: Export JSON, Mark card as owned, Apply filters
- Backend calls: `POST /api/cards/recommend`

OwnedCardsView
- Purpose: list and toggle owned cards
- Data required: card catalog (`GET /api/cards`) and user profile ownedCards
- Actions: Toggle owned status and save to profile
- Backend calls: `GET /api/cards` (optional `POST /api/profiles`)

Shared components responsibilities
- InputNumber: validate numeric input, min=0
- CardList: accept list of cards and render rates and estimates; handle click events (toggle owned, view details)


### Minimal CSS layout plan (Tailwind)
Design decisions
- Use Tailwind CDN for quick utility-first styling (already used in `frontend/index.html`).
- Keep layout responsive: use Tailwind grid/flex utilities.
- Accessibility: ensure form inputs have labels, provide sufficient color contrast, and keyboard focus states.

Key utility classes and layout plan
- Container: `max-w-4xl mx-auto p-6` (used in index.html)
- Card containers: `bg-white p-4 rounded shadow` for distinct panels.
- Buttons: Primary `bg-indigo-600 text-white px-4 py-2 rounded`, Secondary `bg-gray-200`.
- Grid for spending: `grid grid-cols-3 gap-2` (falls back to single column on small screens).

Styling notes
- Avoid custom CSS where Tailwind utilities can be used; keep a small `styles.css` for variables if needed.
- If more complex layout is desired, add a tiny CSS file with max 100 lines to centralize tweaks.


### Accessibility & UX notes
- Inputs must have `aria-label` or associated `<label>`.
- Buttons must be keyboard-focusable and have visible focus outlines.
- Use clear error messages for validation with `role="alert"` for screen readers.


### Tests (UI test plan)
Basic manual test cases (to include in milestone 06 later):
- Enter valid profile and spending -> get recommendations -> results show expected numeric fields.
- Enter invalid credit score (non-number) -> form shows validation error.
- Toggle owned card -> recommendations update to mark owned cards.

Automated test plan (future)
- Snapshot tests for main views (if using a testing framework like Jest + jsdom or Cypress for E2E).


## Evidence / Artifacts (links to repo files)
- `frontend/index.html` — current static UI shell
- `frontend/src/main.js` — client logic and recommendations call
- `frontend/src/*` — suggested structure (to add as files during implementation)


## Notes & Risks
- Keep the UI minimal to deliver the core flows; avoid over-engineering with frameworks unless comfortable.
- If using plain JS, organize components as modules to keep code maintainable.
- Tailwind CDN is used for convenience; if building production, configure a proper build to purge unused CSS.


## Verification checklist
- Mockups: included in the Mockups section.
- Screen flow: included in Screen flow and Sequence descriptions.
- Component tree: included in Component structure.
- Controllers/views: included in Controllers / Views outline.
- CSS/layout plan: included in Minimal CSS layout plan.


---

End of capstone-03 frontend design document.
