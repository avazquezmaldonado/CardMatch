# Capstone Milestone 09 — Final Demo & Submission

## Project Summary: CardMatch

CardMatch is a personalized credit card recommendation platform that matches users with the best cards for their spending habits. The system goes beyond basic comparison by running actual reward calculations based on your monthly spending and applying intelligent multipliers for ecosystem synergy, travel preferences, and card tier compatibility. Privacy is at the core—we don't store user data. Everything processes in real-time, and users can export their results to keep their own records.

---

## Key Features Implemented

### Smart Recommendation Algorithm
- **Eligibility Filtering** — Automatically removes cards users can't qualify for based on credit score, account history, and student status
- **Chase 5/24 Rule** — If users opened 5+ accounts in 24 months, Chase cards are filtered out
- **Real Reward Calculations** — For every card, we calculate: `(monthly spend × 12 × reward rate × point value) - annual fee`
- **Intelligent Multipliers** — Cards get boosted or penalized based on ecosystem match, owned cards, travel frequency, and reward preferences
- **Personalized Rankings** — Top 3 cards are selected based on actual estimated annual rewards after all adjustments
- **Category Champions** — System identifies which card gives the best rewards for each spending category

### Data Model
- **22 credit cards** including premium, mid-tier, beginner, student, secured, and store cards
- **Real card images** for visual recognition
- **Comprehensive metadata** per card: issuer, ecosystem, level, annual fee, reward rates by category, point values, eligibility requirements
- **User profile inputs**: credit score, accounts opened (24 months), student status, preferred ecosystem, travel frequency, reward preference
- **Spending categories**: groceries, dining, travel, gas, other

### UI/UX Features
- **Modern interface** with Tailwind CSS and custom gradients
- **CardMatch logo and favicon** for brand identity
- **Card image display** showing actual credit card product photos
- **Reward category badges** (5x Dining, 6x Groceries, etc.) with color-coded styling
- **Card tier labels** (Beginner, Mid-Tier, Premium) with appropriate color coding
- **Annual fee display** clearly marked with red for fees, green for no-fee cards
- **Spending pie chart** visualizing your monthly budget breakdown using D3.js
- **Export/Import functionality** so users can save and reload their analysis as JSON files
- **About Us page** explaining the privacy-first philosophy
- **Responsive design** that works on desktop, tablet, and mobile

### Privacy & Data Control
- **No server-side storage** — user data never gets saved to a database
- **localStorage only** — form data persists in your browser for convenience, but never leaves your device
- **Export to JSON** — download your complete analysis including profile, spending, and recommendations
- **Import from JSON** — upload previous exports to review or compare past scenarios
- **Transparent processing** — all calculations happen server-side but nothing is logged or retained

---

## File Structure

```
CardMatch/
├── assets/
│   ├── [22 credit card images].png
│   ├── logo.svg
│   └── favicon.svg
├── backend/
│   ├── app.js (Express server)
│   ├── package.json
│   ├── routes/cards.js
│   ├── controllers/cardsController.js
│   ├── services/
│   │   ├── dataStore.js (loads cards.json)
│   │   ├── rewardsService.js (core algorithm)
│   │   └── validator.js
│   └── tests/
│       └── rewardsService.test.js
├── frontend/
│   ├── index.html (main app)
│   ├── about.html (privacy/info page)
│   ├── styles.css
│   └── src/main.js (frontend logic + import/export)
├── data/
│   ├── cards.json (22 cards with full details)
│   ├── profile.json
│   └── spending.json
├── docs/
│   └── capstone-01.md through capstone-09-final-demo.md
└── README.md
```

---

## Local Development & Testing

### Backend Setup
```bash
cd backend
npm install
node app.js
# Server runs on http://localhost:4000
```

### Frontend Setup
```bash
# Simply open frontend/index.html in your browser, or use a local server:
python3 -m http.server 5500
# Then visit http://localhost:5500/frontend/
```

### API Endpoint
**POST** `/api/cards/recommend`
- **Request**: `{ profile, spending, ownedCards }`
- **Response**: `{ scored, bestByCategory, bestOverall }`

Example curl request:
```bash
curl -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "creditScore": 740,
      "accountsOpened24": 0,
      "isStudent": false,
      "preferredEcosystem": "Any",
      "travelFrequency": "Sometimes",
      "rewardPreference": "Cash Back"
    },
    "spending": {
      "groceries": 500,
      "dining": 150,
      "travel": 200,
      "other": 50
    }
  }'
```

---

## Live Deployment (Optional)

