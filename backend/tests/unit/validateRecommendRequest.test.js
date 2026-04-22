/**
 * @file validateRecommendRequest.test.js
 * @description Unit tests for the Joi validation middleware.
 * Covers: valid input, invalid input, and missing required fields.
 */

const httpMocks = require('node-mocks-http');
const { validateRecommendRequest } = require('../../middleware/validateRecommendRequest');

/**
 * Helper that runs the middleware against a request body and returns
 * { statusCode, body, nextCalled }.
 *
 * @param {object} body - The request body to validate.
 * @returns {{ statusCode: number, body: object, nextCalled: boolean }}
 */
function runMiddleware(body) {
  const req = httpMocks.createRequest({ body });
  const res = httpMocks.createResponse();
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  validateRecommendRequest(req, res, next);

  // Only parse JSON body when the middleware actually wrote a response
  const responseBody = nextCalled ? null : res._getJSONData();

  return {
    statusCode: res.statusCode,
    body: responseBody,
    nextCalled,
  };
}

// ---------------------------------------------------------------------------
// Shared fixture: a fully valid request body
// ---------------------------------------------------------------------------

/** @type {object} */
const VALID_BODY = {
  profile: {
    creditScore: 750,
    accountsOpened24: 2,
    isStudent: false,
    preferredEcosystem: 'Chase',
    travelFrequency: 'Often',
    rewardPreference: 'Points/Miles',
  },
  spending: {
    groceries: 400,
    dining: 200,
    travel: 150,
    other: 100,
  },
};

// ---------------------------------------------------------------------------
// Valid input
// ---------------------------------------------------------------------------

