// Backend tests for rewardsService
// Tests the isEligible, estimateRewardsForCard, and recommendCards functions

const {
  isEligible,
  estimateRewardsForCard,
  recommendCards,
} = require("../services/rewardsService");

// Sample card data for testing
const sampleCards = [
  {
    id: 1,
    name: "Chase Sapphire Preferred",
    issuer: "Chase",
    level: "Premium",
    annualFee: 95,
    pointValueCents: 2,
    minCreditScore: 670,
    rewards: {
      dining: 3,
      groceries: 1,
      gas: 1,
      travel: 2,
      other: 1,
    },
    studentFriendly: false,
    rotatingCategories: false,
  },
  {
    id: 2,
    name: "Discover Student",
    issuer: "Discover",
    level: "Student",
    annualFee: 0,
    pointValueCents: 1,
    minCreditScore: 620,
    rewards: {
      dining: 1,
      groceries: 1,
      gas: 1,
      travel: 1,
      other: 1,
    },
    studentFriendly: true,
    rotatingCategories: false,
  },
];

// Test isEligible
describe("isEligible", () => {
  test("should return true for profile with valid credit score", () => {
    const profile = {
      creditScore: 720,
      accountsOpened24: 2,
      isStudent: false,
    };
    // Note: isEligible takes (card, profile) not (profile, card)
    const result = isEligible(sampleCards[0], profile);
    expect(result).toBe(true);
  });

  test("should return false for profile with low credit score", () => {
    const profile = {
      creditScore: 580,
      accountsOpened24: 1,
      isStudent: false,
    };
    const result = isEligible(sampleCards[0], profile);
    expect(result).toBe(false);
  });

  test("should return true even if credit score exceeds 850", () => {
    const profile = {
      creditScore: 900,
      accountsOpened24: 1,
      isStudent: false,
    };
    // The implementation doesn't reject high scores, only checks minimum
    const result = isEligible(sampleCards[0], profile);
    expect(result).toBe(true);
  });

  test("should return false if 5+ accounts opened in 24 months for Chase card", () => {
    const profile = {
      creditScore: 720,
      accountsOpened24: 5,
      isStudent: false,
    };
    // Chase Sapphire should be blocked with 5+ accounts
    const result = isEligible(sampleCards[0], profile);
    expect(result).toBe(false);
  });

  test("should allow students to get student-friendly cards", () => {
    const profile = {
      creditScore: 630,
      accountsOpened24: 1,
      isStudent: true,
    };
    // Student card should have minCreditScore at or below 630
    const result = isEligible(sampleCards[1], profile);
    expect(result).toBe(true);
  });
});

// Test estimateRewardsForCard
describe("estimateRewardsForCard", () => {
  test("should calculate annual rewards correctly for given spending", () => {
    const card = sampleCards[0]; // Chase Sapphire (3x dining, 1x other), pointValue=2 cents
    const spending = {
      dining: 300, // monthly: 300 * 12 * 3 * $0.02 = $216
      groceries: 0,
      gas: 0,
      travel: 0,
      other: 0,
    };
    const result = estimateRewardsForCard(card, spending);
    expect(result).toHaveProperty("annual");
    expect(result).toHaveProperty("monthly");
    // Should be around $216 - $95 = $121 annual
    expect(result.annual).toBeGreaterThan(100);
  });

  test("should handle zero spending", () => {
    const card = sampleCards[1]; // Discover Student (no annual fee)
    const spending = {
      dining: 0,
      groceries: 0,
      gas: 0,
      travel: 0,
      other: 0,
    };
    const result = estimateRewardsForCard(card, spending);
    expect(result).toHaveProperty("annual");
    expect(result).toHaveProperty("monthly");
    // No spending, no rewards
    expect(result.annual).toBe(0);
  });

  test("should subtract annual fee from rewards", () => {
    const card = sampleCards[0]; // $95 annual fee
    const spending = {
      dining: 30, // monthly: 30 * 12 * 3 * $0.02 = $21.60
      groceries: 0,
      gas: 0,
      travel: 0,
      other: 0,
    };
    const result = estimateRewardsForCard(card, spending);
    // $21.60 - $95 fee = -$73.40
    expect(result.annual).toBeLessThan(0);
  });
});

// Test recommendCards
describe("recommendCards", () => {
  test("should return object with scored, bestByCategory, and bestOverall", () => {
    const profile = {
      creditScore: 720,
      accountsOpened24: 1,
      isStudent: false,
      ecosystem: "none",
      travelFrequency: "rarely",
      rewardPreference: "general",
    };
    const spending = {
      dining: 300,
      groceries: 400,
      gas: 200,
      travel: 100,
      other: 200,
    };

    const result = recommendCards(sampleCards, profile, spending, []);

    expect(result).toHaveProperty("scored");
    expect(result).toHaveProperty("bestByCategory");
    expect(result).toHaveProperty("bestOverall");
  });

  test("should return bestOverall as an array", () => {
    const profile = {
      creditScore: 720,
      accountsOpened24: 1,
      isStudent: false,
      ecosystem: "none",
      travelFrequency: "rarely",
      rewardPreference: "general",
    };
    const spending = {
      dining: 300,
      groceries: 400,
      gas: 200,
      travel: 100,
      other: 200,
    };

    const result = recommendCards(sampleCards, profile, spending, []);

    expect(Array.isArray(result.bestOverall)).toBe(true);
    expect(result.bestOverall.length).toBeGreaterThan(0);
  });

  test("should mark owned cards but still include them in recommendations", () => {
    const profile = {
      creditScore: 720,
      accountsOpened24: 1,
      isStudent: false,
      ecosystem: "none",
      travelFrequency: "rarely",
      rewardPreference: "general",
    };
    const spending = {
      dining: 300,
      groceries: 400,
      gas: 200,
      travel: 100,
      other: 200,
    };
    const ownedCards = [1]; // User already owns card ID 1

    const result = recommendCards(sampleCards, profile, spending, ownedCards);

    // Check that card 1 is marked as owned
    const ownedCard = result.scored.find((card) => card.id === 1);
    expect(ownedCard).toBeDefined();
    expect(ownedCard.owned).toBe(true);
  });

  test("should only recommend eligible cards", () => {
    const profile = {
      creditScore: 600, // Below Chase Sapphire's minimum (670)
      accountsOpened24: 1,
      isStudent: false,
      ecosystem: "none",
      travelFrequency: "rarely",
      rewardPreference: "general",
    };
    const spending = {
      dining: 300,
      groceries: 400,
      gas: 200,
      travel: 100,
      other: 200,
    };

    const result = recommendCards(sampleCards, profile, spending, []);

    // With low credit score, only Discover Student (minScore 620) should be eligible
    const hasChapeSapphire = result.bestOverall.some(
      (card) => card.id === 1
    );
    expect(hasChapeSapphire).toBe(false);
  });
});
