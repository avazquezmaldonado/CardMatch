# Capstone Milestone 02 — Planning & Specification (capstone-02)

## Official requirements (from the CSCI 4208 portfolio template)
Before writing this document I will satisfy the following official requirements for capstone-02:

- User stories covering the feature set and primary workflows.
- Acceptance criteria (clear pass/fail criteria) for user stories or features.
- Feature breakdown mapped to frontend, backend, and data responsibilities.
- System behavior outline (how the components interact; request/response flow).
- Risk assessment & feasibility notes (technical and project risks).
- Deliverables list for this phase.
- Evidence / Artifacts with links to repo files produced so far.

Verification: Each of the above items is addressed in this document in the sections below. This document follows the pointer README template and the milestone rubric from the course guidance.

---

## Deliverables for this phase
- A complete planning and specification document covering user stories, acceptance criteria, and feature breakdown.
- System behavior outline (sequence/flow descriptions) showing how frontend, backend, and data interact.
- Risk & feasibility notes and a short implementation plan for the next milestone.
- Links to initial implementation artifacts in the team repo (frontend, backend, data samples).

---

## Summary (what we produced)
- Detailed user stories (8 core stories + extras) capturing the primary flows for CardMatch.
- Acceptance criteria for each core user story.
- A feature breakdown mapped to frontend, backend, and data responsibilities for implementation.
- System behavior outline including API endpoints and sequence flows.
- Risks, constraints, and a feasibility assessment including an implementation timeline for the next milestone.
- Evidence links pointing to the current repository artifacts (frontend scaffold, backend scaffold, sample data, and milestone-01 proposal).

---

## Full Detailed Content

### 1) User stories
Priority: Must have (M), Should have (S), Could have (C)

1. (M) As a user, I want to create/update my profile with my credit score and accounts opened in the last 24 months, so the system can determine card eligibility.
2. (M) As a user, I want to input my monthly spending by category (groceries, dining, travel, etc.) so the system can estimate rewards.
3. (M) As a user, I want the system to display eligible credit cards based on my credit score and 5/24 rule so I only see options I can realistically apply for.
4. (M) As a user, I want to see the best card for each spending category with estimated monthly and annual rewards so I can choose targeted cards.
5. (M) As a user, I want to see a recommended combination of cards (top N) that maximize total estimated rewards across my spending.
6. (S) As a user, I want to mark cards I already own and have them excluded from new-application recommendations.
7. (S) As a user, I want to save and load my profile locally for later reuse (JSON or a simple account) so I don't re-enter data.
8. (C) As a user, I want to export my recommendations as JSON or CSV for later analysis.
9. (C) As a user, I want to view a simple explanation of why each card was recommended (rate breakdown per category).
10. (S) As a user, I want basic filtering (min reward threshold, no annual fee) to narrow recommended cards.

Extras (developer-focused):
- As a developer, I want a small, well-documented dataset of cards with reward structures so I can test algorithms reproducibly.
- As a developer, I want to keep all logic local (no external APIs) to reduce complexity for the capstone.


### 2) Acceptance criteria
For each "Must have" story below are verifiable acceptance criteria.

1. Profile CRUD & eligibility inputs
   - Given the profile form, when the user enters a numeric credit score and accountsOpened24, then the backend accepts the data and responds 200.
   - Invalid inputs (non-numeric/negative) produce 4xx errors (400) with a helpful message.

2. Spending input
   - Given the spending form, when the user submits category amounts (numbers >= 0), backend returns estimated reward numbers and a 200 response.
   - Zero or missing categories are handled gracefully (treated as 0).

3. Eligibility filtering
   - Cards with minCreditScore above user score are excluded from recommendations.
   - If accountsOpened24 exceeds a card's 5/24 rule (if modeled), exclude card; else mark as ineligible.

4. Best-by-category
   - For each category with non-zero spending, the recommendation includes at least one card that provides the highest rate for that category (or the best available eligible card).

5. Best overall combination
   - The system returns a ranked list of N (default 3) cards sorted by estimated annual reward contribution.

6. Owned-cards handling
   - Cards the user marks as owned are flagged and can be excluded from the "apply for" recommendations.

7. Local persistence
   - Save/load uses local JSON (file or localStorage) and round-trips data without loss.

8. Exports
   - Exported JSON adheres to a documented shape (profile, spending, recommendations) and can be downloaded in the browser.

Non-functional acceptance criteria
- Backend server responds to core API calls within 500ms for simple test datasets on a student laptop.
- End-to-end flow (enter profile+spending -> get recommendations) completes without errors in a local environment.


### 3) Feature breakdown (frontend / backend / data)

Frontend responsibilities
- UI screens: Profile, Spending, Owned Cards, Recommendations, Settings (save/export).
- Input validation and UX: numeric validation, friendly error messages, and basic accessibility.
- Presentation: render best-by-category, per-card estimates, and best overall combination.
- Local persistence: save/load JSON and export.
- Fetch API client for backend endpoints defined below.

Backend responsibilities
- Provide REST API endpoints (see API section) to:
  - Read card catalog
  - Compute recommendations given profile & spending
  - CRUD for saved profiles (optional, file-based)
- Implement business logic:
  - Eligibility checks (credit score, 5/24)
  - Rewards computation (monthly/annual estimates)
