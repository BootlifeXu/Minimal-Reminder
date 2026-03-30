# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── reminder-app/       # Expo mobile app (reminder app)
│   └── mockup-sandbox/     # Design mockup sandbox
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Reminder App (`artifacts/reminder-app`)

A minimalist black-and-white Android/iOS reminder app built with Expo + React Native.

### Features
- Add/edit/delete reminders with title, notes, date/time
- Priority levels: Low, Medium, High (indicated by dots)
- Categories: Personal, Work, Health, Study, Other
- Repeat intervals: Never, Daily, Weekly, Monthly, Yearly
- Snooze reminders (5min, 15min, 30min, 1hr, 3hr, Tomorrow)
- Filter tabs: Active, Today, Upcoming, Done
- Full-text search across title and notes
- Local notifications via expo-notifications (native only)
- Persistent storage via AsyncStorage
- Stats overview in Settings

### Design System
- Colors: Strict 2-color (black + white)
- Font: Inter (400/500/600/700)
- Icons: Feather line icons (thin stroke)
- Navigation: Bottom tab bar (4 tabs: Reminders, Search, Categories, Settings)

### Architecture
- State: React Context + AsyncStorage (offline-first)
- No backend (local-only, with cloud sync as optional future feature)
- Expo Router for file-based navigation

## API Server (`artifacts/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.
