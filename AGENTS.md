# Project Blueprint & Agent Contract

This file is the single source of truth for all Claude Code agents working on this project.
**Read this fully before writing any code.**

---

## Stack (non-negotiable)

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express (or Fastify) |
| Database | Cloud SQL (Postgres) + Prisma |
| Auth | Firebase Auth |
| Real-time | Firestore (chat/presence) or SSE |
| Infra | Terraform → GCP |
| Hosting | Cloud Run (API), Vercel or Firebase Hosting (web) |
| Monorepo | npm workspaces |

---

## Repo Structure

```
/
├── packages/
│   └── shared/               # Shared types + API contract — source of truth
│       ├── package.json      # name: "@myapp/shared"
│       └── src/
│           ├── types/
│           │   ├── user.ts
│           │   └── api.ts
│           └── api-contract.ts
├── apps/
│   ├── api/                  # Express + Prisma (Agent 2)
│   │   └── prisma/           # schema.prisma + migrations (Agent 3)
│   └── web/                  # React + Vite (Agent 4)
├── integrations/
│   ├── stripe/               # Webhook receiver + idempotency (Agent 5)
│   ├── llm/                  # Provider-agnostic wrapper (Agent 5)
│   └── email/                # Resend/SendGrid abstraction (Agent 5)
├── infra/
│   └── terraform/            # All GCP infrastructure (Agent 1)
└── AGENTS.md                 # This file
```

---

## Agents & Ownership

### Agent 1 — Infra
- **Owns:** `/infra/terraform`
- **Delivers:** Cloud Run service, Cloud SQL instance, networking, secrets, IAM
- **Depends on:** Nothing (runs in Phase 1)
- **Exposes:** Connection strings + service URLs as Terraform outputs
- **Must not touch:** Any app code

### Agent 2 — API
- **Owns:** `/apps/api` (excluding `/apps/api/prisma`)
- **Delivers:** Express app, all route handlers, Firebase auth middleware, error handling
- **Depends on:** `@myapp/shared`, Prisma client from Agent 3
- **Exposes:** REST API matching the contract below
- **Must not touch:** Frontend, Prisma schema, infra

### Agent 3 — DB / Schema
- **Owns:** `/apps/api/prisma`
- **Delivers:** `schema.prisma`, all migrations, seed script
- **Depends on:** Entity definitions in shared contract
- **Exposes:** Prisma client (consumed by Agent 2)
- **Must not touch:** Route logic, frontend, infra

### Agent 4 — Frontend
- **Owns:** `/apps/web`
- **Delivers:** React + Vite shell, Firebase auth context, protected routes, API client layer
- **Depends on:** `@myapp/shared`, API contract
- **Exposes:** Nothing (leaf node)
- **Must not touch:** API code, DB, infra

### Agent 5 — Integrations
- **Owns:** `/integrations`
- **Delivers:** Stripe stub, LLM wrapper, email abstraction
- **Depends on:** `@myapp/shared` types only
- **Exposes:** Typed integration clients, consumed by Agent 2
- **Must not touch:** App code, infra

---

## Shared Types (packages/shared)

### User

```typescript
// packages/shared/src/types/user.ts
export interface User {
  id: string           // Firebase UID — primary key everywhere
  email: string
  displayName: string | null
  createdAt: string    // ISO 8601
}
```

### API Envelope

```typescript
// packages/shared/src/types/api.ts
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  code: string         // machine-readable e.g. "AUTH_EXPIRED", "NOT_FOUND"
  message: string      // human-readable
  status: number       // HTTP status code
}
```

### Auth Contract

```typescript
// packages/shared/src/types/auth.ts
// Shape attached to every verified request by the auth middleware
export interface AuthenticatedRequest extends Request {
  uid: string          // Firebase UID, verified server-side
  email: string
}
```

### API Route Contract

```typescript
// packages/shared/src/api-contract.ts
export const API_ROUTES = {
  users: {
    me:     { method: 'GET',  path: '/api/users/me' },
    update: { method: 'PUT',  path: '/api/users/me' },
  },
  chat: {
    rooms:    { method: 'GET',  path: '/api/chat/rooms' },
    messages: { method: 'GET',  path: '/api/chat/rooms/:id/messages' },
    send:     { method: 'POST', path: '/api/chat/rooms/:id/messages' },
  },
} as const
```

