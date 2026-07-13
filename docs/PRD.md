# PRD: Idea Vault — Full Build

## Problem Statement

There is no platform for users to share ideas and receive community feedback in a structured, binary format. Existing platforms either bury idea feedback in comments, use upvote-only systems that lose negative signal, or lack the simplicity needed for quick idea validation.

## Solution

Build a MERN stack application (MongoDB, Express, React, Node.js) called **Idea Vault** where registered users post ideas publicly, and the community votes them good or bad. The author controls the lifecycle of their ideas. The app prioritizes simplicity and functionality over feature density.

## User Stories

### Authentication

1. As a visitor, I want to register with my email and password, so that I can post ideas and vote
2. As a visitor, I want to log in with my email and password, so that I can access my account
3. As a logged-in user, I want to log out, so that my session is terminated
4. As a logged-in user, I want my session to persist across page refreshes, so that I don't have to log in repeatedly
5. As a user, I want to see clear validation errors on registration (missing fields, invalid email, weak password, duplicate email), so that I can fix my input

### Ideas

6. As a logged-in user, I want to create an idea with a title and description, so that I can share it publicly
7. As a logged-in user, I want my idea to be created with status `open` by default, so that it immediately accepts votes
8. As a logged-in user, I want to see a list of all public ideas on a home feed, so that I can browse what others have posted
9. As a logged-in user, I want to sort the feed by newest (default) or most voted, so that I can discover ideas in different ways
10. As a logged-in user, I want to filter ideas by status (open, closed, all), so that I can focus on what interests me
11. As a logged-in user, I want to search ideas by keyword in title and description, so that I can find specific topics
12. As a logged-in user, I want to view a single idea with its title, description, status, score, and comments, so that I can evaluate it fully
13. As the author of an idea, I want to see my ideas distinguished from others, so that I know which ones I own
14. As the author, I want to close my idea, so that voting is locked and the discussion is considered complete
15. As the author, I want to reopen my closed idea, so that I can accept new votes if I change my mind
16. As a non-author user, I want to see that a closed idea no longer accepts votes, so that I understand the idea's lifecycle state

### Voting

17. As a logged-in user, I want to vote "good" or "bad" on an open idea that is not mine, so that I can share my opinion
18. As a logged-in user, I want to see the score (good count, bad count, percentage) on each idea, so that I can gauge community sentiment at a glance
19. As a logged-in user, I want to see my own vote highlighted on ideas I've voted on, so that I know my stance
20. As a logged-in user, I want to change my vote on an open idea, so that I can update my opinion
21. As a logged-in user, I want to be prevented from voting on my own idea, so that self-promotion doesn't skew results
22. As a logged-in user, I want to be prevented from voting on a closed idea, so that the author's decision to close is respected
23. As a logged-in user, I want to see only one vote per user per idea enforced, so that the score is accurate

### Comments

24. As a logged-in user, I want to add a comment on any idea, so that I can contribute to the discussion
25. As a logged-in user, I want to see all comments on an idea, so that I can read the conversation
26. As a logged-in user, I want to edit my own comments, so that I can fix mistakes
27. As the author of an idea, I want to delete any comment on my idea, so that I can moderate the discussion
28. As a non-author user, I want to see that I cannot delete comments that aren't mine, so that moderation boundaries are clear
29. As a logged-in user, I want to see who wrote each comment and when, so that I have context on the conversation

### User Profile

30. As a logged-in user, I want to see a profile page listing my ideas, so that I can track what I've posted
31. As a logged-in user, I want to see a count of ideas I've posted, so that I have a sense of my contributions

### General UX

32. As a user, I want the app to be responsive, so that I can use it on mobile and desktop
33. As a user, I want to see loading states while data is fetched, so that I know the app is working
34. As a user, I want to see meaningful error messages when something goes wrong, so that I understand what happened
35. As a user, I want to be redirected appropriately after actions (e.g., login → home, create idea → idea page), so that the flow feels natural

## Implementation Decisions

### Architecture

- **Monorepo structure**: Single repository with `client/` (React) and `server/` (Express) directories, plus a shared `package.json` at root for scripts
- **No TypeScript**: Plain JavaScript throughout, per user preference
- **Stateless auth**: JWT-based authentication. Token stored in httpOnly cookie on the client. No server-side sessions.

