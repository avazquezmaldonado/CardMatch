# Testing Guide

This document explains how to run tests for the CardMatch project.

## Backend Tests (Jest)

The backend uses **Jest** for unit testing the recommendation engine.

### Running Backend Tests

To run all backend tests:

```bash
npm test
```

To run tests in watch mode (re-run tests when code changes):

```bash
npm run test:watch
```

### Test Coverage

The test suite covers:

1. **isEligible()** - Tests eligibility logic:
   - Valid credit score acceptance
   - Low credit score rejection (below 630)
   - Chase 5/24 rule enforcement
   - Student-friendly card filtering

2. **estimateRewardsForCard()** - Tests rewards calculation:
   - Annual rewards calculation with multipliers
   - Zero spending handling
   - Annual fee subtraction
   - Monthly vs. annual calculation

3. **recommendCards()** - Tests recommendation logic:
   - Correct return structure (scored, bestByCategory, bestOverall)
   - Top 3 card selection
   - Owned card handling and flagging
   - Eligibility filtering in results

### Test Results

All 12 tests pass successfully:

```
Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Time:        ~0.3s
```

## API Testing

### Valid Request Example

```bash
curl -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "creditScore": 720,
      "accountsOpened24": 1,
      "isStudent": false,
      "ecosystem": "none",
      "travelFrequency": "rarely",
      "rewardPreference": "general"
    },
    "spending": {
      "dining": 300,
      "groceries": 400,
      "gas": 200,
      "travel": 100,
      "other": 200
    }
  }'
```

### Invalid Request Example (returns 400)

```bash
curl -i -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{"profile":{"creditScore":250},"spending":{"dining":100}}'
```

Response:
```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error":"Credit score must be a number between 300 and 850"}
```

## Validation Rules

The API enforces the following validation rules:

- **Credit Score**: Must be a number between 300 and 850
- **Accounts Opened in 24 Months**: Must be a non-negative number
- **Spending Categories**: All values must be non-negative numbers
- **Required Fields**: profile and spending objects are required

Invalid requests return HTTP 400 with a descriptive error message.

## Frontend Testing

Frontend UI testing uses manual testing in the browser:

1. Open `frontend/index.html` in a web browser
2. Enter test data using the "Load Sample Data" button
3. Verify recommendations appear correctly
4. Test export functionality (downloads JSON file)

### Test Cases

- Valid profile: Submit form with valid inputs → Should display top 3 recommendations
- Low credit score: Submit with credit score < 300 → Should show 400 error
- High spending: Submit with high monthly spending → Should show high rewards estimates
- Export: Click export button → Should download JSON file
- Persistence: Refresh page → Form data should be cleared (localStorage not implemented yet)

## Manual API Tests

All API endpoints can be tested with curl:

### List all cards
```bash
curl http://localhost:4000/api/cards
```

### Get specific card
```bash
curl http://localhost:4000/api/cards/1
```

### Get recommendations (see examples above)
```bash
curl -X POST http://localhost:4000/api/cards/recommend ...
```
