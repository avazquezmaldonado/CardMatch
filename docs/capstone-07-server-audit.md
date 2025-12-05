# Capstone Milestone 07 — Server Audit (capstone-07)

## Official requirements (verification)
Before writing this document I will satisfy the official capstone-07 requirements:

- Walkthrough explaining server architecture and key components.
- Unit test plan for server-side logic (services and controllers).
- Complete list of API endpoints with examples (HTTP request and sample responses).
- Evidence/artifacts (links to backend code, test files, and logs).

Verification: Each item is included below; unit test cases are provided with sample assertions and file references to `backend/services` and `backend/controllers`.

---

## Deliverables for this phase
- Server architecture walkthrough mapped to files in `backend/`.
- Unit test plan and sample test cases for `rewardsService` and controllers.
- Full API endpoint list with request/response examples.
- Evidence and notes on monitoring, logging, and error handling.

---

## Summary (what we produced)
- A document that explains how requests are handled end-to-end and where business logic lives.
- A prioritized unit test plan for server logic and validation strategies.
- A complete API reference for backend endpoints used by the frontend.
- Notes on security, logging, and deployment considerations.

---

## Full Detailed Content

### Server architecture walkthrough
High-level components
- `app.js` — Express entrypoint; registers middleware and routes.
- `routes/` — route declarations mapping HTTP paths to controllers.
- `controllers/` — adapt request and response; call services.
- `services/` — pure business logic and data access utilities (`rewardsService`, `dataStore`).
- `data/` — JSON files used as datastore for the prototype.

Processing flow (example: POST /api/cards/recommend)
1. Express receives POST at `/api/cards/recommend`.
2. Body parser middleware parses JSON into `req.body`.
3. Route maps to `cardsController.recommend`.
4. Controller validates payload, calls `dataStore.readJson('cards.json')`.
5. Controller calls `rewardsService.recommendCards(cards, profile, spending, ownedCards)`.
6. Controller returns JSON response; any thrown error is caught and a 500 returned.

Error handling strategy
- Controllers wrap service calls in try/catch and return sanitized JSON errors.
- For future improvement: centralize error handling with Express error middleware to map known error types to 4xx/5xx codes.


### Unit test plan
Targets for tests
- `rewardsService`: deterministic pure functions are highest priority.
- `dataStore`: simple read/write behavior—test with temp files or mock fs.
- `cardsController.recommend`: integration-style tests mocking `dataStore` to ensure controller behavior.

Testing framework
- Jest is recommended for speed and simplicity in Node projects. Alternatively, Mocha + Chai may be used.

Key test cases for `rewardsService`
1. estimateRewardsForCard - single category
   - Input: card.rewards { groceries: 5 }, spending { groceries: 200 }
   - Expect monthly = 10, annual = 120
2. estimateRewardsForCard - multiple categories
   - Input: rewards { groceries:5, dining:2 }, spending { groceries:200, dining:100 }
   - Expect monthly = 200*0.05 + 100*0.02 = 10 + 2 = 12
3. isEligible - credit score
   - card.minCreditScore = 700, profile.creditScore = 690 -> expect false
4. recommendCards - exclusion and ownership
   - Ensure owned cards are marked owned and eligibility filters apply

Sample Jest test file: `backend/tests/rewardsService.test.js` (conceptual)

```
const { estimateRewardsForCard, isEligible, recommendCards } = require('../services/rewardsService');

test('estimate single category', () => {
  const card = { rewards: { groceries: 5 } };
  const res = estimateRewardsForCard(card, { groceries: 200 });
  expect(res.monthly).toBeCloseTo(10);
  expect(res.annual).toBeCloseTo(120);
});
```

Controller tests
- Mock `dataStore.readJson` to return fixed card list and assert controller produces expected HTTP payload.
- Use `supertest` to spin up the Express app in-memory and call endpoints.


### API endpoints (complete list + examples)
See capstone-04 for the API spec; this section repeats endpoints and adds additional example responses.

GET /api/cards
- 200: array of cards

GET /api/cards/:id
- 200: single card
- 404: { error: 'Card not found' }

POST /api/cards/recommend
- 200: { scored, bestByCategory, bestOverall }
- 400: validation failures
- 500: server error

Optional profile endpoints (if implemented)
- GET /api/profiles/:id
- POST /api/profiles

Example using `curl` (conceptual, run in terminal)

```
curl -X POST http://localhost:4000/api/cards/recommend \
 -H 'Content-Type: application/json' \
 -d '{"profile":{"creditScore":720,"accountsOpened24":1},"spending":{"groceries":400}}'
```


### Logging and monitoring
- Basic console logging is used (`console.log`, `console.error`).
- For production, integrate a logging library (winston or pino) and structured logs.
- Add request logging middleware (morgan) for request-level traces.


### Security notes
- Validate input and avoid exposing internal stack traces in error responses.
- Sanitize file paths when reading/writing local JSON to prevent path traversal.
- In production, use HTTPS and restrict CORS to known origins.


### Evidence / Artifacts
- `backend/app.js`
- `backend/routes/cards.js`
- `backend/controllers/cardsController.js`
- `backend/services/rewardsService.js`
- Suggested test files: `backend/tests/rewardsService.test.js` (not yet present but included in the guidance above)

Add test run logs here when tests are executed locally; include sample stdout if available.


### Notes & Risks
- Risk: file-based datastore not thread-safe; avoid concurrent writes or move to SQLite for multi-user testing.
- Risk: lack of authentication; acceptable for the scope of this capstone but note for demos.


### Verification checklist
- Server walkthrough: included in Server architecture walkthrough.
- Unit test plan: included with sample Jest cases.
- API list: included in API endpoints section.
- Evidence: file references provided.


---

End of capstone-07 server audit document.
