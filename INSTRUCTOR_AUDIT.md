# CardMatch – Instructor Audit Guide

## What to Review (Quick Map)
- **README.md** – project overview, run/test steps
- **docs/capstone-01.md … capstone-09-final-demo.md** – milestone evidence
- **backend/** – Express app, routes, services, validation, tests
  - `app.js`, `routes/cards.js`, `services/rewardsService.js`, `services/validator.js`
  - Tests: `backend/tests/rewardsService.test.js`
- **frontend/** – Single-page UI
  - `index.html`, `src/main.js`, `styles.css`
- **data/** – `cards.json` catalog (22 cards)
- **Scripts** – `run_tests.sh` (integration), `npm test` (unit)

## How to Run
1. **Install deps** (root): `npm install`
2. **Start backend**: `npm start` (port 4000)
3. **Open frontend**: open `frontend/index.html` (or any static server)

## How to Test
- **Unit (Jest)**: `npm test` → 12/12 passing
- **Integration (curl)**: `./run_tests.sh` → 9/9 passing
- Manual: submit valid/invalid forms; check 400s for bad input, recommendations for good input.

## Key Behaviors to Check
- **Validation**: creditScore 300–850; non-negative spending; required profile/spending; 400 on failures
- **Endpoints**:
  - `GET /api/cards` returns catalog
  - `GET /api/cards/:id` returns 404 on bad id
  - `POST /api/cards/recommend` returns bestByCategory + top 3
- **Scoring/Eligibility**: 5/24 rule, low-credit gating, student boost, ecosystem preference, travel frequency, rotating categories, transfer partners, reward preference multipliers
- **Features**: export recommendations (JSON), localStorage form persistence, sample data loader, responsive UI

## Evidence & Documentation
- Testing guide: `TESTING.md`
- Submission checklist: `FINAL_CHECKLIST.md`
- Implementation summary: `IMPLEMENTATION_SUMMARY.md`
- Portfolio pointer instructions: `PORTFOLIO_SUBMISSION.md`

## Known Limits
- JSON datastore (no DB), localhost-only, no auth/multi-user, localStorage per browser.

## Ready Status
- All capstone milestones completed
- 21/21 tests passing
- Error handling: 400/404/500 correct
- Project is ready for audit and submission.
