# Capstone Milestone 05 — Data Design (capstone-05)

## Official requirements (verification)
This document will satisfy the following official requirements for capstone-05:

- Schema models for: UserProfile, UserSpending, UserCard, RecommendedCard.
- CRUD plan and example operations for each model.
- Database structure explanation (JSON file storage or SQLite) and justification.
- Example data records and how they map to schemas.
- Deliverables list for this phase.

Verification: Each requirement is covered below in dedicated sections. Full schema definitions, CRUD examples, and example JSON records are included.

---

## Deliverables for this phase
- Formal schema definitions (JSON Schema-like) for UserProfile, UserSpending, UserCard, RecommendedCard.
- CRUD endpoints and examples for each model.
- Database/storage plan (JSON now, migration notes to SQLite), and file/table layouts.
- Sample data entries for `cards.json`, `profile.json`, and `spending.json`.
- Notes on validation, constraints, and indexing (if using SQLite).

---

## Summary (what we produced)
- Detailed schemas for the four required models that support the app's features.
- Concrete CRUD plans and HTTP examples for model operations.
- Storage strategy and an optional migration path to SQLite.
- Example data entries under `/data` (already present in repo) and their explanation.

---

## Full Detailed Content

### Schema definitions
The schemas below use a JSON Schema-like notation for readability and can be adapted to AJV or actual DB schemas.

1) UserProfile
```
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "creditScore": { "type": "integer", "minimum": 300, "maximum": 850 },
    "accountsOpened24": { "type": "integer", "minimum": 0 },
    "ownedCards": { "type": "array", "items": { "type": "string" } },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["creditScore", "accountsOpened24"]
}
```

2) UserSpending
```
{
  "type": "object",
  "patternProperties": {
    "^[a-zA-Z0-9_ -]+$": { "type": "number", "minimum": 0 }
  },
  "additionalProperties": true
}
```
This allows dynamic categories (groceries, dining, travel, etc.).

3) UserCard (card catalog entry)
```
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "minCreditScore": { "type": "integer" },
    "five24": { "type": "boolean" },
    "annualFee": { "type": "number" },
    "rewards": { "type": "object" }
  },
  "required": ["id", "name", "rewards"]
}
```
`rewards` is a map of category -> percent cashback (number). A `default` key provides a fallback rate.

4) RecommendedCard (service output)
```
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "estimates": {
      "type": "object",
      "properties": { "monthly": { "type": "number" }, "annual": { "type": "number" } }
    },
    "owned": { "type": "boolean" },
    "rateBreakdown": { "type": "object" }
  }
}
```


### CRUD plan & API examples
The backend exposes model operations primarily via the cards endpoints and optional profiles endpoints. Below are example HTTP operations.

UserCard (card catalog)
- Read (list): GET `/api/cards` -> 200 JSON array
- Read (single): GET `/api/cards/:id` -> 200 or 404
- Create/Update: (admin-only or dev) POST `/api/cards` with card payload -> 201
- Delete: (admin-only) DELETE `/api/cards/:id` -> 204

UserProfile
- Create/Update (simple flow): POST `/api/profiles` body: UserProfile -> 200
- Read: GET `/api/profiles/:id` -> 200
- Delete: DELETE `/api/profiles/:id` -> 204
> Note: Profiles are optional for initial deliverable; saving to JSON is straightforward with `dataStore.writeJson('profiles.json', [...])`.

UserSpending
- Typically not stored server-side; included in recommendation POST body.
- Optional CRUD (if persisting): POST `/api/spending` -> save a named spending profile.

RecommendedCard
- Not a persisted model; produced by `POST /api/cards/recommend` as described in capstone-04.


### Data storage structure (JSON)
Files in `/data`:
- `cards.json` — array of UserCard entries.
- `profiles.json` — array of UserProfile entries (optional)
- `spending.json` — sample spending profiles (optional)

Example `cards.json` record (already in repo):
{
  "id": "c1",
  "name": "GrocerPlus Card",
  "minCreditScore": 680,
  "rewards": { "groceries": 5, "default": 1 }
}

If migrating to SQLite, suggested tables:
- cards (id TEXT PRIMARY KEY, name TEXT, minCreditScore INTEGER, annualFee REAL, rewards JSON)
- profiles (id TEXT PRIMARY KEY, name TEXT, creditScore INTEGER, accountsOpened24 INTEGER, ownedCards JSON, createdAt DATETIME)
- spending_profiles (id TEXT PRIMARY KEY, name TEXT, spending JSON)


### Example data & mapping
- `/data/cards.json` contains 4 sample cards with diversified rewards.
- `/data/profile.json` contains a sample profile for quick testing.
- `/data/spending.json` contains a sample monthly spending breakdown used by the frontend demo.

Mapping example: When user posts `profile` + `spending` to `/api/cards/recommend`, the server reads `cards.json`, applies eligibility rules from profile to filter cards, computes `estimates` for each card and returns `RecommendedCard` objects as output.


### Validation & constraints
- Use AJV with the JSON schemas above to validate incoming payloads for `/api/cards/recommend` and profile CRUD.
- Ensure numeric fields are within expected ranges (credit score 300–850, spending >= 0).
- When writing to files, perform atomic writes (write to temp file then rename) to avoid partial writes.


### Indexing & performance (SQLite notes)
- Index `cards.id` and `profiles.id` primary keys.
- For rewards queries, consider denormalizing frequently queried category rates or store category rates in JSON and filter in-app (small dataset).


### Backup & migrations
- Keep `data/*.json` under version control for reproducibility.
- For SQLite migration, provide a `scripts/import_cards.js` to read `cards.json` and insert rows into the DB.


## Evidence / Artifacts
- `data/cards.json` — file present in repo with sample data.
- `data/profile.json` — sample profile
- `data/spending.json` — sample spending
- `backend/services/dataStore.js` — reads/writes JSON files


## Notes & Risks
- JSON storage is easiest for this capstone. The main risk is concurrent write safety; mitigate by limiting writes or using SQLite for any multi-user needs.
- Ensure validation is added before accepting profile/spending data to avoid corrupt entries.


## Verification checklist
- Schemas: Provided for UserProfile, UserSpending, UserCard, RecommendedCard.
- CRUD plan: Provided with HTTP examples.
- Storage plan: JSON explanation and SQLite migration steps included.
- Example data: Provided and mapped to schemas.


---

End of capstone-05 data design document.
