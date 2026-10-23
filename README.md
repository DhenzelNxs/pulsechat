# PulseChat

Real-time chat application with JWT authentication, built as a full-stack engineering showcase
rather than a tutorial clone — real-time messaging (Pusher Channels), typing indicators,
presence, message search with highlighting, and integration tests run against a real MongoDB
engine.

Full technical specification and work breakdown: [`docs/SPEC.md`](docs/SPEC.md).

## Status

🚧 In progress — see the [issues](../../issues) for the current card-by-card build-out and
[`docs/SPEC.md`](docs/SPEC.md) §15 for the full roadmap.

## Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, TanStack Query
- **API**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB Atlas
- **Real-time**: Pusher Channels
- **Testing**: Jest, Supertest, mongodb-memory-server, Vitest, Playwright
- **Hosting**: Vercel (frontend and API as separate projects from this monorepo)

## Local development

Setup instructions land here once card 1 (scaffolding) is merged.
