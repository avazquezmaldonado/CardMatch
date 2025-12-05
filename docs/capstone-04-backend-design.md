# Capstone Milestone 04 — Backend Design (capstone-04)

## Official requirements (verification)
This document will satisfy the following official requirements for capstone-04:

- Node/Express folder structure and files mapping.
- REST API routes, HTTP methods, request/response shapes, and example requests.
- Controllers and services responsibilities and interfaces.
- How the backend connects to the data layer (JSON file or SQLite).
- Deliverables list for the phase.

Verification: Each requirement is addressed below with concrete examples and mapping to the repository files.

---

## Deliverables for this phase
- Express app structure and recommended file layout.
- Full list of API endpoints with example HTTP requests and expected responses.
- Controller/service separation and responsibilities.
- Data layer integration plan (JSON now; SQLite migration path).
- Security and validation notes.

---

## Summary (what we produced)
- A clear backend folder layout matching the current scaffold in `backend/`.
- API spec for card listing, card detail, recommendation computation, and optional profile CRUD.
- Controllers and services description, with function signatures and error handling guidance.
- Data layer plan explaining JSON file usage and steps to migrate to SQLite.

---

## Full Detailed Content

### Folder structure (Node + Express)
This maps to the current repository layout and recommended expansions.

```
backend/
  app.js                # Express entrypoint
  package.json
  routes/
    cards.js
    profiles.js         # optional
  controllers/
    cardsController.js
    profilesController.js
  services/
    dataStore.js        # JSON read/write abstraction
    rewardsService.js
    profileService.js   # optional
  middleware/
    validate.js         # request validation helpers
  tests/
    rewardsService.test.js
  config/
    db.js               # sqlite connection (optional)
```

Notes:
- Keep `data/` in the repo root for simple JSON file storage. See `backend/services/dataStore.js`.
- Add `middleware/validate.js` to centralize input validation (e.g., using AJV or manual checks).


### API routes & HTTP examples
Base path: `/api`

1) GET /api/cards
- Description: Return full card catalog.
- Response 200: JSON array of card objects.

Example request
GET http://localhost:4000/api/cards

Example response
200 OK
[
  { "id": "c1", "name": "GrocerPlus", "minCreditScore": 680, "rewards": {"groceries": 5, "default": 1} },
  ...
]

2) GET /api/cards/:id
- Description: Return a single card by id.
- Response 200: card object or 404 if not found.

Example request
GET http://localhost:4000/api/cards/c1

Example response
200 OK
{ "id": "c1", "name": "GrocerPlus", ... }

3) POST /api/cards/recommend
- Description: Compute recommendations for a profile and spending.
- Request body (application/json):
{
  "profile": { "creditScore": 720, "accountsOpened24": 1, "ownedCards": ["c4"] },
  "spending": { "groceries": 400, "dining": 200 },
  "ownedCards": ["c4"]
}
- Response 200: { scored, bestByCategory, bestOverall }
- Response 400: validation error

Example request
POST http://localhost:4000/api/cards/recommend
Content-Type: application/json
{ ... }

Example response
200 OK
{
  "scored": [ { "id": "c1", "name": "GrocerPlus", "estimates": { "monthly": 20, "annual": 240 }, "owned": false }, ... ],
  "bestByCategory": { "groceries": { "id":"c1", "rate": 5 } },
  "bestOverall": [...]
}

4) Optional: Profiles CRUD
- GET /api/profiles/:id — get saved profile
- POST /api/profiles — create/update profile (writes to JSON or DB)


### Controllers & Services
Separation of concerns
- Controllers: parse requests, call services, return HTTP responses.
- Services: pure business logic and data access.

CardsController (example functions)
- listCards(req, res)
- getCardById(req, res)
- recommend(req, res) -> calls rewardsService.recommendCards(cards, profile, spending)

RewardsService (pure functions)
- isEligible(card, profile) -> boolean
- estimateRewardsForCard(card, spending) -> { monthly, annual }
- recommendCards(cards, profile, spending, ownedCards) -> { scored, bestByCategory, bestOverall }

DataStore service
- readJson(filename) -> object
- writeJson(filename, object) -> void
- (Optional) switch to SQLite by replacing readJson/writeJson with DB queries in `services/dataStore.js`.

Example controller flow (recommend)
- Validate body
- const cards = await dataStore.readJson('cards.json')
- const rec = rewardsService.recommendCards(cards, profile, spending, ownedCards)
- res.json(rec)

Error handling
- Use try/catch in controllers, log errors, return 500 with a sanitized message.
- Return 400 for validation errors with a helpful JSON error shape: { error: 'Validation failed', details: [...] }


### Data layer & persistence
Current approach: JSON files in `/data`
- Pros: zero-dependency, simple to inspect and modify, easy for demo and grading
- Cons: not concurrent-safe, not efficient for large datasets

Migration to SQLite (optional) — steps:
1. Add `sqlite3` or `better-sqlite3` to `backend/package.json`.
2. Create `backend/config/db.js` to open a connection and expose query helpers.
3. Create migration script to import `data/cards.json` into `cards` table.
4. Replace `dataStore.readJson('cards.json')` with `db.query('SELECT * FROM cards')`.
5. Add simple transactions for profile CRUD.

Suggested schema for cards table (simplified)
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  minCreditScore INTEGER,
  rewards JSON
);


### Validation & Security notes
- Validate all incoming JSON payloads. Use AJV for JSON schema validation or explicit checks in `middleware/validate.js`.
- Do not allow path traversal when reading files; use path.join with a whitelist of allowed filenames.
- In production, enable CORS restrictions and consider rate limiting.


### Unit tests
- Add tests for `rewardsService` in `backend/tests/rewardsService.test.js` using node's assert or Jest.
- Test cases:
  - Simple reward calculation (single category)
  - Multiple categories sum
  - Eligibility filters for credit score and accountsOpened24


### Dev tools & scripts
- `npm start` — run server
- `npm test` — run tests (if configured)


## Evidence / Artifacts
- `backend/app.js` — entrypoint
- `backend/routes/cards.js` — route definitions
- `backend/controllers/cardsController.js` — controllers
- `backend/services/rewardsService.js` — recommendation logic
- `backend/services/dataStore.js` — JSON read/write
- `data/cards.json` — sample cards data


## Notes & Risks
- JSON file store is adequate for this project phase, but for concurrency or multi-user scenarios, migrate to SQLite.
- Keep auth out of scope for the initial milestones; add later if necessary.


## Verification checklist
- Folder structure: described and mapped to repository files.
- API endpoints: listed with request/response examples.
- Controllers/services: responsibilities described with signatures.
- Data layer: JSON usage described and migration steps to SQLite provided.


---

End of capstone-04 backend design document.
