const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');

// GET /api/cards - list all cards
router.get('/', cardsController.listCards);

// GET /api/cards/:id - card detail
router.get('/:id', cardsController.getCardById);

// POST /api/cards/recommend - body: { profile, spending, ownedCards }
router.post('/recommend', cardsController.recommend);

module.exports = router;