---

## Prisma Schema

```prisma
// apps/api/prisma/schema.prisma

model User {
  id          String       @id           // Firebase UID
  email       String       @unique
  displayName String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  messages    Message[]
  rooms       RoomMember[]
}

model Room {
  id        String       @id @default(cuid())
  name      String
  createdAt DateTime     @default(now())
  members   RoomMember[]
  messages  Message[]
}

model RoomMember {
  userId   String
  roomId   String
  joinedAt DateTime @default(now())
  user     User     @relation(fields: [userId], references: [id])
  room     Room     @relation(fields: [roomId], references: [id])
  @@id([userId, roomId])
}

model Message {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  content   String
  createdAt DateTime @default(now())
  room      Room     @relation(fields: [roomId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## Auth Flow (end to end)

1. User signs in via **Firebase Auth SDK** on the frontend
2. Frontend gets a Firebase **ID token** (JWT), refreshed automatically by the SDK
3. Every API request includes `Authorization: Bearer <id_token>`
4. Express **auth middleware** calls `firebase-admin.auth().verifyIdToken(token)`
5. On success, middleware attaches `{ uid, email }` to the request object
6. If the user doesn't exist in Postgres yet, the middleware upserts them (first-login provisioning)
7. All downstream route handlers trust `req.uid` — never accept uid from the request body

---

## Error Handling Rules

- All errors return `ApiResponse<null>` with a populated `error` field
- Use consistent `code` strings — define them in `packages/shared/src/types/errors.ts`
- HTTP 4xx for client errors, 5xx for server errors — never 200 with an error body
- Auth failures are always `401`, authorization failures are `403`

---

## Environment Variables

- Never hardcode secrets or config
- `.env` files are local only, never committed
- Terraform outputs populate infra secrets (DB URL, service account keys)
- Each app has its own `.env.example` committed to the repo

```
# apps/api/.env.example
DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
PORT=8080

# apps/web/.env.example
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_API_BASE_URL=
```

---

## Build & Run Conventions

```bash
# From repo root
npm install              # installs all workspaces
npm run dev -w api       # run API dev server
npm run dev -w web       # run web dev server

# DB
cd apps/api
npx prisma migrate dev   # apply + generate
npx prisma db seed       # seed local DB
```

---

## Execution Phases

### Phase 0 — Setup (COMPLETE ✅)
- [x] Init monorepo (`npm workspaces`)
- [x] Write `packages/shared` fully (types + contract)
- [x] Lock Prisma schema
- [x] Create GCP project, enable APIs
- [x] Write `.env.example` files
- [x] Set up `.env` files with Firebase & GCP credentials
- [x] Create Terraform scaffolding

**Status:** Monorepo ready, credentials configured, Terraform ready for deployment

### Phase 1 — Parallel (all agents independent)

**Status:** Agent 1 ✅ COMPLETE, Agent 3 ✅ COMPLETE, Agent 5 ✅ COMPLETE — Database schema & integrations ready.

**Summary:** 
- Agent 1 has provisioned Cloud SQL Postgres and published DATABASE_URL
- Agent 3 has created database schema and migrations (PR #7)
- Agent 5 has created all three integration stubs (stripe, llm, email) and published PR #6
- Agent 2 can now begin API implementation with database and integrations ready

#### Agent 1: Terraform Infrastructure ✅ COMPLETE
- [x] Create GCS bucket for Terraform state: `gsutil mb gs://my-system-template-tf-state`
- [x] Run `terraform init` → `terraform plan` → `terraform apply`
- [x] Output `DATABASE_URL` and credentials
- **Deliverable:** Cloud SQL Postgres instance (ready), service account (deferred to Phase 2)
- **Outputs:**
  - `DATABASE_URL`: `postgresql://appuser:***@35.192.50.153:5432/myapp`
  - `database_connection_name`: `my-system-template:us-central1:myapp-db`
  - **Stacked PRs:** #2, #3, #4 (gitignore, setup, config)

