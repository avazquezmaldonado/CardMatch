/*
  Rewards Service with Explanation Reasons
  Each recommendation now returns:
    - estimates
    - owned flag
    - reasoning list explaining WHY it ranked higher
*/

function isEligible(card, profile) {
  if (!card.minCreditScore) return true;
  if (!profile || typeof profile.creditScore !== "number") return true;

  // Chase 5/24 rule
  if (
    profile.accountsOpened24 >= 5 &&
    String(card.issuer).toLowerCase() === "chase"
  ) {
    return false;
  }

  const level = (card.level || "").toLowerCase();

  // Very low score: only secured / beginner / student
  if (profile.creditScore < 630) {
    if (!(card.secured || level === "beginner" || level === "student")) {
      return false;
    }
  }

  // Mid-tier: block premium
  if (profile.creditScore >= 630 && profile.creditScore < 680) {
    if (level === "premium") return false;
  }

  return profile.creditScore >= card.minCreditScore;
}

function estimateRewardsForCard(card, spending) {
  const pointValueCents =
    typeof card.pointValueCents === "number" ? card.pointValueCents : 1.0;

  let annual = 0;

  for (const [cat, amount] of Object.entries(spending || {})) {
    const rate =
      (card.rewards && (card.rewards[cat] || card.rewards.default)) || 0;

    // monthly amount * 12 * % * value per point
    const annualValue = amount * 12 * rate * (pointValueCents / 100);
    annual += annualValue;
  }

  if (card.annualFee && card.annualFee > 0) {
    annual -= card.annualFee;
  }

  const annualRounded = Number(annual.toFixed(2));
  const monthlyRounded = Number((annualRounded / 12).toFixed(2));

  return { monthly: monthlyRounded, annual: annualRounded };
}

function recommendCards(cards, profile, spending, ownedCards = []) {
  const eligible = cards.filter((c) => isEligible(c, profile));

  // Owned card ecosystem synergy flags
  const ownedNames = new Set();
  const ownedIssuers = new Set();

  for (const o of ownedCards) {
    const found = cards.find(
      (c) =>
        String(c.name).toLowerCase() === String(o).toLowerCase() ||
        String(c.id) === String(o)
    );
    if (found) {
      ownedNames.add(found.name);
      ownedIssuers.add(found.issuer);
    }
  }

  const ecosPref =
    profile.preferredEcosystem || profile.ecosystem || "Any";
  const travelFreq =
    profile.travelFrequency || profile.travelFreq || "Never";
  const rewardPref =
    profile.rewardPreference || profile.rewardPref || "Cash Back";

  const scored = eligible.map((card) => {
    let reasons = [];
    const base = estimateRewardsForCard(card, spending);
    let multiplier = 1.0;

    const issuer = (card.ecosystem || card.issuer || "").toLowerCase();
    const level = (card.level || "").toLowerCase();

    // Student boost
    if (profile.isStudent && card.studentFriendly) {
      multiplier *= 1.2;
      reasons.push("Good for students");
    }

    // Ecosystem preference match
    if (ecosPref && ecosPref !== "Any") {
      if (issuer.includes(ecosPref.toLowerCase())) {
        multiplier *= 1.1;
        reasons.push(`Matches preferred ecosystem (${ecosPref})`);
      }
    }

    // Ecosystem synergy (example: Chase Freedom + Sapphire)
    if (
      ownedNames.has("Chase Freedom Flex") ||
      ownedNames.has("Chase Freedom Unlimited")
    ) {
      if (card.name.toLowerCase().includes("sapphire")) {
        multiplier *= 1.4;
        reasons.push("Boosted because you own Chase Freedom — strong pairing");
      }
    }

    if (ownedNames.has("Amex Gold")) {
      if (card.name.toLowerCase().includes("platinum")) {
        multiplier *= 1.4;
        reasons.push("Boosted due to Amex ecosystem synergy");
      }
    }

    if (ownedNames.has("Capital One SavorOne")) {
      if (card.name.toLowerCase().includes("venture")) {
        multiplier *= 1.4;
        reasons.push("Works well with Venture ecosystem you already have");
      }
    }

    if (ownedIssuers.has(card.ecosystem || card.issuer)) {
      multiplier *= 1.05;
      reasons.push("Same ecosystem as cards you already own");
    }

    // Reward preference scoring
    const r = (cat) =>
      (card.rewards && (card.rewards[cat] || card.rewards.default)) || 0;

    if (rewardPref === "Cash Back") {
      const strongCash = r("groceries") + r("dining") >= 6;
      if (strongCash) {
        multiplier *= 1.07;
        reasons.push("Strong cash back benefits");
      }
      if (level === "premium" && r("travel") >= 3) {
        multiplier *= 0.9;
        reasons.push("Premium travel card penalized under cash back preference");
      }
    }

    if (rewardPref === "Points/Miles") {
      if (r("travel") >= 3 || r("dining") >= 3) {
        multiplier *= 1.08;
        reasons.push("Optimized for points + travel earning");
      }
      const pureCash =
        (card.rewards && (card.rewards.default || 0) >= 2) &&
        !(r("travel") >= 3 || r("dining") >= 3);
      if (pureCash) {
        multiplier *= 0.95;
        reasons.push("Cash-back card penalized due to points preference");
      }
    }

    // Travel frequency logic
    if (String(travelFreq).toLowerCase() === "often" && r("travel") >= 3) {
      multiplier *= 1.1;
      reasons.push("Better for frequent travelers");
    }
    if (String(travelFreq).toLowerCase() === "never" && r("travel") >= 3) {
      multiplier *= 0.8;
      reasons.push("Travel rewards de-emphasized");
    }

    // Rotating categories benefit
    if (card.rotatingCategories) {
      multiplier *= 1.05;
      reasons.push("Rotating category bonus potential");
    }

    // Transfer partner synergy
    if (card.unlockTransferPartners) {
      const match = Array.from(ownedIssuers).some(
        (e) => e.toLowerCase() === issuer
      );
      if (match) {
        multiplier *= 1.4;
        reasons.push("Unlocks transfer partners useful with your existing cards");
      }
    }

    const adjustedAnnual = Number((base.annual * multiplier).toFixed(2));
    const adjustedMonthly = Number((adjustedAnnual / 12).toFixed(2));

    return {
      id: card.id,
      name: card.name,
      estimates: {
        monthly: adjustedMonthly,
        annual: adjustedAnnual
      },
      owned: ownedNames.has(card.name),
      reasons // <-- NEW: explanation list
    };
  });

  // Best by category (unchanged)
  const categories = Object.keys(spending || {});
  const bestByCategory = {};

  for (const cat of categories) {
    let best = null;
    for (const card of eligible) {
      const rate =
        (card.rewards && (card.rewards[cat] || card.rewards.default)) || 0;
      if (!best || rate > best.rate) {
        best = { id: card.id, name: card.name, rate };
      }
    }
    if (best) bestByCategory[cat] = best;
  }

  // Top 3 overall
  const sorted = scored
    .slice()
    .sort((a, b) => b.estimates.annual - a.estimates.annual);
  const bestOverall = sorted.slice(0, 3);

  return { scored, bestByCategory, bestOverall };
}

module.exports = { isEligible, estimateRewardsForCard, recommendCards };