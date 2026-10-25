# PulseChat — Technical Specification

Real-time chat application with authentication, built to demonstrate production-grade
full-stack engineering: clean architecture, automated testing against MongoDB, CI/CD, and a
real deployment — not another CRUD tutorial.

This document is the single source of truth for implementing the project. Follow it card by
card (see §15). Each card is one pull request into `master`, so the repository keeps a clean,
reviewable history instead of one giant initial commit.

## 1. Pitch — why this project is worth showing

Most portfolio projects (calculators, weather apps, CEP lookups) prove you can call an API and
render a list. This project is deliberately scoped to prove things recruiters and technical
interviewers actually screen for:

- **Real-time systems** — WebSocket-based messaging, typing indicators, presence (who's online).
- **Auth done properly** — JWT access + refresh tokens, hashed passwords, protected routes.
- **Data modeling** — MongoDB/Mongoose schemas for users, rooms, and messages with indexes and
  pagination, not a single flat collection.
- **Testing discipline** — integration tests against a real MongoDB engine (via
  `mongodb-memory-server`), not mocked database calls.
- **Platform awareness** — Vercel's serverless functions cannot hold a persistent WebSocket
  connection open. Recognizing that constraint and routing the real-time transport through
  Pusher Channels (while keeping all persistence, auth, and business logic in your own API) is
  itself a signal of understanding how serverless actually works.
- **Shipping discipline** — incremental PRs, CI on every PR, a deployed URL anyone can open.

## 2. Architecture overview

```
┌──────────────┐        REST (JWT)         ┌──────────────┐        ┌───────────────┐
│   Frontend    │ ────────────────────────▶ │     API      │ ─────▶ │   MongoDB     │
│  (Vite+React) │ ◀──────────────────────── │ (Express/TS)  │        │   Atlas        │
│  Vercel proj. │                            │ Vercel proj.  │        └───────────────┘
└──────┬────────┘                            └──────┬────────┘
       │                                             │
       │ subscribe (client key)           trigger event (server key)
       ▼                                             ▼
                      ┌───────────────────────────┐
                      │   Pusher Channels          │
                      │  private-room-{id}         │
                      │  presence-room-{id}        │
                      └───────────────────────────┘
```

The frontend never talks to Pusher's trigger API directly (that would expose the secret key).
It only subscribes to channels with a short-lived auth token issued by `POST /api/pusher/auth`.
All writes go through the API, which persists to MongoDB first, then triggers the Pusher event.
This keeps MongoDB as the single source of truth — a dropped WebSocket event never causes data
loss, just a client that needs to re-sync on reconnect.

## 3. Tech stack & rationale

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vite + React + TypeScript | Fast dev loop, no framework magic to explain away in an interview |
| Styling | Tailwind CSS | Fast to build a polished, responsive UI solo |
| Frontend state/data | TanStack Query | Caching, pagination, optimistic updates for REST calls |
| Forms/validation | React Hook Form + Zod | Same Zod schemas reused to validate on the API side |
| Realtime client | pusher-js | Channel subscription, presence, typing events |
| API | Node.js + Express + TypeScript | Explicit, testable, no hidden API-route magic |
| ORM | Mongoose | Schema validation, indexes, middleware hooks |
| Auth | JWT (access + refresh) + bcrypt | Industry-standard, explainable in an interview |
| Realtime transport | Pusher Channels (free tier) | Vercel serverless can't hold sockets open; this is the correct fix, not a workaround |
| Validation | Zod | Shared schemas between layers |
| Testing (API) | Vitest + Supertest + mongodb-memory-server | Real Mongo engine in-memory, no mocked queries |
| Testing (frontend) | Vitest + React Testing Library | Component-level correctness |
| E2E | Playwright | One real happy-path test: register → send message → see it live |
| CI | GitHub Actions | Lint + typecheck + test gate on every PR |
| Hosting | Vercel (2 projects, 1 monorepo) | Matches the user's existing deploy workflow |
| Database | MongoDB Atlas (free M0 cluster) | Managed, no infra to maintain |

## 4. Monorepo structure

```
pulsechat/
├── apps/
│   ├── web/                 # Vite + React frontend
│   │   ├── src/
│   │   │   ├── api/         # typed REST client (fetch wrappers + TanStack Query hooks)
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── rooms/
│   │   │   │   └── messages/
│   │   │   ├── hooks/
│   │   │   ├── lib/         # pusher client, utils
│   │   │   ├── pages/
│   │   │   └── main.tsx
│   │   ├── tests/
│   │   └── vercel.json
│   └── api/                  # Express + TypeScript backend
│       ├── src/
│       │   ├── config/       # env, db connection, pusher client
│       │   ├── modules/
│       │   │   ├── auth/      # controller, service, routes, validation
│       │   │   ├── users/
│       │   │   ├── rooms/
│       │   │   └── messages/
│       │   ├── middleware/    # auth guard, error handler, rate limiter
│       │   ├── models/        # Mongoose schemas
│       │   ├── app.ts
│       │   └── index.ts       # Vercel serverless entry (@vercel/node)
│       ├── tests/
│       └── vercel.json
├── packages/
│   └── shared/                # Zod schemas + TS types shared by web and api
├── docs/
│   └── SPEC.md                 # this file
├── .github/workflows/ci.yml
├── package.json                # pnpm workspaces root
└── README.md
```

## 5. Data models

```ts
// User
{
  _id: ObjectId,
  username: string,        // unique, indexed
  email: string,           // unique, indexed
  passwordHash: string,
  avatarUrl?: string,
  status: "online" | "offline" | "away",
  lastSeenAt: Date,
  createdAt: Date,
}

// Room (covers both 1:1 DMs and group chats)
{
  _id: ObjectId,
  type: "dm" | "group",
  name?: string,            // required for "group"
  memberIds: ObjectId[],    // indexed
  createdBy: ObjectId,
  lastMessageAt: Date,      // indexed, drives room-list ordering
  createdAt: Date,
}

// Message
{
  _id: ObjectId,
  roomId: ObjectId,         // indexed, compound with createdAt for pagination
  senderId: ObjectId,
  content: string,          // raw text, may contain markdown + ```code``` blocks
  mentions: ObjectId[],     // userIds parsed from @username at write time
  readBy: ObjectId[],
  editedAt?: Date,
  deletedAt?: Date,
  createdAt: Date,
}
```

Indexes: `messages` → `{ roomId: 1, createdAt: -1 }` for cursor pagination; `rooms` →
`{ memberIds: 1, lastMessageAt: -1 }` for the room list; unique indexes on `users.username` and
`users.email`.

## 6. API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | public | create account |
| POST | /api/auth/login | public | returns access + refresh tokens |
| POST | /api/auth/refresh | public | rotate access token |
| POST | /api/auth/logout | private | revoke refresh token |
| GET | /api/auth/me | private | current user |
| GET | /api/users/search?q= | private | find users to start a DM |
| PATCH | /api/users/me | private | update avatar/status |
| POST | /api/rooms | private | create DM or group |
| GET | /api/rooms | private | list my rooms, sorted by lastMessageAt |
| GET | /api/rooms/:id | private | room details + members |
| POST | /api/rooms/:id/read | private | mark room as read |
| GET | /api/rooms/:id/messages?cursor&limit | private | paginated history |
| POST | /api/rooms/:id/messages | private | send message (persists, then triggers Pusher) |
| PATCH | /api/messages/:id | private | edit own message (stretch) |
| DELETE | /api/messages/:id | private | soft-delete own message (stretch) |
| POST | /api/pusher/auth | private | authorizes channel subscription for this user |

## 7. Real-time events (Pusher)

| Channel | Type | Events |
|---|---|---|
| `private-room-{roomId}` | private | `message:new`, `message:edited`, `message:deleted` |
| `presence-room-{roomId}` | presence | member_added/member_removed (built-in) → drives online dots |
| `private-room-{roomId}` | private | `typing:start`, `typing:stop` |
| `private-user-{userId}` | private | `notification:mention`, `room:updated` |

The client triggers client events for typing (`client-typing:start/stop`, enabled on the Pusher
app) to avoid a round trip through the API for something this ephemeral; everything that must be
durable (messages, reads) goes through the REST API first.

## 8. Features

**MVP (cards 1–13):**
- [ ] Register / login / logout with JWT access + refresh tokens
- [ ] Protected routes on both API and frontend
- [ ] 1:1 DMs and group rooms
- [ ] Real-time message delivery (Pusher)
- [ ] Typing indicators
- [ ] Online/offline presence
- [ ] Paginated message history (cursor-based infinite scroll)
- [ ] Read receipts
- [ ] Message search with `<mark>`-highlighted matches
- [ ] `@mention` highlighting + mention notifications
- [ ] Markdown rendering + syntax-highlighted code blocks in messages
- [ ] Rate limiting on auth and message endpoints
- [ ] Responsive UI with dark mode
- [ ] Unit + integration test suites, CI gate on every PR
- [ ] OpenAPI documentation for the API
- [ ] Both apps deployed on Vercel

**Stretch (post-MVP, separate cards once MVP is live):**
- [ ] Image/file attachments (Vercel Blob or Cloudinary)
- [ ] Emoji reactions on messages
- [ ] Message edit/delete with "edited" indicator
- [ ] Playwright E2E suite beyond the single happy path
- [ ] PWA support / web push notifications

## 9. Non-functional requirements

- **Layered architecture** on the API: `routes → controller → service → model`. Controllers
  never touch Mongoose directly; services hold business logic; no logic in route files.
- **Validation at the boundary only** — Zod schemas validate every request body/query; internal
  function calls trust their inputs.
- **Centralized error handling** — one error-handling middleware, custom `AppError` class with
  HTTP status + machine-readable code, no `try/catch` scattered per route.
- **No silent failures** — every rejected promise is either handled or surfaces as a 5xx with a
  logged stack trace (pino), never swallowed.
- **Security** — helmet, CORS allow-list, bcrypt cost factor ≥ 12, rate limiting on
  `/auth/*` and message creation, no secrets in the repo (`.env.example` only).
- **Lint/format** — ESLint + Prettier enforced in CI; no `any` in TypeScript without a comment
  explaining why.

## 10. Testing strategy

- **API integration tests** (Vitest + Supertest): spin up `mongodb-memory-server` in
  `beforeAll`, exercise real routes end-to-end (register → login → create room → send message →
  fetch paginated history), assert on actual persisted documents. No mocked `Model.find`.
- **API unit tests**: pure service-layer logic (token generation, mention parsing, pagination
  cursor math) tested in isolation.
- **Frontend component tests** (Vitest + RTL): message list renders highlights correctly,
  typing indicator appears/disappears, protected route redirects when unauthenticated.
- **E2E** (Playwright): one full happy path — register two users, open a DM, send a message from
  user A, assert it appears in real time in user B's browser context.
- Coverage threshold enforced in CI (suggest 70% lines on the API).

## 11. CI/CD

`.github/workflows/ci.yml` runs on every PR into `master`:
1. Install (pnpm workspaces, cached).
2. Lint (`eslint .`).
3. Typecheck (`tsc --noEmit` in both apps).
4. Test (`apps/api` with `mongodb-memory-server`, `apps/web` with Vitest).
5. Build both apps (catches Vercel build-time errors before they hit Vercel).

`master` is branch-protected: PRs require the CI check to pass before merge.

## 12. Environment variables

**`apps/api/.env`**

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | signing secrets |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | e.g. `15m` / `7d` |
| `PUSHER_APP_ID` / `PUSHER_KEY` / `PUSHER_SECRET` / `PUSHER_CLUSTER` | server-side Pusher trigger |
| `CORS_ORIGIN` | the deployed frontend URL |

**`apps/web/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | the deployed API URL |
| `VITE_PUSHER_KEY` / `VITE_PUSHER_CLUSTER` | client-side Pusher subscribe (public key only) |

Both apps ship a committed `.env.example` with placeholder values; real values live only in
Vercel's environment variable settings, never in the repo.

## 13. Deployment (Vercel)

Two separate Vercel projects pointing at the same GitHub repo, each with its own **Root
Directory** setting so they build independently:

1. **API project** — Root Directory `apps/api`, framework preset "Other", build command
   `pnpm run build`, output handled by `@vercel/node` via `apps/api/vercel.json`. Set all API env
   vars from §12 in the Vercel dashboard.
2. **Web project** — Root Directory `apps/web`, framework preset "Vite". Set `VITE_API_BASE_URL`
   to the API project's production URL once it exists, and the Pusher public env vars.

Deploy the API first (card 14), copy its production URL into the web project's env vars, then
deploy the web app (card 15). Every PR also gets a Vercel preview deployment automatically —
link the preview URL in the PR description for manual QA before merging.

## 14. Git workflow

- `master` is always deployable. Branch per card: `feat/01-scaffolding`, `feat/02-api-skeleton`,
  etc. (number matches the card number in §15).
- One PR per card. PR description: what the card covers, how it was tested, and the Vercel
  preview link once available.
- Conventional commit prefixes (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- Squash-merge into `master` so each card is one commit in history — keeps the log readable as a
  work record.
- Repo starts **private**; flip to public once the MVP cards (1–13) are merged and the README has
  real screenshots/GIFs, so the public history reads as a finished slice, not a work-in-progress.

## 15. Work breakdown — cards

Each card is scoped to be one reviewable PR. Don't start card *n+1* before card *n* is merged —
the point is an incremental, readable history.

1. **Monorepo scaffolding** — pnpm workspaces, `apps/web`, `apps/api`, `packages/shared`,
   ESLint/Prettier/TS configs, root `README.md`, `.gitignore`, MIT `LICENSE`.
2. **API skeleton** — Express app, MongoDB connection (`config/db.ts`), health-check route,
   centralized error-handling middleware, pino logging.
3. **Auth** — User model, register/login/refresh/logout/me, JWT access+refresh, bcrypt, Zod
   validation, integration tests with `mongodb-memory-server`.
4. **Rooms & messages (persistence only)** — Room + Message models, create room, list rooms,
   paginated message history endpoints, integration tests.
5. **Pusher integration** — `/api/pusher/auth`, trigger `message:new` on send, typing events,
   presence channel wiring.
6. **Frontend scaffolding** — Vite+React+TS+Tailwind, router, typed API client, login/register
   pages, protected-route wrapper.
7. **Chat UI shell** — room list, message list, message input, responsive layout, dark mode.
8. **Real-time wiring on the frontend** — pusher-js subscription, live message updates, typing
   indicator, presence dots.
9. **Message highlighting & rich content** — search with `<mark>` highlights, `@mention`
   highlighting, markdown + syntax-highlighted code blocks.
10. **Read receipts & infinite scroll** — mark-as-read on view, cursor-based pagination on
    scroll-up.
11. **API test coverage pass** — close gaps from cards 2–5, enforce coverage threshold in CI.
12. **Frontend test coverage + Playwright E2E** — component tests for cards 6–10, one Playwright
    happy-path spec.
13. **CI pipeline + branch protection** — `.github/workflows/ci.yml`, required check on `master`.
14. **Deploy API to Vercel** — project setup, env vars, verify health-check in production.
15. **Deploy web to Vercel** — project setup, env vars pointing at the live API, verify a full
    login → send message → real-time receive flow in production.
16. **README + polish** — architecture diagram, setup instructions, GIF of the chat in action,
    OpenAPI docs link, flip repo to public.

## 16. Definition of done (whole project)

- All MVP features in §8 implemented and covered by tests.
- CI green on `master`.
- Both apps live on Vercel, linked to each other, real-time messaging works end-to-end on the
  deployed URLs (not just locally).
- README has screenshots/GIF, architecture diagram, and setup instructions a stranger could
  follow.
- Repo is public.

## 17. Post-MVP cards

Cards 1–16 above are the original MVP. These were opened after the MVP shipped, based on
feedback using the deployed app — same one-branch-one-PR-per-card workflow.

17. **Fix registration UX** — separate First name / Last name fields from Username (the
    single field was being mistaken for a full-name field); make the username field's
    purpose clear up front.
18. **Show the current logged-in user** in the app shell (sidebar footer).
19. **Add i18n** — Portuguese (default) and English, with a language switcher.
20. **Migrate the frontend UI to Material UI** (latest stable release), replacing the
    hand-rolled Tailwind components.
21. **Keep the message composer bottom-anchored** with no messages, instead of sitting
    under the empty-state text.