### Data Model

**User**
- `email` (string, unique, required)
- `password` (string, hashed with bcrypt)
- `name` (string, required)
- `createdAt` (timestamp)

**Idea**
- `title` (string, required)
- `description` (string, required)
- `status` (enum: `open`, `closed`, default: `open`)
- `author` (ObjectId ref → User, required)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Vote**
- `idea` (ObjectId ref → Idea, required)
- `user` (ObjectId ref → User, required)
- `value` (enum: `good`, `bad`)
- Compound unique index on `(idea, user)` — one vote per user per idea

**Comment**
- `text` (string, required)
- `idea` (ObjectId ref → Idea, required)
- `author` (ObjectId ref → User, required)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### API Contracts

**Auth**
- `POST /api/auth/register` — `{ email, password, name }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/auth/me` — (cookie) → `{ user }`
- `POST /api/auth/logout` — clears cookie

**Ideas**
- `GET /api/ideas` — query params: `sort` (newest|popular), `status` (open|closed|all), `search` (keyword) → `{ ideas[], total, page }`
- `GET /api/ideas/:id` — → `{ idea }` (includes score, comment count)
- `POST /api/ideas` — `{ title, description }` → `{ idea }`
- `PATCH /api/ideas/:id` — `{ status }` (author only) → `{ idea }`

**Votes**
- `POST /api/ideas/:id/votes` — `{ value: "good"|"bad" }` → `{ score }` (creates or updates)
- `DELETE /api/ideas/:id/votes` — removes user's vote → `{ score }`

**Comments**
- `GET /api/ideas/:id/comments` — → `{ comments[] }`
- `POST /api/ideas/:id/comments` — `{ text }` → `{ comment }`
- `PATCH /api/ideas/:ideaId/comments/:commentId` — `{ text }` (author only) → `{ comment }`
- `DELETE /api/ideas/:ideaId/comments/:commentId` — (idea author only) → `{ success: true }`

**Users**
- `GET /api/users/:id/ideas` — → `{ ideas[] }`

### Score Computation

Score is computed at read time, not stored. The API aggregates votes per idea:
```
score = { good: count(value="good"), bad: count(value="bad"), percentage: good / (good + bad) * 100 }
```
If no votes exist, percentage defaults to 0. Score is included in idea responses and the ideas list.

### Seed Data

A seed script will populate the database with:
- 3 sample users (with hashed passwords)
- 10 sample ideas (mix of open/closed, varied descriptions)
- ~30 sample votes (distributed across ideas)
- ~15 sample comments (distributed across ideas)

## Testing Decisions

### Seam Strategy

Two primary seams for testing, from highest to lowest:

1. **API contract tests (highest seam)** — Test the full HTTP request/response cycle for every endpoint. This catches routing, middleware, validation, and response shape issues in one pass. Use supertest against the Express app.

2. **Unit tests for score computation** — The score calculation (good count, bad count, percentage) is pure logic extracted into a utility function. Test it in isolation with various vote distributions including edge cases (zero votes, all good, all bad, tied).

### What Makes a Good Test

- Test **external behavior** (what the API returns, what the DB stores) not implementation details (how middleware chains work internally)
- Each test should be **independent** — no shared state between tests
- Use **real database operations** against a test database, not mocks, for integration tests
- Mock only what's external and不可控 (e.g., bcrypt hashing is mocked to speed up tests)

### Prior Art

This is a greenfield project — no prior tests exist. The testing approach follows standard Express/Mongoose integration testing patterns.

## Out of Scope

- Social auth (Google, GitHub login)
- Rich text / markdown in idea descriptions or comments
- File/image uploads
- Notifications (email or in-app)
- Admin roles or moderation beyond author rights
- Idea editing by author (only status can be changed)
- Undo/delete for ideas
- Pagination for comments (assumed small volume initially)
- Rate limiting (can be added later)
- WebSocket / real-time updates
- Mobile app (responsive web only)
- Deployment configuration (Docker, CI/CD)

## Further Notes

- The app name is "Idea Vault" — all user-facing text should use this name
- The design should be clean and minimal — focus on content, not decoration
- Error responses should follow a consistent shape: `{ error: { message, field? } }`
- All timestamps should be ISO 8601 format
- The seed script should be runnable via `npm run seed` from the server directory
