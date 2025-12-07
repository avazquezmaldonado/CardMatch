# CardMatch — Credit Card Recommendation Engine

CardMatch is a capstone project (CSCI 4208) — a web application that recommends credit cards based on a user's spending profile, credit score, and preferences.

## Overview

This project demonstrates full-stack web development with:
- **Frontend**: HTML + Tailwind CSS + vanilla JavaScript
- **Backend**: Node.js + Express API
- **Data**: JSON-based card catalog and user profiles
- **Documentation**: 9 milestone capstone documents

## Features

✅ **Dynamic Recommendations** — Personalized card rankings based on user spending  
✅ **Deterministic Scoring** — Clear annual value calculation (rewards minus fees)  
✅ **Eligibility Filtering** — Credit score and student status checks  
✅ **Category Breakdown** — Best card for each spending category  
✅ **Responsive Design** — Works on desktop and mobile  
✅ **Real-time Results** — Instant feedback as users adjust inputs  

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```
Backend runs on **http://localhost:4000**

### Frontend Setup
Open `frontend/index.html` in a browser, or run a simple HTTP server:
```bash
python3 -m http.server 8000
# Visit http://localhost:8000/frontend/
```

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
│   ├── app.js              # Express entrypoint
│   ├── package.json
│   ├── routes/
│   │   └── cards.js        # API routes
│   ├── controllers/
│   │   └── cardsController.js
│   └── services/
│       ├── dataStore.js
│       └── rewardsService.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── src/
│       └── main.js
├── data/
│   ├── cards.json          # 14 credit cards with metadata
│   ├── profile.json
│   └── spending.json
├── docs/
│   ├── capstone-01.md through capstone-09-final-demo.md
│   └── (9 milestone documents)
└── README.md (this file)
```

## Capstone Milestones

| Milestone | Title | Status |
|-----------|-------|--------|
| 01 | Project Proposal | ✅ Complete |
| 02 | Planning & Specification | ✅ Complete |
| 03 | Frontend Design | ✅ Complete |
| 04 | Backend Design | ✅ Complete |
| 05 | Data Design | ✅ Complete |
| 06 | Client Audit | ✅ Complete |
| 07 | Server Audit | ✅ Complete |
| 08 | Data Audit | ✅ Complete |
| 09 | Final Demo & Submission | ✅ Complete |

All milestone documentation is in `/docs`.

## Testing

### Manual Testing
1. Start the backend: `npm start` (from `/backend`)
2. Open `frontend/index.html` in browser
3. Enter credit score, spending amounts, and preferences
4. Click "Get Recommendations"
5. Verify results display below form

### Sample Data
Click "Load Sample Data" to populate the form with test values.

## Technologies Used

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Data**: JSON files
- **Documentation**: Markdown

## Author

Angel Vazquez Maldonado  
CSCI 4208 Capstone Project  
December 2025

---

**For submission**: All milestones are complete and documented. The application is functional and ready for demonstration.
