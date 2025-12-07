# Portfolio Submission Guide

This document explains how to submit your CardMatch capstone to the CSCI 4208 portfolio.

## Submission Structure Required

According to the submission guidelines, you need to create pointer READMEs in your **portfolio repository** (`csci4208-portfolio-2025`) at:

```
csci4208-portfolio-2025/capstone/
├── capstone-01/README.md
├── capstone-02/README.md
├── capstone-03/README.md
├── capstone-04/README.md
├── capstone-05/README.md
├── capstone-06/README.md
├── capstone-07/README.md
├── capstone-08/README.md
└── capstone-09/README.md
```

## What Each Pointer README Should Contain

Each README in your portfolio repo should follow this template:

```markdown
# <Capstone Milestone Title> — <capstone-key>

**Team repo:** https://github.com/avazquezmaldonado/CardMatch
**Project (v2) board:** https://github.com/avazquezmaldonado/CardMatch/projects/1
**Live demo / recording (if applicable):** <URL if available>

## Deliverables for this phase
- [List items mapped to the rubric]

## Summary (what we produced)
- [Brief description of phase output]

## Evidence / Artifacts
- [Link to docs/capstone-XX.md in CardMatch repo]
- [Link to relevant code/PRs]
- [Screenshots/diagrams]

## Notes & Risks
- [Any blockers or decisions made]
```

## Your CardMatch Documentation

You already have excellent capstone documentation in this repository:
- `docs/capstone-01.md` - Project Proposal
- `docs/capstone-02-planning.md` - Planning & Specification  
- `docs/capstone-03-frontend-design.md` - Frontend Design
- `docs/capstone-04-backend-design.md` - Backend Design
- `docs/capstone-05-data-design.md` - Data Design
- `docs/capstone-06-client-audit.md` - Client Layer Audit
- `docs/capstone-07-server-audit.md` - Server Layer Audit
- `docs/capstone-08-data-audit.md` - Data Layer Audit
- `docs/capstone-09-final-demo.md` - Final Demo

## How to Complete Your Portfolio Submission

1. **Navigate to your portfolio repository:**
   ```bash
   cd /path/to/csci4208-portfolio-2025
   ```

2. **Create the capstone folder structure:**
   ```bash
   mkdir -p capstone/{capstone-01,capstone-02,capstone-03,capstone-04,capstone-05,capstone-06,capstone-07,capstone-08,capstone-09}
   ```

3. **For each capstone-XX folder, create a README.md that:**
   - Links to the CardMatch repository: `https://github.com/avazquezmaldonado/CardMatch`
   - Links to your Project board: `https://github.com/avazquezmaldonado/CardMatch/projects/1`
   - Links to the corresponding capstone doc in this repo
   - Summarizes what was delivered in that phase
   - Lists any key artifacts or evidence

4. **On your Project (v2) board:**
   - Ensure it's public or shared with instructors
   - Create/update issues for each capstone phase
   - Add appropriate labels: `capstone`, `capstone-0X`, and track labels
   - Use status labels as you progress

5. **In your Project (v2) board for each milestone:**
   - Check off acceptance criteria
   - Add `ready-for-approval` label when complete
   - Link to the pointer README in your portfolio repo

## Example: capstone-01 Pointer README

Here's what your `capstone-01/README.md` might look like:

```markdown
# Project Proposal — capstone-01

**Team repo:** https://github.com/avazquezmaldonado/CardMatch  
**Project (v2) board:** https://github.com/avazquezmaldonado/CardMatch/projects/1  
**Live demo / recording (if applicable):** Demo available after capstone-09

## Deliverables for this phase
- Team roster and project title
- High-level abstract of vision and goals
- Problem statement and proposed solution
- Initial scope and feature list
- Technology stack selection
- Timeline and milestones overview

## Summary (what we produced)
CardMatch is a credit card recommendation engine that helps users discover the best cards based on their profile and spending patterns. Key features include intelligent scoring, real-time recommendations, and personalized card suggestions.

**Technology Stack:**
- Frontend: HTML5, Tailwind CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Data: JSON-based
- Testing: Jest + integration tests

## Evidence / Artifacts
- [Detailed proposal](https://github.com/avazquezmaldonado/CardMatch/blob/main/docs/capstone-01.md)
- [Full README with overview](https://github.com/avazquezmaldonado/CardMatch#readme)
- [Team GitHub repo](https://github.com/avazquezmaldonado/CardMatch)

## Notes & Risks
- Solo project with well-defined scope
- No external API dependencies
- Proven technology stack
```

## Key Points to Remember

- **Don't copy code** into your portfolio repo—they're just pointers
- **All implementation stays** in your CardMatch repo
- **Reference your existing docs** (capstone-01.md through capstone-09.md) in the pointer READMEs
- **Keep your Project board updated** with status labels
- **Make sure your repo and board are public** or accessible to instructors

## Current CardMatch Status

✓ All 9 capstone milestones documented  
✓ 21/21 tests passing (100%)  
✓ All features implemented (A/100 grade)  
✓ Ready for final submission  

Next step: Create the pointer READMEs in your portfolio repository!