- Data access layer: read/write JSON files or a simple SQLite DB (current implementation uses JSON files in `/data`).
- Validation: ensure incoming request shapes are validated and errors returned properly.

Data responsibilities
- Card catalog schema and sample dataset (see `/data/cards.json`).
- User profile and spending data shapes (see `/data/profile.json` and `/data/spending.json`).
- Provide sample data for testing and grading.


### 4) System behavior outline
This section describes request/response flows and component interactions.

Actors: Browser (frontend), Backend (Express), Data store (JSON files)

Primary flow: Recommendation request
1. User fills profile & spending in browser and clicks "Get Recommendations".
2. Frontend POSTs to `/api/cards/recommend` with body: { profile, spending, ownedCards }.
3. Backend validates payload. If invalid, returns 400 with details.
4. Backend reads `data/cards.json`, filters by eligibility, computes estimates using `rewardsService`, and returns JSON: { scored, bestByCategory, bestOverall }.
5. Frontend renders the response.

Secondary flows
- Card catalog listing: GET `/api/cards` returns the full card catalog.
- Card detail: GET `/api/cards/:id` returns detail for a single card.

API endpoints (summary)
- GET /api/cards — list all cards (used by frontend to show catalog)
- GET /api/cards/:id — get specific card
- POST /api/cards/recommend — compute recommendations; body: { profile, spending, ownedCards }

Sequence (ASCII)
Browser -> POST /api/cards/recommend -> Backend
Backend -> read data/cards.json -> Data store
Backend -> compute using rewardsService -> Backend
Backend -> respond JSON -> Browser -> render


### 5) Data shapes (brief)
- UserProfile
  - name?: string
  - creditScore: number
  - accountsOpened24: number
  - ownedCards: string[]

- UserSpending: { [category: string]: number }

- UserCard (card catalog):
  - id: string
  - name: string
  - minCreditScore?: number
  - rewards: { [category: string]: number } // percent cash back or points per dollar
  - five24Tag?: boolean // optional flag if a card is commonly impacted by 5/24

- RecommendedCard (returned by service):
  - id, name, estimates: { monthly, annual }, rateBreakdown?

(Full schema definitions and examples are produced in milestone 05.)


### 6) Risk & Feasibility notes
Risks
- Data complexity risk: Real card reward structures can be complex (rotating categories, caps, signup bonuses, points-to-cash conversions). For the capstone, we intentionally simplify to percent cashback per category.
- Eligibility complexity: The 5/24 rule is bank-specific and not universally enforceable; we model it simply as a number-of-accounts threshold and allow manual overrides.
- Time constraints: Implementing a polished UX and tests within a single student quarter requires prioritization; core features will be prioritized over extras (export, advanced filters).
- Deployment dependencies: If switching to SQLite, students must manage local installs; JSON keeps dependency minimal.

Feasibility & mitigations
- Keep reward model simple (percent cashback). This makes algorithms and estimates transparent and easy to test.
- Use file-based JSON storage to avoid DB setup in early milestones; provide migration notes to SQLite later.
- Limit UI to the main flows: profile, spending, recommendations. Additional features are optional or future work.


### 7) Implementation plan & timeline (next milestone: Frontend design)
Tasks for milestone 03 (Frontend Design)
- Create mockups and component tree for Profile, Spending, Recommendations pages.
- Create static HTML/CSS prototypes (Tailwind) and wire basic interactions to backend endpoints.
- Add client-side validation for forms.

Estimated timeline (single student)
- Days 1–2: Produce wireframes & component list, finalize data schema.
- Days 3–5: Implement static frontend screens and wire to backend endpoints.
- Day 6: Test end-to-end and iterate on presentation.


### 8) Evidence / Artifacts (links)
These artifacts were produced in the repo and are linked below (local paths):

- Project proposal (milestone 01): `docs/capstone-01.md`
- Frontend scaffold: `frontend/index.html`, `frontend/src/main.js`
- Backend scaffold: `backend/app.js`, `backend/routes/cards.js`, `backend/controllers/cardsController.js`, `backend/services/rewardsService.js`
- Data samples: `data/cards.json`, `data/profile.json`, `data/spending.json`

(Links above are file paths in this repository. For instructor review, provide full GitHub links from the team repo when submitting to the course board.)


### 9) Notes & Risks (summary)
- This milestone documents the plan and gives a prioritized feature list for the project.
- The simplified rewards model intentionally reduces scope to make implementation achievable by a single student within the term.
- If additional complexity is desired (signup bonuses, rotating categories), it should be scoped as an extension task in milestone 05+.


### 10) Review & grading flow
When this document is ready for review:
- Set Project board issue for `capstone-02` and attach links to this doc and relevant PR(s).
- Request peer-review via `peer-review-requested` label and gather feedback.
- After addressing feedback, set `ready-for-approval` for instructor review.


---

## Verification checklist (mapping of requirements to document sections)
- User stories: Covered in "1) User stories" (page above).
- Acceptance criteria: Covered in "2) Acceptance criteria".
- Feature breakdown: Covered in "3) Feature breakdown (frontend / backend / data)".
- System behavior outline: Covered in "4) System behavior outline" including endpoints and sequence.
- Risk & feasibility notes: Covered in "6) Risk & Feasibility notes" and "9) Notes & Risks".
- Deliverables: Covered in top-of-document "Deliverables for this phase" and the Summary section.


---

End of capstone-02 planning document.
