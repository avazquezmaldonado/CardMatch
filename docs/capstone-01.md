# Capstone Milestone 01 — Project Proposal

## Project Abstract

CardMatch is a small web application that recommends the best credit cards to users based on their spending profile, credit score, number of recently opened accounts (5/24 rule), and the cards they already own. The system computes estimated monthly and annual rewards per card and suggests the best combination of cards for overall rewards while filtering out ineligible options.

## Team Roster

- Angel Vazquez Maldonado (solo developer)

## Problem Statement

Choosing the best credit cards and combinations can be difficult for consumers. Many cards offer category-specific rewards, signup bonuses, and different reward structures. Users often don't have the time or expertise to compare dozens of cards and estimate the rewards they could realistically earn based on their spending.

## Solution Summary

CardMatch provides a simple, privacy-preserving way to input a user's spending by category, credit score, recent accounts opened, and cards on-hand. The system returns:

- Best card for each spending category
- Estimated monthly and annual rewards for each card
- Best overall combination of cards
- Eligibility filtering (credit score thresholds, 5/24 rules)

No external APIs are required — all data and logic are internal and stored in simple JSON files (or SQLite) to keep the project compact and suitable for a single-student capstone.

## High-level Feature List

- User profile: credit score, zip code (optional), number of accounts opened in last 24 months
- Spending input: monthly spend per category (e.g., groceries, dining, travel)
- Card catalog: internal JSON of card reward structures and eligibility rules
- Recommendation engine: match cards to categories and compute estimated rewards
- Filters: hide ineligible cards based on credit score and 5/24
- UI: simple screens to enter profile, spending, and view recommendations
- Export: download recommendations as JSON (basic)

## Links

- Project plan: See `/docs/capstone-02-planning.md`
- UI mockups: See `/docs/capstone-03-frontend-design.md`
- API spec: See `/docs/capstone-04-backend-design.md`


---

All milestone documents are available in the `/docs` folder. This project document has been expanded into detailed milestone docs for planning, design, and audits in subsequent commits.