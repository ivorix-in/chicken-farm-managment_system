# Chicken Farm Management — architecture (simple overview)

This document explains **how the backend is built** and **how the main pieces work together**. For day-to-day coding rules, see **`RULE.md`**.

## What kind of system this is

- **One application**, one deployment unit: a **modular monolith**.
- **Not** many small microservices talking over the network. Instead, **several logical “modules”** live in one Node process, share one PostgreSQL database, and are composed in one Express app.
- **Why**: simpler to run and deploy while still keeping **clear boundaries** so the codebase can grow or later split a module into its own service if needed.

## Big picture

```text
Browser / mobile app
        │
        ▼  HTTPS (JSON)
   Express app  (src/app.ts)
        │
        ├── core/          shared: config, DB client, auth helpers, errors
        │
        └── modules/       feature areas (each owns its routes + logic)
                ├── health
                ├── identity   (login / register)
                ├── user       (buyer profile: e.g. “me”)
                ├── seller     (seller portal: apply, dashboard, products)
                ├── admin      (super admin: approve sellers)
                └── catalog    (product use-cases; used by seller, not a separate public API root)
```

**Typical request path:** HTTP → **router** → **controller** (parse/validate input) → **service** (business rules + Prisma) → **response JSON**.

## Folders (backend)

| Path | Purpose |
|------|--------|
| `src/server.ts` | Starts the HTTP server, loads env, graceful shutdown. |
| `src/app.ts` | Creates Express app: global middleware, mounts modules, 404 + error handler. |
| `src/core/` | Cross-cutting **infrastructure**: environment (`env.ts`), Prisma singleton, JWT helpers, `AppError`, auth middleware, `asyncHandler`. |
| `src/modules/registerModules.ts` | **Single place** that attaches all feature modules to the app. |
| `src/modules/<name>/` | One **bounded context** per folder (identity, user, seller, admin, health). |
| `src/types/express.d.ts` | Adds `req.auth` typing after JWT middleware runs. |
| `prisma/` | Database **schema** and **migrations**; Prisma Client is generated from here. |

## API “surfaces” (who calls what)

All versioned under **`/api/v1`** so you can introduce `/api/v2` later without breaking old clients.

| Prefix | Who it is for | Examples |
|--------|----------------|------------|
| `/api/v1/auth` | Everyone | Register, login. |
| `/api/v1/user` | Logged-in **buyer** | Profile / “me”. |
| `/api/v1/seller` | **Seller** journey | Apply to sell, dashboard, manage products (after approval). |
| `/api/v1/admin` | **Super admin** | List pending seller applications, approve or reject. |
| `/health` | Ops / load balancers | Liveness-style check. |

Same server, different route prefixes and **different middleware** (e.g. role checks) so each client type only sees what it should.

## Data model (short)

- **`User`** — email, password hash, **`role`**: `USER` | `SELLER` | `SUPER_ADMIN`.
- **`SellerProfile`** — one per user who applies; **`approvalStatus`**: pending / approved / rejected; extra seller fields over time.
- **`Product`** — belongs to a **`SellerProfile`** (the selling entity), with a simple status string for drafts vs live, etc.

**Flow in words:**

1. Someone **registers** → `User` with role **`USER`**.
2. They **apply as seller** → `SellerProfile` created (**pending**); role stays `USER` until approved.
3. **Super admin approves** → profile becomes **approved**, `User.role` becomes **`SELLER`**.
4. **Seller** creates **products** via the seller API; catalog logic enforces “approved seller only”.

## Authentication

- After login, the API returns a **JWT access token**.
- Clients send **`Authorization: Bearer <token>`** on protected routes.
- Middleware decodes the token and sets **`req.auth`** (`userId`, `email`, `role`) for handlers.

## Errors and validation

- **`AppError`** carries HTTP status + message for predictable JSON errors.
- **Zod** validates request bodies in controllers where used.
- Unknown errors fall through to a **500** with a generic message (details only in server logs).

## Environment variables

See **`ChickenFarmManagement_Backend/.env.example`**. Minimum ideas:

- **`DATABASE_URL`** — PostgreSQL connection string for Prisma.
- **`JWT_SECRET`** — long random secret for signing tokens.
- **`PORT`** — server port (default often 9000 in examples).

## Optional: super admin seed

Prisma seed can create the first **`SUPER_ADMIN`** when **`SEED_SUPER_ADMIN_EMAIL`** and **`SEED_SUPER_ADMIN_PASSWORD`** are set (see `package.json` / `prisma/seed.ts`). This avoids exposing an open “register as admin” endpoint.

---

**Summary:** one Express app, **modules** by feature, **PostgreSQL** via **Prisma**, **JWT** auth, three main **API surfaces** (auth, user, seller, admin) plus shared **core** code. **`RULE.md`** describes how we keep that structure healthy as the code changes.
