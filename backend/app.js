const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const cardsRouter = require('./routes/cards');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/cards', cardsRouter);

app.get('/', (req, res) => res.json({ message: 'CardMatch backend running' }));

app.listen(PORT, () => {
  console.log(`CardMatch backend listening on port ${PORT}`);
});
