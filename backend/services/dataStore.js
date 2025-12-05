const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

async function readJson(filename) {
  const full = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(full, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filename, obj) {
  const full = path.join(DATA_DIR, filename);
  const raw = JSON.stringify(obj, null, 2);
  await fs.writeFile(full, raw, 'utf8');
}

module.exports = { readJson, writeJson };
