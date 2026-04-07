# Advanced TodoApp (TypeScript)

Professional multi-user todo platform with dashboard, kanban, calendar, task detail modal, auth/RBAC, workspace isolation, and real-time updates.

## Stack
- Next.js (App Router) + TypeScript
- Prisma ORM + SQLite (local dev)
- NextAuth credentials auth
- Socket.IO real-time collaboration

## Quick Start
1. Install dependencies:
   - `npm install`
2. Set env:
   - copy `.env.example` to `.env` (or use included dev `.env`)
3. Generate DB client and migrate:
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init`
4. Seed local data:
   - `npm run prisma:seed`
5. Start app:
   - `npm run dev`
6. Start socket server (second terminal):
   - `npm run socket`

## Demo credentials
- Email: `admin@todoapp.dev`
- Password: `admin123`
# Team_todoList
