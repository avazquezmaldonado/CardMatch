// CardMatch Backend Server
// This is the main Express app that handles API requests
// Routes: GET /api/cards (list all), GET /api/cards/:id (detail), POST /api/cards/recommend (get recommendations)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const cardsRouter = require('./routes/cards');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS so frontend can call this backend
app.use(cors());
// Parse incoming JSON requests
app.use(bodyParser.json());

// Mount all card routes at /api/cards
app.use('/api/cards', cardsRouter);

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'CardMatch backend running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CardMatch backend listening on port ${PORT}`);
});