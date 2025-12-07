# CardMatch — Credit Card Recommendation Engine

CardMatch is a capstone project (CSCI 4208) — a web application that recommends credit cards based on a user's spending profile, credit score, and preferences.

## Overview

This project demonstrates full-stack web development with:
- **Frontend**: HTML + Tailwind CSS + vanilla JavaScript
- **Backend**: Node.js + Express API
- **Data**: JSON-based card catalog and user profiles
- **Documentation**: 9 milestone capstone documents

## My Approach

I built CardMatch to solve a real problem: picking the best credit card is hard without manually comparing dozens of cards and doing complex math. My solution:
1. Let users input their profile (credit score, spending habits)
2. Calculate rewards for each eligible card based on their spending
3. Show the top 3 cards + best card per category

The scoring algorithm applies business rules (like Chase's 5/24 rule) and preferences to calculate realistic annual rewards values.

## Features

- Dynamic Recommendations — Changes based on your spending
- Eligibility Checking — Filters by credit score and rules
- Category Breakdown — Best card for groceries, dining, travel, etc.
- Responsive Design — Works on desktop and mobile
- Real-time Results — See recommendations immediately

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```
Backend runs on **http://localhost:4000**

### Frontend Setup
Open `frontend/index.html` in a browser, or use Python's HTTP server:
```bash
python3 -m http.server 8000
# Visit http://localhost:8000/frontend/
```

## How It Works

1. **User Input** → Enter credit score, spending amounts, preferences
2. **Eligibility Filter** → Backend checks if you qualify for each card
3. **Score Calculation** → For each eligible card: (monthly × 12 × rate × point value) - annual fee
4. **Apply Modifiers** → Boost score if card matches your preferences
5. **Rank & Display** → Sort by annual value, show top 3 + best by category

## API

**POST** `/api/cards/recommend`

Request:
```json
{
  "profile": {
    "creditScore": 750,
    "accountsOpened24": 2,
    "isStudent": false,
    "preferredEcosystem": "Chase",
    "travelFrequency": "Often",
    "rewardPreference": "Points/Miles"
  },
  "spending": {
    "groceries": 400,
    "dining": 200,
    "travel": 150,
    "other": 100
  }
}
```

Response:
```json
{
  "bestByCategory": {
    "groceries": { "name": "Amex Gold", "rate": 4 },
    "dining": { "name": "Chase Sapphire Preferred", "rate": 3 }
  },
  "bestOverall": [
    { "name": "Card Name", "estimates": { "annual": 1250 } },
    { "name": "Card Name 2", "estimates": { "annual": 1100 } },
    { "name": "Card Name 3", "estimates": { "annual": 950 } }
  ]
}
```

## Project Structure

```
CardMatch/
├── backend/
│   ├── app.js              # Express server
│   ├── routes/cards.js     # API routes
│   ├── controllers/cardsController.js
│   ├── services/
│   │   ├── dataStore.js
│   │   └── rewardsService.js  # Scoring logic
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── src/main.js
├── data/
│   ├── cards.json          # 22 credit cards
│   ├── profile.json
│   └── spending.json
├── docs/
│   ├── capstone-01.md through capstone-09-final-demo.md
│   └── (Milestone documentation)
└── README.md (this file)
```

## Capstone Milestones

| # | Title | Status |
|---|-------|--------|
| 01 | Project Proposal | Complete |
| 02 | Planning & Specification | Complete |
| 03 | Frontend Design | Complete |
| 04 | Backend Design | Complete |
| 05 | Data Design | Complete |
| 06 | Client Audit | Complete |
| 07 | Server Audit | Complete |
| 08 | Data Audit | Complete |
| 09 | Final Demo & Submission | Complete |

All documentation is in `/docs`.

## Testing

### Manual Testing
1. Start backend: `npm start`
2. Open `frontend/index.html`
3. Enter credit score and spending
4. Click "Get Recommendations"
5. Check results appear

### Try It Out
- Credit score: 750, Spending: $400 groceries → See recommendations
- Credit score: 600, Spending: $200 dining → See beginner cards only
- Click "Load Sample Data" for quick test

## Key Decisions

- **No database**: Used JSON files to keep it simple and focused on the algorithm
- **Vanilla JS**: No frameworks, easier to understand the code
- **Tailwind CSS**: Fast styling without writing custom CSS
- **Modular services**: Separated scoring logic from routes for clarity

## Technologies

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Data**: JSON files
- **Docs**: Markdown

## Author

Angel Vazquez Maldonado  
CSCI 4208 Capstone Project  
December 2025

---

**Status**: Complete and ready for evaluation. All 9 milestones documented.
