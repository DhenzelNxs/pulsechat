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

Requirements: Node.js ≥ 20 and [pnpm](https://pnpm.io).

```bash
pnpm install        # installs all workspaces (apps/web, apps/api, packages/shared)
pnpm run typecheck  # tsc --noEmit across every workspace
pnpm run lint        # eslint .
pnpm run format      # prettier --write .
```

`apps/api` and `apps/web` each get their own `dev`/`build` scripts as they're built out in
cards 2 and 6 — see [`docs/SPEC.md`](docs/SPEC.md) §4 for the monorepo layout and §15 for the
full card-by-card roadmap.
