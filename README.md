# Advanced TodoApp

A professional, multi-user task management platform built with TypeScript.  
It includes a modern dashboard, Kanban workflow, calendar planning, task detail modal, workspace-based RBAC, and real-time collaboration.

## Highlights

- Multi-tenant workspaces with role-based permissions (`ADMIN`, `MEMBER`)
- Dashboard with workload KPIs and workspace switching
- Kanban board with status transitions
- Calendar view for due-date planning
- Task detail modal with inline editing and comments
- Real-time task updates via Socket.IO
- Authenticated access with NextAuth (credentials provider)
- Team onboarding: discover public teams, join with invite code, create public/private teams, or start a personal sandbox workspace
- **Visibility:** public teams appear in discovery; private teams can only be joined with an invite code

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, NextAuth
- **Database:** Prisma ORM (SQLite in local development)
- **Realtime:** Socket.IO server + client
- **State/Data:** TanStack Query, Zustand
- **Validation:** Zod
- **Testing:** Vitest

## Project Structure

```text
.
|- frontend/
|  |- prisma/
|  |  |- schema.prisma
|  |  |- migrations/
|  |  |- seed.js
|  |- src/
|  |  |- app/
|  |  |  |- api/
|  |  |  |- dashboard/
|  |  |  |- login/
|  |  |  |- register/
|  |  |- components/
|  |  |  |- dashboard/
|  |  |  |- kanban/
|  |  |  |- calendar/
|  |  |  |- tasks/
|  |  |- lib/
|  |- middleware.ts
|- backend/
|  |- index.js
|- package.json
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

Install from individual packages (optional):

```bash
npm install -w frontend
npm install -w backend
```

### 2) Configure environment

Create `frontend/.env` from `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env
```

Default development values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-change-this"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### 3) Prepare database

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 4) Run the app

Start web app:

```bash
npm run dev
```

Start realtime server in a second terminal:

```bash
npm run socket
```

## Demo Account

- **Email:** `admin@todoapp.dev`
- **Password:** `admin123`

## Teams & invites

- **Public team:** listed under “Public teams available to join” for users with no membership yet.
- **Private team:** not listed; members join with an invite code (`POST /api/workspaces/join-invite` with `{ "inviteCode": "..." }`).
- **Workspace admins** can switch visibility and rotate the invite code from the dashboard (team workspace only).
- **Personal sandbox:** `POST /api/workspaces/sandbox` — creates a private workspace only for you (`isSandbox`), not shown in discovery.

## Available Scripts

- Root workspace:
  - `npm run dev` - start frontend app
  - `npm run socket` - start backend realtime server
  - `npm run build` / `npm run start`
  - `npm run typecheck` / `npm run test`
  - `npm run prisma:generate` / `npm run prisma:migrate` / `npm run prisma:seed`
- Package-scoped:
  - `npm run dev -w frontend`
  - `npm run dev -w backend`

## Current Scope

Implemented:
- Foundation, auth, RBAC, core task APIs
- Dashboard, Kanban, Calendar, task detail modal
- Real-time task synchronization
- Baseline tests and development setup

Planned next:
- PostgreSQL production configuration
- Drag-and-drop Kanban interactions
- Presence indicators and notifications
- Offline-first sync queue and conflict resolution
- E2E and integration test expansion

## License

Private project (internal use).