describe('validateRecommendRequest — valid input', () => {
  test('passes through a fully valid request body', () => {
    const { nextCalled, statusCode } = runMiddleware(VALID_BODY);
    expect(nextCalled).toBe(true);
    expect(statusCode).toBe(200); // default — middleware did not set a status
  });

  test('accepts minimum valid creditScore (300)', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, creditScore: 300 } };
    const { nextCalled } = runMiddleware(body);
    expect(nextCalled).toBe(true);
  });

  test('accepts maximum valid creditScore (850)', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, creditScore: 850 } };
    const { nextCalled } = runMiddleware(body);
    expect(nextCalled).toBe(true);
  });

  test('accepts request without optional profile fields', () => {
    const body = {
      profile: { creditScore: 700, accountsOpened24: 1 },
      spending: VALID_BODY.spending,
    };
    const { nextCalled } = runMiddleware(body);
    expect(nextCalled).toBe(true);
  });

  test('accepts all valid preferredEcosystem values', () => {
    const ecosystems = ['Chase', 'Amex', 'Capital One', 'Citi', 'Discover', 'Any'];
    for (const ecosystem of ecosystems) {
      const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, preferredEcosystem: ecosystem } };
      const { nextCalled } = runMiddleware(body);
      expect(nextCalled).toBe(true);
    }
  });

  test('accepts all valid travelFrequency values', () => {
    const frequencies = ['Never', 'Rarely', 'Sometimes', 'Often'];
    for (const freq of frequencies) {
      const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, travelFrequency: freq } };
      const { nextCalled } = runMiddleware(body);
      expect(nextCalled).toBe(true);
    }
  });

  test('accepts all valid rewardPreference values', () => {
    const prefs = ['Cash Back', 'Points/Miles', 'Either'];
    for (const pref of prefs) {
      const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, rewardPreference: pref } };
      const { nextCalled } = runMiddleware(body);
      expect(nextCalled).toBe(true);
    }
  });

  test('accepts zero spending values', () => {
    const body = {
      profile: VALID_BODY.profile,
      spending: { groceries: 0, dining: 0, travel: 0, other: 0 },
    };
    const { nextCalled } = runMiddleware(body);
    expect(nextCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Invalid input
// ---------------------------------------------------------------------------

describe('validateRecommendRequest — invalid input', () => {
  test('rejects creditScore above 850', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, creditScore: 851 } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.creditScore']).toBeDefined();
  });

  test('rejects creditScore below 300', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, creditScore: 299 } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.creditScore']).toBeDefined();
  });

  test('rejects non-integer creditScore', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, creditScore: 700.5 } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.creditScore']).toBeDefined();
  });

  test('rejects negative accountsOpened24', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, accountsOpened24: -1 } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.accountsOpened24']).toBeDefined();
  });

  test('rejects accountsOpened24 above 24', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, accountsOpened24: 25 } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.accountsOpened24']).toBeDefined();
  });

  test('rejects invalid preferredEcosystem value', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, preferredEcosystem: 'Wells Fargo' } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.preferredEcosystem']).toBeDefined();
  });

  test('rejects invalid travelFrequency value', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, travelFrequency: 'Always' } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.travelFrequency']).toBeDefined();
  });

  test('rejects invalid rewardPreference value', () => {
    const body = { ...VALID_BODY, profile: { ...VALID_BODY.profile, rewardPreference: 'Crypto' } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['profile.rewardPreference']).toBeDefined();
  });

  test('rejects negative spending value', () => {
    const body = { ...VALID_BODY, spending: { ...VALID_BODY.spending, groceries: -10 } };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
    expect(resBody.fields['spending.groceries']).toBeDefined();
  });

  test('reports all invalid fields at once (abortEarly: false)', () => {
    const body = {
      profile: { creditScore: 999, accountsOpened24: -1 },
      spending: VALID_BODY.spending,
    };
    const { body: resBody } = runMiddleware(body);
    expect(Object.keys(resBody.fields).length).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// Missing required fields
// ---------------------------------------------------------------------------

describe('validateRecommendRequest — missing required fields', () => {
  test('rejects request with no body', () => {
    const { nextCalled, statusCode, body: resBody } = runMiddleware({});
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.error).toBe('VALIDATION_ERROR');
  });

  test('rejects missing profile', () => {
    const body = { spending: VALID_BODY.spending };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.fields['profile']).toBeDefined();
  });

  test('rejects missing spending', () => {
    const body = { profile: VALID_BODY.profile };
    const { nextCalled, statusCode, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(statusCode).toBe(400);
    expect(resBody.fields['spending']).toBeDefined();
  });

  test('rejects missing creditScore', () => {
    const { creditScore, ...profileWithout } = VALID_BODY.profile;
    const body = { profile: profileWithout, spending: VALID_BODY.spending };
    const { nextCalled, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(resBody.fields['profile.creditScore']).toBeDefined();
  });

  test('rejects missing accountsOpened24', () => {
    const { accountsOpened24, ...profileWithout } = VALID_BODY.profile;
    const body = { profile: profileWithout, spending: VALID_BODY.spending };
    const { nextCalled, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(resBody.fields['profile.accountsOpened24']).toBeDefined();
  });

  test('rejects missing spending.groceries', () => {
    const { groceries, ...spendingWithout } = VALID_BODY.spending;
    const body = { profile: VALID_BODY.profile, spending: spendingWithout };
    const { nextCalled, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(resBody.fields['spending.groceries']).toBeDefined();
  });

  test('rejects missing spending.dining', () => {
    const { dining, ...spendingWithout } = VALID_BODY.spending;
    const body = { profile: VALID_BODY.profile, spending: spendingWithout };
    const { nextCalled, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(resBody.fields['spending.dining']).toBeDefined();
  });

  test('rejects missing spending.travel', () => {
    const { travel, ...spendingWithout } = VALID_BODY.spending;
    const body = { profile: VALID_BODY.profile, spending: spendingWithout };
    const { nextCalled, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(resBody.fields['spending.travel']).toBeDefined();
  });

  test('rejects missing spending.other', () => {
    const { other, ...spendingWithout } = VALID_BODY.spending;
    const body = { profile: VALID_BODY.profile, spending: spendingWithout };
    const { nextCalled, body: resBody } = runMiddleware(body);
    expect(nextCalled).toBe(false);
    expect(resBody.fields['spending.other']).toBeDefined();
  });
});
