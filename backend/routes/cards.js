const express = require("express");
const router = express.Router();

const cards = require("../../data/cards.json");
const { recommendCards } = require("../services/rewardsService");

// GET /api/cards – return list of cards
router.get("/", (req, res) => {
  res.json(cards);
});

// GET /api/cards/:id – return specific card
router.get("/:id", (req, res) => {
  const card = cards.find((c) => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: "Card not found" });
  res.json(card);
});

// POST /api/cards/recommend – compute recommendations
router.post("/recommend", (req, res) => {
  try {
    const { profile, spending, ownedCards = [] } = req.body;
    const result = recommendCards(cards, profile, spending, ownedCards);
    res.json(result);
  } catch (err) {
    console.error("Recommend API error:", err);
    res.status(500).json({ error: "Recommendation server error" });
  }
});

module.exports = router;
