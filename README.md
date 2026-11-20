# Phone book

A small personal phone book: Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and SQLite (`better-sqlite3`).

## Getting started

Needs Node.js 24 LTS and pnpm 10+.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

The database is a SQLite file at `DATABASE_PATH` (default `./data/phonebook.db`). It and its tables are created on first use; `data/` is git-ignored.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generates Next.js types, then `tsc --noEmit` |
| `pnpm test` | Vitest unit tests (`*.test.ts` beside their source, against `:memory:`) |
| `pnpm e2e` | Builds the app, then runs the Playwright journeys in `e2e/` (installs Chromium if needed) |
| `pnpm seed [count]` | Adds `count` realistic Contacts (default 2,000) to the database |

The e2e run starts four `next start` servers on ports 3100–3103, each with its own database under `data/e2e/` (see `playwright.config.ts`).

## Layout

See `.foundry-output/initiatives/phone-book/architecture/architecture/ARCHITECTURE-SPINE.md`. In short: pages are Server Components that read through `src/lib/contacts/repository.ts`, the only module that runs SQL, over the connection in `src/lib/db.ts`.