#### Agent 3: Database / Prisma ✅ COMPLETE
- [x] Wait for `DATABASE_URL` from Agent 1 ← **Ready!**
- [x] Run `npx prisma migrate dev` → Initial migration created
- [x] Create seed script (`prisma/seed.ts`) → Complete with 3 users, 2 rooms, 4 messages
- **Deliverable:** Initial migration (User, Room, RoomMember, Message models) + seed script
- **Next Steps:** Apply migration with `npx prisma migrate deploy` using proper DATABASE_URL
- **Stacked PR:** #5 (Database schema + seed)

#### Agent 5: Integrations ✅ COMPLETE
- [x] Create Stripe webhook receiver stub (`@myapp/stripe` — idempotency support)
- [x] Create LLM provider-agnostic wrapper (`@myapp/llm` — OpenAI, Anthropic, Gemini, local)
- [x] Create email abstraction (`@myapp/email` — Resend, SendGrid)
- **Deliverable:** Typed integration clients in `/integrations` (all 3 packages, built and type-checked)
- **Stacked PR:** #6 (stripe, llm, email integration packages)

### Phase 2 — Agent 2 ✅ COMPLETE

**Status:** Express API fully implemented with Firebase auth and routes (PR #8)

**Summary:**
- Express.js server with Firebase Admin SDK auth middleware
- All API routes implemented matching contract (users, chat)
- Proper error handling with ApiResponse envelope
- Database integration with Prisma client
- Protected routes with auth verification

#### Agent 2: API ✅ COMPLETE
- [x] Set up Express.js server with TypeScript
- [x] Integrate Firebase Admin SDK for token verification
- [x] Create auth middleware (upserts user on first login)
- [x] Implement all routes: GET/PUT `/api/users/me`, GET/POST `/api/chat/rooms*`
- [x] Error handling with ApiResponse envelope
- [x] Database queries via Prisma
- [x] Type-safe using @myapp/shared contracts
- **Deliverable:** Production-ready Express API with full Firebase auth flow
- **PR:** #8 (Phase 2: Express API with Firebase auth and routes)
- **API Base:** http://localhost:8080

### Phase 3 — Agent 4 ✅ COMPLETE

**Status:** React + Vite frontend fully scaffolded and integrated with API (PR #9)

**Summary:**
- Vite + React 18 project with TypeScript strict mode
- Firebase Auth integration with AuthContext provider (automatic token refresh)
- Protected routes with ProtectedRoute component and auth guards
- API client layer with automatic Bearer token injection
- Login page with sign-in/sign-up toggle
- Dashboard page with user profile display and chat placeholder
- Error boundary for better error messaging
- Demo .env for local development testing

#### Agent 4: Frontend ✅ COMPLETE
- [x] Create Vite + React project structure
- [x] Configure TypeScript strict mode with Vite types
- [x] Set up Firebase Auth context and providers
- [x] Create ProtectedRoute component with auth guards
- [x] Build API client layer (automatic Bearer token injection)
- [x] Create login page (Firebase email/password auth with UI toggle)
- [x] Create dashboard page (user profile display + chat placeholder)
- [x] Add ErrorBoundary component for initialization errors
- [x] Create demo .env for local development
- [x] Verify dev server runs at localhost:5173
- [x] Production build succeeds (87KB gzipped)
- [x] Integrate with Agent 2's API routes (✅ API ready)
- **Deliverable:** Complete React + Vite web app with full auth flow, API integration, and protected routing
- **PR:** #9 (Phase 3: Agent 4 - React + Vite frontend)
- **Dev Server:** http://localhost:5173

---

## Golden Rules

1. **Import from `@myapp/shared`, never redefine types locally**
2. **The Prisma schema is the DB source of truth — no raw SQL migrations**
3. **Auth middleware is the only place Firebase is called on the backend**
4. **Every API response uses the `ApiResponse<T>` envelope — no exceptions**
5. **No agent touches another agent's directory**
6. **If a contract needs to change, update `packages/shared` first, then notify all agents**
