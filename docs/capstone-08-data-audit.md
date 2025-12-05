# Capstone Milestone 08 — Data Audit (capstone-08)

## Official requirements (verification)
Before writing this document I will satisfy the official capstone-08 requirements:

- Explanation of schema choices and how schemas map to project requirements.
- Sample queries and example CRUD operations (for JSON and optional SQLite).
- Data validation notes (how input is validated and what constraints exist).
- Evidence/artifacts and any migration/test scripts.

Verification: The sections below cover schema rationale, sample operations, validation, backups, and migration strategy to SQLite.

---

## Deliverables for this phase
- Schema explanation and rationale for UserProfile, UserSpending, UserCard, RecommendedCard.
- Example CRUD operations and sample queries for both JSON file store and SQLite (conceptual SQL statements).
- Data validation plan and JSON-schema snippets for AJV.
- Migration scripts outline and backup recommendations.

---

## Summary (what we produced)
- A clear explanation of why schemas are shaped as they are (flexible spending categories, JSON rewards map).
- Practical sample operations for maintaining `cards.json` and an example SQL schema and queries for SQLite migration.
- Validation rules, atomic write guidance, and backup recommendations.

---

## Full Detailed Content

### Schema rationale & mapping
Recap of models
- UserProfile: stores minimal user eligibility and owned-cards info. Kept small to protect privacy and simplify demo.
- UserSpending: flexible key/value map to support arbitrary categories without schema changes.
- UserCard: rich object with `rewards` map to handle per-category rates and a `default` fallback.
- RecommendedCard: output shape designed for easy rendering and export.

Why this shape?
- Flexibility: categories vary by user; storing spending as a map avoids rigid column schema changes.
- Simplicity: reward rates as numbers (percent) are easy to compute and test.
- Portability: JSON can be inspected directly, versioned in Git, and migrated to SQLite if needed.


### Sample queries & CRUD operations
JSON file store (how to perform common operations)
- Read all cards (node):
```js
const cards = await dataStore.readJson('cards.json');
```
- Find by id:
```js
const card = cards.find(c => c.id === 'c1');
```
- Add card (server-side dev action):
```js
cards.push(newCard);
await dataStore.writeJson('cards.json', cards);
```
- Update card:
```js
const idx = cards.findIndex(c => c.id === 'c1'); cards[idx] = updated; await writeJson(...)
```
- Atomic write guidance: write to `cards.json.tmp` and rename to `cards.json` once write completes.

SQLite examples (schema + queries)
- Table creation
```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  minCreditScore INTEGER,
  annualFee REAL,
  rewards JSON
);
```
- Insert
```sql
INSERT INTO cards (id, name, minCreditScore, annualFee, rewards) VALUES (?, ?, ?, ?, ?);
```
- Query best-by-category (conceptual): parse `rewards` JSON and ORDER BY the category field. With SQLite JSON1 extension:
```sql
SELECT id, name, json_extract(rewards, '$.groceries') AS groceries_rate
FROM cards
ORDER BY groceries_rate DESC
LIMIT 1;
```
- Read profile
```sql
SELECT * FROM profiles WHERE id = ?;
```


### Example CRUD operations (HTTP + DB/JSON examples)
- Add a new card (admin only): POST /api/cards body -> server inserts into JSON or DB and returns 201.
- Update a card: PUT /api/cards/:id -> server validates and writes.
- Delete a card: DELETE /api/cards/:id -> server removes entry and writes store.

For JSON: ensure safe read-modify-write and use a mutex or queue for server-side writes to avoid race conditions.


### Data validation
Validation approach
- Use AJV with the JSON schemas provided in capstone-05 for runtime validation.
- Validate at controller entry points: `POST /api/cards/recommend` and any profile CRUD endpoints.

Key constraints
- `creditScore` must be integer between 300 and 850.
- `spending` values must be numbers >= 0.
- Card `rewards` entries must be numbers (allow decimals for percent rates).

Sample AJV schema snippet (conceptual)
```json
{
  "type": "object",
  "properties": {
    "profile": { "$ref": "#/definitions/UserProfile" },
    "spending": { "$ref": "#/definitions/UserSpending" }
  },
  "required": ["profile","spending"]
}
```


### Backup & migration
Backups
- Keep `data/*.json` under Git for reproducible samples.
- For user-generated data, create daily backups by copying JSON files to `backups/` with timestamp.

Migration to SQLite (script outline)
- `scripts/import_cards.js`:
  1. Read `data/cards.json`.
  2. For each card, insert into `cards` table using parameterized queries.
  3. Verify row counts and log failures.

Testing migration
- Run migration in a test DB and run a test suite that compares outputs of `rewardsService` when reading from JSON vs reading from SQLite to ensure parity.


### Data retention & privacy notes
- Profiles are minimal; avoid storing PII (e.g., don't store SSN or full addresses).
- Document how long test profiles stay in `profiles.json` and provide a script to wipe test data.


### Evidence / Artifacts
- `data/cards.json`, `data/profile.json`, `data/spending.json`
- `backend/services/dataStore.js` — read/write examples
- Migration script stub (not yet present) — recommended `scripts/import_cards.js`


### Notes & Risks
- Race condition risk when writing JSON: mitigate by limiting writes or migrating to SQLite.
- JSON structure drift risk: if schema changes, add a version field and conversion scripts.


### Verification checklist
- Schema explanations: present in Schema rationale section.
- Sample queries: JSON and SQLite examples provided.
- CRUD examples: provided as code snippets.
- Validation: AJV approach and constraints described.


---

End of capstone-08 data audit document.
