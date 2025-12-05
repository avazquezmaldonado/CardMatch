/*
  Rewards calculation service (clean implementation)
  - cards: array of card objects with category reward rates
  - profile: { creditScore, accountsOpened24, isStudent (optional) }
  - spending: { groceries: 400, dining: 200, travel: 100 }
  - ownedCards: array of card ids the user already has
  - options: { ecosystem, travelFrequency, rewardPreference }

  Behavior:
  - Preserve base reward calculation (percent cashback) and eligibility by minCreditScore
  - Additional eligibility rules: Chase 5/24 exclusion, low-credit gating, premium avoidance
  - Apply simple multipliers after base estimates for ecosystem, student, ownership synergy,
    reward preference, travel frequency, and rotating categories.

  Returns: { scored, bestByCategory, bestOverall }
*/

function isEligible(card, profile) {
  // Basic min credit score check (preserve existing behavior)
  if (!card.minCreditScore) return true;
  if (!profile || typeof profile.creditScore !== 'number') return true;

  // Chase 5/24 rule: if user opened >=5 accounts in 24 months, exclude Chase cards
  // Rule A: 5/24 — exclude Chase if user opened >=5 accounts in 24 months
  if (profile.accountsOpened24 >= 5 && String(card.issuer).toLowerCase() === 'chase') {
    return false;
  }

  // Low credit score gating:
  // Rule B: Low credit score logic
  // If creditScore < 630: only allow secured OR Beginner OR Student level cards
  if (profile.creditScore < 630) {
    const level = String(card.level || '').toLowerCase();
    if (!(card.secured === true || level === 'beginner' || level === 'student')) return false;
  }

  // If creditScore between 630 and 679: treat premium cards as ineligible
  if (profile.creditScore >= 630 && profile.creditScore < 680) {
    if (String(card.level || '').toLowerCase() === 'premium') return false;
  }

  // Finally, require base minCreditScore
  return profile.creditScore >= card.minCreditScore;
}

function estimateRewardsForCard(card, spending) {
  // Base reward calculation: treat reward numbers as percent cashback
  let monthly = 0;
  for (const [cat, amount] of Object.entries(spending || {})) {
    const rate = (card.rewards && (card.rewards[cat] || card.rewards['default'])) || 0;
    monthly += amount * (rate / 100);
  }
  return { monthly: Number(monthly.toFixed(2)), annual: Number((monthly * 12).toFixed(2)) };
}

