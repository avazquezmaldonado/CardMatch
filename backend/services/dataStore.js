/**
 * @file dataStore.js
 * @description Data access layer for CardMatch.
 * Uses SQLite when available; falls back to cards.json for read-only
 * environments (e.g. Vercel serverless) where the filesystem is restricted.
 */

require('dotenv').config();
const path = require('path');
const fs   = require('fs');

const DB_PATH     = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'cardmatch.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');
const CARDS_PATH  = path.join(__dirname, '..', '..', 'data', 'cards.json');

/** Algo version constant — increment when scoring logic changes. */
const ALGO_VERSION = 'v1.0';

/**
 * Attempts to open the SQLite database and seed it.
 * Returns null if SQLite is unavailable (e.g. read-only filesystem on Vercel).
 *
 * @returns {import('better-sqlite3').Database|null}
 */
function tryOpenDb() {
  try {
    const Database = require('better-sqlite3');
    const db = new Database(DB_PATH);

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);

    const count = db.prepare('SELECT COUNT(*) AS n FROM cards').get();
    if (count.n === 0) {
      const cards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'));
      const insert = db.prepare(`
        INSERT OR IGNORE INTO cards
          (id, name, issuer, annual_fee, min_credit_score, reward_tiers, eligibility_rules)
        VALUES
          (@id, @name, @issuer, @annual_fee, @min_credit_score, @reward_tiers, @eligibility_rules)
      `);
      const seedAll = db.transaction((list) => {
        for (const card of list) {
          insert.run({
            id:                card.id,
            name:              card.name,
            issuer:            card.issuer || card.ecosystem || '',
            annual_fee:        card.annualFee || 0,
            min_credit_score:  card.minCreditScore || 0,
            reward_tiers:      JSON.stringify(card.rewards || {}),
            eligibility_rules: JSON.stringify({
              level:                  card.level,
              secured:                card.secured,
              studentFriendly:        card.studentFriendly,
              rotatingCategories:     card.rotatingCategories,
              unlockTransferPartners: card.unlockTransferPartners,
              pointValueCents:        card.pointValueCents,
              ecosystem:              card.ecosystem,
            }),
          });
        }
      });
      seedAll(cards);
    }

    return db;
  } catch (_err) {
    // SQLite unavailable — fall back to JSON
    return null;
  }
}

// Single shared connection. Null means we are in JSON-fallback mode.
const db = tryOpenDb();

/**
 * Reconstructs a full card object from a SQLite row.
 *
 * @param {object} row - A row from the cards table.
 * @returns {object} Card object matching the cards.json shape.
 */
function rowToCard(row) {
  const eligibility = JSON.parse(row.eligibility_rules || '{}');
  return {
    id:                     row.id,
    name:                   row.name,
    issuer:                 row.issuer,
    ecosystem:              eligibility.ecosystem || row.issuer,
    level:                  eligibility.level,
    secured:                eligibility.secured,
    studentFriendly:        eligibility.studentFriendly,
    rotatingCategories:     eligibility.rotatingCategories,
    unlockTransferPartners: eligibility.unlockTransferPartners,
    pointValueCents:        eligibility.pointValueCents,
    annualFee:              row.annual_fee,
    minCreditScore:         row.min_credit_score,
    rewards:                JSON.parse(row.reward_tiers || '{}'),
  };
}

/**
 * Returns all cards. Uses SQLite if available, otherwise reads cards.json.
 *
 * @returns {object[]} Array of card objects.
 */
function getAllCards() {
  if (db) {
    return db.prepare('SELECT * FROM cards ORDER BY id').all().map(rowToCard);
  }
  return JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'));
}

/**
 * Returns a single card by ID, or null if not found.
 *
 * @param {number|string} id - The card ID.
 * @returns {object|null}
 */
function getCardById(id) {
  if (db) {
    const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(Number(id));
    return row ? rowToCard(row) : null;
  }
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'));
  return cards.find((c) => String(c.id) === String(id)) || null;
}

/**
 * Logs a recommendation to the database.
 * No-op when running in JSON-fallback mode (SQLite unavailable).
 *
 * @param {object} params
 * @param {string} params.sessionId
 * @param {object} params.profile
 * @param {object} params.spending
 * @param {object} params.results
 * @param {number} params.durationMs
 * @returns {void}
 */
function logRecommendation({ sessionId, profile, spending, results, durationMs }) {
  if (!db) return; // no-op in JSON-fallback mode
  try {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    db.prepare(`
      INSERT INTO recommendation_logs
        (id, session_id, profile, spending, results, algo_version, duration_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      sessionId || null,
      JSON.stringify(profile),
      JSON.stringify(spending),
      JSON.stringify(results),
      ALGO_VERSION,
      durationMs || null,
    );
  } catch (_err) {
    // Fire-and-forget — never affects the API response
  }
}

module.exports = { getAllCards, getCardById, logRecommendation };