### Frontend: Netlify
1. Push repository to GitHub
2. In Netlify: connect GitHub repo, set build command: `echo "Static site"`, publish directory: `frontend/`
3. Deploy button: [Connect to Netlify](https://app.netlify.com)

### Backend: Render
1. Create a new Web Service on [Render](https://render.com)
2. Connect GitHub repository, select `backend/` directory
3. Set start command: `node app.js`
4. Add environment variable: `PORT` = 4000 (Render sets this automatically)
5. Enable CORS in backend if needed (already configured in `app.js`)

**CORS URL for deployed frontend → backend**:
If frontend is deployed to `https://cardmatch.netlify.app` and backend to `https://cardmatch-api.onrender.com`, update the fetch URL in `frontend/src/main.js`:
```javascript
const res = await fetch('https://cardmatch-api.onrender.com/api/cards/recommend', {...})
```

---

## Demo Script (7-10 minutes)

### Opening (30 seconds)
"CardMatch is a credit card recommendation tool that does two things: first, it calculates how much money you'd actually earn with each card based on your real spending. Second, it keeps you in control of your data—we don't store anything. You export it, you own it."

### Scenario 1: Grocery-Heavy Spender
**Setup:**
- Credit Score: 740
- Accounts opened: 0
- Student: No
- Ecosystem: Any
- Travel: Sometimes
- Preference: Cash Back
- **Spending**: $500 groceries, $150 dining, $200 travel, $50 other

**What Happens:**
1. Click "Get Recommendations"
2. Top 3 appears with real card images
3. **#1: Citi Custom Cash** — $442.98/year (5x Groceries, 5x Dining, No Fee, Mid-Tier)
4. **#2: Discover It** — $384.24/year (5x Groceries, Rotating, No Fee, Beginner)
5. **#3: Amex Blue** — $328.49/year (6x Groceries, $95 Fee, Premium)

**Talking Points:**
- "Notice Citi wins even though Amex has higher grocery rewards (6% vs 5%). That's because Citi doesn't charge an annual fee and gives 5% on dining too. The algorithm accounts for your entire spending pattern, not just one category."
- "Each card shows the reward categories with badges—5x Dining, 6x Groceries, etc."
- "You can see the tier: Beginner, Mid-Tier, Premium. This helps you understand what kind of card it is."

### Scenario 2: Student with Low Credit
**Setup:**
- Credit Score: 580
- Accounts opened: 0
- Student: Yes
- Ecosystem: Any
- Travel: Never
- Preference: Cash Back
- **Spending**: $200 groceries, $100 dining, $0 travel, $50 other

**What Happens:**
1. System automatically filters out premium cards
2. Top 3 includes Student Cash Back, Discover It Student Chrome, Capital One Secured
3. No Chase Sapphire or Amex Platinum appear (too high minimum credit score)

**Talking Points:**
- "The algorithm enforces real-world eligibility rules. Students with credit scores under 630 only see secured, student, or beginner cards."
- "This prevents recommending cards you can't actually get approved for."
- "Notice the 'Student' and 'Secured' tier badges on the cards shown."

### Scenario 3: Travel Points Optimizer
**Setup:**
- Credit Score: 750
- Accounts opened: 1
- Student: No
- Ecosystem: Chase
- Travel: Often
- Preference: Points/Miles
- **Spending**: $300 groceries, $200 dining, $400 travel, $100 other

**What Happens:**
1. Algorithm applies ecosystem bonus (Chase preference)
2. Travel cards get boosted due to "Often" travel frequency
3. Chase Sapphire Preferred or Reserve appears in top 3
4. Shows higher rewards despite annual fees because point values are multiplied (1.25x or 1.5x)

**Talking Points:**
- "For travelers who want points instead of cash back, the math changes. Chase Sapphire points are worth 1.25 cents each when redeemed through their portal."
- "The algorithm multiplies: $400 travel × 12 months × 3% × 1.25 = higher effective value"
- "This is why premium cards with annual fees can still win if you spend enough in bonus categories."

### Export/Import Demo
**What to Show:**
1. After getting recommendations, click "Export Results"
2. JSON file downloads with timestamp
3. Show the file contents briefly: profile, spending, and recommendations all saved
4. Change the form inputs (different credit score, different spending)
5. Click "Import Previous Results"
6. Upload the JSON file
7. Form repopulates with old data, and recommendations reappear

**Talking Points:**
- "This export contains everything—your profile, your spending, and the recommendations. You can keep this file forever."
- "Want to compare scenarios? Export one, change your inputs, run new recommendations, then import the old file in another tab."
- "Financial advisors love this feature because their clients can bring their analysis to appointments."

### About Us Page
**What to Show:**
1. Navigate to About Us
2. Scroll through privacy commitments

**Talking Points:**
- "We're upfront about privacy. We process your information but never store it. No databases, no tracking."
- "Your data stays in your browser's localStorage or in the JSON files you export."
- "This is different from credit card websites that want your email, phone number, and sell your information to banks."

---

## Key Improvements Made (From Earlier Milestones)

**Expanded card database** — Now includes 22 cards covering all tiers (beginner, mid, premium, student, secured, store cards)  
**Real card images** — Each card displays its actual product photo from the assets folder  
**Reward category badges** — Visual indicators showing 5x, 6x multipliers per category  
**Card tier labels** — Color-coded badges (green for Beginner, blue for Mid-Tier, purple for Premium)  
**Annual fee transparency** — Red badges for cards with fees, green for no-fee cards  
**Export/Import system** — Users can save and reload their complete analysis  
**About Us page** — Dedicated privacy explanation page with brand messaging  
**Logo and favicon** — Custom SVG branding throughout the app  
**Spending chart** — D3.js pie chart showing budget breakdown  
**Intelligent multipliers** — Ecosystem synergy (1.4x if you own complementary cards), student bonuses (1.2x), travel frequency adjustments  
**Weighted average rates** — Each card shows personalized rate based on actual spending mix  

---

## Testing Checklist

- [x] Backend starts without errors on port 4000
- [x] Frontend loads properly with logo and favicon
- [x] Clicking "Get Recommendations" returns top 3 cards within 2 seconds
- [x] Credit score of 580 shows only beginner/student/secured cards
- [x] Credit score of 750 includes premium cards
- [x] Chase 5/24 rule blocks Chase cards when accountsOpened24 >= 5
- [x] Student checkbox filters to student-friendly cards
- [x] Ecosystem preference boosts matching cards (e.g., "Chase" preference boosts Chase cards)
- [x] Travel frequency "Often" boosts travel-heavy cards
- [x] Travel frequency "Never" penalizes travel-heavy cards
- [x] Reward preference "Cash Back" prioritizes flat-rate cash cards
- [x] Reward preference "Points/Miles" prioritizes transfer-partner cards
- [x] Export button downloads JSON file with correct data
- [x] Import button accepts JSON and restores profile + spending + recommendations
- [x] Card images display correctly for all 22 cards
- [x] Reward category badges show correct multipliers (5x, 6x, etc.)
- [x] Annual fees display correctly (red for fees, green for no-fee)
- [x] Spending pie chart renders with correct percentages
- [x] About Us page loads and explains privacy policy
- [x] Responsive design works on mobile, tablet, desktop
- [x] "Load Sample Data" button populates example values

---

## Submission Contents

Include in your final submission:

1. **Full source code** — All folders: `assets/`, `backend/`, `frontend/`, `data/`, `docs/`
2. **Documentation** — All capstone milestone files (capstone-01 through capstone-09)
3. **README.md** — Quick start guide with setup instructions
4. **Screenshots/Demo video** — Show the app running with 2-3 different user profiles
5. **JSON export example** — Include a sample exported file to demonstrate the feature

---

## Algorithm Explanation (For Technical Questions)

### How Rewards Are Calculated

For each eligible card, the system runs this calculation:

```
1. For each spending category (groceries, dining, travel, other):
   categoryReward = monthlySpend × 12 months × rewardRate × pointValue

2. Sum all category rewards:
   totalRewards = groceriesReward + diningReward + travelReward + otherReward

3. Subtract annual fee:
   netRewards = totalRewards - annualFee

4. Apply multipliers based on user preferences:
   - Student + student-friendly card: ×1.2
   - Ecosystem match: ×1.1
   - Ecosystem synergy (owned cards): ×1.4
   - Strong cash back: ×1.07
   - Travel card + frequent traveler: ×1.1
   - Travel card + never travels: ×0.8
   - Rotating categories: ×1.05

5. Final score = netRewards × multipliers
```

**Example:**
- User spends $500/month on groceries
- Card offers 6x groceries (6% back)
- Point value: 1.0 (straight cash back)
- Annual fee: $95

Calculation:
```
$500 × 12 = $6,000/year spent
$6,000 × 0.06 = $360 in rewards
$360 - $95 = $265 net annual value
```

If the user is a student and the card is student-friendly:
```
$265 × 1.2 = $318 adjusted value
```

This adjusted value is what gets ranked.

---

## Future Enhancements (Beyond Capstone Scope)

- User accounts with authentication
- Database storage (PostgreSQL) for saved profiles
- Bonus category tracking (signup bonuses, referral bonuses)
- Real-time card offer integration via bank APIs
- Mobile app version (React Native)
- Multi-user comparison tool for couples/families
- Annual fee waiver tracking for first-year offers
- Credit card application tracker
- Rewards redemption calculator (booking flights vs. cash back)

---

**Date**: December 10, 2025  
**Author**: Angel Vazquez Maldonado  
**Course**: CSCI 4208 (Capstone)