function recommendCards(cards, profile, spending, ownedCards = []) {
  // 1) Filter by eligibility (includes minCreditScore and new rules such as 5/24 and low-score gating)
  const eligible = cards.filter(c => isEligible(c, profile));

  // 2) Normalize owned card names/ids; if passed as names, match against card names; if ids, match against ids
  const ownedNames = new Set();
  const ownedIssuers = new Set();
  for (const ownedItem of (ownedCards || [])) {
    // Try to find a card matching by name or id
    const matchedCard = cards.find(c => 
      String(c.name).toLowerCase() === String(ownedItem).toLowerCase() || 
      String(c.id) === String(ownedItem)
    );
    if (matchedCard) {
      ownedNames.add(matchedCard.name);
      ownedIssuers.add(matchedCard.issuer);
    }
  }

  // Extract preference fields from profile
  const ecosPref = (profile.preferredEcosystem || profile.ecosystem || 'Any');
  const travelFreq = (profile.travelFrequency || profile.travelFreq || 'Never');
  const rewardPref = (profile.rewardPreference || profile.rewardPref || 'Cash Back');

  // 4) Compute base estimates, then apply multipliers
  const scored = eligible.map(card => {
    const base = estimateRewardsForCard(card, spending);

    // Start multiplier chain
    let multiplier = 1.0;

    // --- Rule C: Student logic ---
    // If user is a student, boost student-friendly cards (~1.20x)
    if (profile && profile.isStudent === true && card.studentFriendly) {
      multiplier *= 1.20;
    }

    // --- Rule D: Ecosystem preference ---
    // If user's preferred ecosystem matches the card's ecosystem, boost by 1.10x
    if (ecosPref && ecosPref !== 'Any') {
      const issuer = (card.ecosystem || card.issuer || '').toLowerCase();
      const pref = ecosPref.toLowerCase();
      if (issuer.includes(pref)) multiplier *= 1.10;
    }

    // --- Credit score premium penalty (applied after eligibility) ---
    if (profile && typeof profile.creditScore === 'number' && profile.creditScore < 630) {
      if (String(card.level || '').toLowerCase() === 'premium') multiplier *= 0.5; // heavy penalty
    }

    // --- Rule E: Ecosystem synergy (owned cards) ---
    // Apply extra boosts if user owns a starter card that pairs well with premium cards
    if (ownedNames.has('Chase Freedom Flex') || ownedNames.has('Chase Freedom Unlimited')) {
      // boost Sapphire cards if they exist
      if ((card.name || '').toLowerCase().includes('sapphire')) multiplier *= 1.40;
    }
    if (ownedNames.has('Amex Gold')) {
      // boost Amex Platinum-like products
      if ((card.name || '').toLowerCase().includes('platinum')) multiplier *= 1.40;
    }
    if (ownedNames.has('Capital One SavorOne')) {
      // boost Capital One venture/reserve type products
      if ((card.name || '').toLowerCase().includes('venture') || (card.name || '').toLowerCase().includes('reserve')) multiplier *= 1.40;
    }

  // Small boost if user owns any card in the same ecosystem
  if (ownedIssuers.has(card.ecosystem || card.issuer)) multiplier *= 1.05;

    // --- Preferred reward type logic ---
    const r = (cat) => (card.rewards && (card.rewards[cat] || 0));
    // --- Rule F: Preferred reward type ---
    // If user prefers Cash Back, favor flat-rate or balanced cashback cards and slightly penalize premium travel-focused cards.
    if (rewardPref === 'Cash Back') {
      const cashFlat = (card.rewards && (card.rewards.default || 0) >= 2);
      const cashCore = (r('groceries') + r('dining') + r('other')) >= 6;
      if (cashFlat || cashCore) multiplier *= 1.07; // slightly stronger boost for cashback pref
      // penalize premium travel-first cards
      if (String(card.level || '').toLowerCase() === 'premium' && r('travel') >= 3) multiplier *= 0.9;
    }
    // If user prefers Points/Miles, boost travel/dining heavy cards and slightly penalize pure cashback
    if (rewardPref === 'Points/Miles') {
      if (r('travel') >= 3 || r('dining') >= 3) multiplier *= 1.08;
      if ((card.rewards && (card.rewards.default || 0) >= 2) && !(r('travel') >= 3 || r('dining') >= 3)) multiplier *= 0.95;
    }

    // --- Travel frequency logic ---
    // --- Rule G: Travel frequency ---
    // If user travels often, boost travel rewards; if never, penalize travel-first cards and favor cashback
    if (String(travelFreq).toLowerCase() === 'often') {
      if (r('travel') >= 3) multiplier *= 1.10;
    } else if (String(travelFreq).toLowerCase() === 'never') {
      if (r('travel') >= 3) multiplier *= 0.8; // penalize travel-heavy
      const cashFlat = (card.rewards && (card.rewards.default || 0) >= 2);
      if (cashFlat) multiplier *= 1.06;
    }

  // --- Rule H: Rotating categories bump ---
  // Small boost for cards that have rotating categories
  if (card.rotatingCategories) multiplier *= 1.05;

    // --- Rule I: Unlock transfer partners logic ---
    // If the card unlocks transfer partners and user owns a points-earning card in that ecosystem, boost strongly
    try {
      const ecosystemOwners = Array.from(ownedIssuers);
      if (card.unlockTransferPartners === true || card.unlockTransferPartners === 'true' || card.unlockTransferPartners === 'True') {
        if (ecosystemOwners.some(e => String(e).toLowerCase() === String(card.ecosystem || card.issuer || '').toLowerCase())) {
          multiplier *= 1.4;
        }
      }
    } catch (e) {
      // ignore any unexpected shape
    }

    // --- Apply final multipliers to base estimates ---
    const adjustedAnnual = Number((base.annual * multiplier).toFixed(2));
    // Ensure monthly is derived from the final annual value per spec
    const adjustedMonthly = Number((adjustedAnnual / 12).toFixed(2));

    return {
      id: card.id,
      name: card.name,
      estimates: { monthly: adjustedMonthly, annual: adjustedAnnual },
      owned: ownedNames.has(card.name)
    };
  });

  // 5) Best per category (use raw card rates, unchanged)
  const categories = Object.keys(spending || {});
  const bestByCategory = {};
  for (const cat of categories) {
    let best = null;
    for (const card of eligible) {
      const rate = (card.rewards && (card.rewards[cat] || card.rewards['default'])) || 0;
      if (!best || rate > best.rate) best = { id: card.id, name: card.name, rate };
    }
    if (best) bestByCategory[cat] = best;
  }

  // 6) Best overall combination (top 3 by adjusted annual rewards)
  const sorted = scored.slice().sort((a, b) => b.estimates.annual - a.estimates.annual);
  const bestOverall = sorted.slice(0, 3);

  return { scored, bestByCategory, bestOverall };
}

module.exports = { isEligible, estimateRewardsForCard, recommendCards };
