// Simple validation for request payloads
// Checks required fields and types before processing

function validateProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return { valid: false, error: 'Profile must be an object' };
  }
  
  if (typeof profile.creditScore !== 'number' || profile.creditScore < 300 || profile.creditScore > 850) {
    return { valid: false, error: 'Credit score must be a number between 300 and 850' };
  }
  
  if (typeof profile.accountsOpened24 !== 'number' || profile.accountsOpened24 < 0) {
    return { valid: false, error: 'Accounts opened must be a non-negative number' };
  }
  
  if (profile.isStudent && typeof profile.isStudent !== 'boolean') {
    return { valid: false, error: 'isStudent must be a boolean' };
  }
  
  return { valid: true };
}

function validateSpending(spending) {
  if (!spending || typeof spending !== 'object') {
    return { valid: false, error: 'Spending must be an object' };
  }
  
  for (const [key, value] of Object.entries(spending)) {
    if (typeof value !== 'number' || value < 0) {
      return { valid: false, error: `Spending for ${key} must be a non-negative number` };
    }
  }
  
  return { valid: true };
}

function validateRecommendRequest(profile, spending, ownedCards) {
  // Check profile
  const profileCheck = validateProfile(profile);
  if (!profileCheck.valid) {
    return profileCheck;
  }
  
  // Check spending
  const spendingCheck = validateSpending(spending);
  if (!spendingCheck.valid) {
    return spendingCheck;
  }
  
  // Check ownedCards is array
  if (ownedCards && !Array.isArray(ownedCards)) {
    return { valid: false, error: 'ownedCards must be an array' };
  }
  
  return { valid: true };
}

module.exports = {
  validateProfile,
  validateSpending,
  validateRecommendRequest
};
