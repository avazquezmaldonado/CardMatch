# CardMatch

CardMatch is a capstone project (CSCI 4208) — a small web app that recommends and optimizes credit cards for a user based on their spending, credit score, number of recent accounts opened (5/24), and cards they already hold.

This repo contains lightweight frontend and backend scaffolding, JSON-based data, and documentation for the 9 capstone milestones.

Quick start (development):

1. Backend

- Install dependencies and run the server

```bash
cd backend
npm install
node app.js
```

The backend runs on port 4000 by default and serves a few API routes described in `/backend`.

2. Frontend

Open `frontend/index.html` in a browser (it uses fetch to call the backend on localhost:4000).

Files & folders

- `/frontend` — static frontend (HTML + Tailwind + vanilla JS)
- `/backend` — Node.js + Express server scaffolding, simple JSON datastore access, and rewards service
- `/data` — sample JSON files (cards, user profile, spending)
- `/docs` — milestone documentation drafts

Next steps

- Implement server persistence or swap to SQLite
- Add authentication and user management (optional)
- Improve recommendation algorithms and add tests
- Deploy frontend (Netlify) and backend (Render) — see milestone 9 draft in `/docs`.

Author: Angel Vazquez Maldonado
Date: 2025-11-14
