# Capstone Milestone 09 — Final Demo & Submission

## Project Summary: CardMatch

CardMatch is a credit card recommendation engine that helps users find the best credit cards based on their financial profile, spending patterns, and preferences. The app uses a sophisticated scoring system with 9 distinct rules to personalize recommendations.

---

## Key Features Implemented

### Rules Engine (9 Business Rules)
- **Rule A: Chase 5/24** — Users who opened 5+ accounts in 24 months cannot qualify for Chase cards
- **Rule B: Low Credit Score Gating** — Credit scores < 630 see only secured/beginner/student cards; 630-679 excludes premium cards
- **Rule C: Student Logic** — Students get 1.20x boost on student-friendly cards
- **Rule D: Ecosystem Preference** — Users selecting a preferred issuer (Chase/Amex/Capital One) get 1.10x boost on matching cards
- **Rule E: Ecosystem Synergy** — Ownership of key cards unlocks 1.40x boosts on premium products (e.g., Freedom → Sapphire)
- **Rule F: Reward Type Preference** — Cash back users boosted on flat-rate cards; Points/Miles users boosted on travel-heavy cards
- **Rule G: Travel Frequency** — "Often" travelers get 1.10x on travel rewards; "Never" travelers penalized on travel cards and boosted on cashback
- **Rule H: Rotating Categories** — Cards with rotating categories receive 1.05x boost
- **Rule I: Transfer Partners** — Cards unlocking transfer partners get 1.40x if user owns a points-earning card in the ecosystem

### Data Model
- **14 credit cards** (spanning Beginner, Mid, Premium, Student, and Secured levels)
- **4 spending categories** (Groceries, Dining, Travel, Other)
- **User profile fields**: creditScore, accountsOpened24, isStudent, preferredEcosystem, travelFrequency, rewardPreference
- **Card metadata**: issuer, ecosystem, level, secured, studentFriendly, rotatingCategories, unlockTransferPartners, minCreditScore, rewards

### UI/UX Improvements
- Clean, centered design using Tailwind CSS + Inter font
- Responsive grid layout (Profile + Spending side-by-side on desktop, stacked on mobile)
- Dynamic owned-cards checkbox population from backend
- Real-time recommendation results
- Removed redundant output (now shows only **Best by Category** + **Top 3 Cards**)

---

## File Structure

```
CardMatch/
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── routes/cards.js
│   ├── controllers/cardsController.js
│   └── services/
│       ├── dataStore.js
│       └── rewardsService.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── src/main.js
├── data/
│   ├── cards.json (14 cards with full metadata)
│   ├── profile.json
│   └── spending.json
├── docs/
│   ├── capstone-01.md through capstone-08-data-audit.md
│   └── capstone-09-final-demo.md (this file)
└── README.md
```

---

## Local Development & Testing

### Backend Setup
```bash
cd backend
npm install
node app.js
# Backend runs on http://localhost:4000
```

### Frontend Setup
```bash
# Open frontend/index.html in a browser (directly, or via a simple HTTP server)
python3 -m http.server 8000
# Then visit http://localhost:8000/frontend/
```

### API Endpoint
**POST** `/api/cards/recommend`
- **Request body**: `{ profile, spending, ownedCards }`
- **Response**: `{ scored, bestByCategory, bestOverall }`

Example:
```bash
curl -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "creditScore": 750,
      "accountsOpened24": 2,
      "isStudent": false,
      "preferredEcosystem": "Chase",
      "travelFrequency": "Often",
      "rewardPreference": "Points/Miles"
    },
    "spending": { "groceries": 400, "dining": 150, "travel": 200 },
    "ownedCards": ["Chase Freedom Flex"]
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

## Demo Script (5-7 minutes)

### Scenario 1: High-Income Traveler
1. **Inputs**: Credit Score 750, 2 accounts opened, NOT student, Prefer Chase, Travel Often, Want Points/Miles
2. **Spending**: $400 groceries, $150 dining, $200 travel
3. **Owned Cards**: Check "Chase Freedom Flex"
4. **Expected Output**: Top 3 includes Chase Sapphire Preferred (transfer partner synergy boost)
5. **Talking Point**: "The app recognizes you own a Chase Freedom card and recommends Sapphire Preferred because it unlocks transfer partners for your rewards points."

### Scenario 2: Student with Low Credit
1. **Inputs**: Credit Score 580, 0 accounts, IS student, Any ecosystem, Never travel, Want Cash Back
2. **Spending**: $200 groceries, $100 dining, $50 travel
3. **Owned Cards**: None
4. **Expected Output**: Top 3 includes Student Cash Back and Capital One Secured
5. **Talking Point**: "The system applies smart gating—students with low credit see only student-friendly or secured cards. No premium cards appear because they wouldn't approve."

### Scenario 3: Medium Income, Cashback Focused
1. **Inputs**: Credit Score 680, 1 account, NOT student, Any ecosystem, Never travel, Want Cash Back
2. **Spending**: $500 groceries, $150 dining, $0 travel
3. **Owned Cards**: None
4. **Expected Output**: Top 3 includes Citi Custom Cash and Amex Blue Cash Preferred
5. **Talking Point**: "For cashback users who spend on groceries and dining, the app prioritizes high-category rewards. Citi wins here with 5% grocery + 5% dining."

---

## Key Improvements Made

✅ **Cleaned JSON data** — `cards.json` has proper formatting with 14 cards and correct metadata  
✅ **Removed duplicate UI elements** — Student checkbox appears once, not twice  
✅ **Simplified results display** — Shows only "Best by Category" + "Top 3 Cards" (removed full card list)  
✅ **Varied recommendations** — Backend returns different cards based on profile (tested with multiple scenarios)  
✅ **Full rule implementation** — All 9 business rules active and applying correctly  
✅ **Responsive design** — Mobile-friendly layout with proper grid and spacing  
✅ **Backend validation** — Low-credit users receive only eligible cards  

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads in browser at `http://localhost:8000/frontend/`
- [ ] Clicking "Get Recommendations" returns results within 2 seconds
- [ ] Changing credit score to 500 shows only secured/student cards
- [ ] Selecting "Chase" ecosystem boosts Chase cards
- [ ] Selecting "Often" travel boosts travel rewards
- [ ] Checking owned cards shows those cards marked as "(you own this)"
- [ ] "Load Sample Data" button populates default values
- [ ] Results show "Best by Category" and "Top 3 Recommended Cards"

---

## Submission Contents

Include in your submission:

1. **Source code** (`backend/`, `frontend/`, `data/`, all files)
2. **Documentation** (`docs/` folder, especially this file and other capstone milestones)
3. **README** with quick start instructions
4. **Demo proof** — Screenshots of the app running with 2-3 different profiles

---

## Future Enhancements (Out of Scope)

- User authentication & saved profiles
- Database persistence (SQLite/PostgreSQL)
- Annual fee calculations
- Bonus category customization
- Integration with Chase/Amex/Discover APIs for real card offers
- Mobile app (React Native)

---

**Date**: December 5, 2025  
**Author**: Angel Vazquez Maldonado  
**Course**: CSCI 4208 (Capstone)
