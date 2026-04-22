/**
 * @file validateRecommendRequest.js
 * @description Express middleware that validates the POST /api/cards/recommend request body
 * using Joi. Returns a structured VALIDATION_ERROR response on failure.
 */

const Joi = require('joi');

/** Spending categories the API accepts. */
const SPENDING_CATEGORIES = ['groceries', 'dining', 'travel', 'other'];

/** Valid issuer ecosystems. */
const ECOSYSTEMS = ['Chase', 'Amex', 'Capital One', 'Citi', 'Discover', 'Any'];

/** Valid travel frequency values. */
const TRAVEL_FREQUENCIES = ['Never', 'Rarely', 'Sometimes', 'Often'];

/** Valid reward preference values. */
const REWARD_PREFERENCES = ['Cash Back', 'Points/Miles', 'Either'];

/**
 * Joi schema for the profile portion of the recommend request.
 */
const profileSchema = Joi.object({
  creditScore: Joi.number().integer().min(300).max(850).required(),
  accountsOpened24: Joi.number().integer().min(0).max(24).required(),
  isStudent: Joi.boolean().default(false),
  preferredEcosystem: Joi.string().valid(...ECOSYSTEMS).optional(),
  travelFrequency: Joi.string().valid(...TRAVEL_FREQUENCIES).optional(),
  rewardPreference: Joi.string().valid(...REWARD_PREFERENCES).optional(),
});

/**
 * Joi schema for the spending portion of the recommend request.
 * Each category must be a non-negative number.
 */
const spendingSchema = Joi.object(
  Object.fromEntries(SPENDING_CATEGORIES.map((cat) => [cat, Joi.number().min(0).required()]))
);

/**
 * Full request body schema.
 */
const recommendSchema = Joi.object({
  profile: profileSchema.required(),
  spending: spendingSchema.required(),
  ownedCards: Joi.array().optional(),
});

/**
 * Maps a Joi ValidationError's details array into the flat `fields` object
 * required by the API error contract.
 *
 * @param {import('joi').ValidationError} joiError - The Joi validation error.
 * @returns {{ [field: string]: string }} Map of field path → human-readable message.
 */
function buildFieldErrors(joiError) {
  const fields = {};
  for (const detail of joiError.details) {
    // detail.path is an array like ['profile', 'creditScore'] — join with '.'
    const key = detail.path.join('.');
    fields[key] = detail.message.replace(/['"]/g, '');
  }
  return fields;
}

/**
 * Express middleware that validates the recommend request body against the Joi schema.
 * On success, calls next(). On failure, responds 400 with a VALIDATION_ERROR payload.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 */
function validateRecommendRequest(req, res, next) {
  const { error } = recommendSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      fields: buildFieldErrors(error),
    });
  }

  next();
}

module.exports = { validateRecommendRequest };
