// Card Routes
// Handles GET /api/cards (list), GET /api/cards/:id (detail), POST /api/cards/recommend (recommendations)

const express = require("express");
const router = express.Router();

// Load card data from JSON file
const cards = require("../../data/cards.json");
// Import the recommendation logic
const { recommendCards } = require("../services/rewardsService");
// Import validation
const { validateRecommendRequest } = require("../services/validator");

// GET /api/cards – return all cards
router.get("/", (req, res) => {
  res.json(cards);
});

// GET /api/cards/:id – return a specific card by ID
router.get("/:id", (req, res) => {
  // Find card with matching ID
  const card = cards.find((c) => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: "Card not found" });
  res.json(card);
});

// POST /api/cards/recommend – compute recommendations
router.post("/recommend", (req, res) => {
  try {
    // Extract data from request body
    const { profile, spending, ownedCards = [] } = req.body;
    
    // Validate the request
    const validation = validateRecommendRequest(profile, spending, ownedCards);
    if (!validation.valid) {
      // Return 400 for validation errors (not 500)
      return res.status(400).json({ error: validation.error });
    }
    
    // Call the recommendation service
    const result = recommendCards(cards, profile, spending, ownedCards);
    // Send back the results
    res.json(result);
  } catch (err) {
    console.error("Recommend API error:", err);
    res.status(500).json({ error: "Recommendation server error" });
  }
});

module.exports = router;
