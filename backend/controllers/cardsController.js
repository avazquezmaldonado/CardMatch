const path = require('path');
const dataStore = require('../services/dataStore');
const rewardsService = require('../services/rewardsService');

async function listCards(req, res) {
  try {
    const cards = await dataStore.readJson('cards.json');
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Could not read cards data' });
  }
}

async function getCardById(req, res) {
  try {
    const id = req.params.id;
    const cards = await dataStore.readJson('cards.json');
    const card = cards.find(c => String(c.id) === String(id));
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Could not read card data' });
  }
}

async function recommend(req, res) {
  try {
    // Extract profile, spending, and ownedCards from request
    const { profile = {}, spending = {}, ownedCards = [] } = req.body;
    const cards = await dataStore.readJson('cards.json');
    // Pass profile directly (it contains all fields including preferredEcosystem, travelFrequency, rewardPreference)
    const recommendations = rewardsService.recommendCards(cards, profile, spending, ownedCards || []);
    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Recommendation failed' });
  }
}

module.exports = { listCards, getCardById, recommend };
