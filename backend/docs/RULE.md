# Chicken Farm Management — project rules

These rules apply to everyone and every change in this repository.

## Repository layout

- **`ChickenFarmManagement_Backend/`** — API server (Node, Express, TypeScript, PostgreSQL, Prisma).
- **`ARCHITECTURE.md`** — how the system is structured (read before large changes).
- **`RULE.md`** — this file.

## Secrets and configuration

- **Never commit** `.env`, database passwords, or `JWT_SECRET`.
- Copy **`.env.example`** to **`.env`** locally; keep real values only on your machine or secure deployment storage.
- Do not log tokens, passwords, or full payment or government ID data.

## Runtime and tooling

- **Node.js** 20 or newer.
- **Package manager**: npm (lockfile committed for the backend).
- **Database**: PostgreSQL; schema owned by **Prisma** (`prisma/schema.prisma`).

## TypeScript and modules (backend)

- **`"type": "module"`** — use **ESM** imports in source; import paths end with **`.js`** where required by `NodeNext` resolution.
- **`strict`** mode stays on; fix types instead of weakening the compiler.
- Prefer **`async`/`await`**; wrap async route handlers with **`asyncHandler`** so errors reach the global error middleware.

## Coding rules (how to write code)

**Naming**

- **Files:** `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.module.ts` / `index.ts` — match existing modules (`identity`, `seller`, …).
- **Variables / functions:** `camelCase`. **Types / classes / enums:** `PascalCase`. **Constants** only when truly fixed: `SCREAMING_SNAKE` or module-level `const` with camelCase if it reads better next to Prisma enums.
- **Express handlers:** name them clearly (`getMe`, `register`, `approveSeller`), not `handler1`.

**TypeScript**

- **No `any`.** If you are stuck, use `unknown` + narrowing or ask for a proper type.
- **No `@ts-expect-error` / `@ts-ignore`** without a one-line comment explaining why it is unavoidable and a follow-up ticket or date.
- Prefer **`async` functions** that return `Promise<...>` over mixing raw `Promise` chains in new code.
- Use **`import type`** for type-only imports when it avoids emitting unused imports and matches the rest of the file.
- **`strict`** stays on: do not widen `tsconfig` to hide errors.

**Imports (ESM)**

- This project uses **`"type": "module"`** and **`moduleResolution: "NodeNext"`** — import your own compiled files with the **`.js` extension** in the import string (e.g. `'./identity.service.js'`), as in the rest of the repo.
- **Order:** Node/built-ins → external packages (`express`, `zod`) → `../../core/...` → same-module relative. No circular imports; if you need one, extract shared code to `core/` or a tiny shared file.

**Controllers**

- **Thin:** parse body/params/query with **Zod** (or validate presence), call **one service** (or a small orchestration), map result to `res.status(...).json(...)`.
- **No** `prisma`, **no** `bcrypt`, **no** `jwt.sign` in controllers — that belongs in **services** or **core** helpers used by services.
- Every **`async`** route handler must be wrapped with **`asyncHandler`** (or passed through a wrapper that forwards errors to `next`).

**Services**

- Contain **business rules** and **all Prisma** access for that use case.
- Use **`AppError`** for expected failures (with correct HTTP status). Do not send `res` from here; only throw or return data.
- Prefer **one clear return path** per public method; use **early returns** for guard clauses.
- **Transactions:** use `prisma.$transaction` when multiple writes must succeed or fail together.

**Errors**

- Throw **`AppError`** for client-relevant errors; let the global error middleware format JSON.
- Do not **`catch` and ignore**; if you catch, either rethrow, wrap in `AppError`, or log and rethrow. Never empty `catch {}`.

**Logging**

- Use **`console.error`** (or the project logger when we add one) for unexpected errors in development paths.
- **Never** log passwords, full JWTs, API keys, or full government-ID / payment payloads.

**Comments**

- Prefer **clear names** over long comments. Comment **why**, not what, unless the domain rule is non-obvious (e.g. auction timing).

**API shapes**

- Success: return **JSON objects** with stable keys (`{ user }`, `{ items }`, not ambiguous bare arrays unless already established for that endpoint).
- Follow existing **`{ error: { message, code? } }`** pattern for errors produced via `AppError` / middleware.

**Prisma**

- Use **generated types** from `@prisma/client` for public shapes where appropriate; avoid duplicating enums as string unions in two places unless mapping at the edge.
- **`select` / `include`:** only fetch fields the API needs; avoid returning `passwordHash` or internal tokens.

**Git hygiene (code-related)**

- Run **`npm run build`** before pushing; fix all TypeScript errors.
- Keep formatting consistent with surrounding files (indentation, quotes); if we add Prettier/ESLint later, follow the config.

## Modular monolith boundaries

- A **module** is a folder under `src/modules/<name>/` with a clear job (identity, seller, admin, etc.).
- **Do not** import another module’s “private” files across boundaries when you can avoid it. Prefer calling that module’s **service** layer (or a small shared contract).
- **`catalog`** holds product **domain/use-case** code (`product.service.ts`). HTTP for seller products lives under **`seller`**; the seller module calls the catalog service. Do not create circular imports between modules.
- **`core/`** is shared infrastructure only (env, Prisma client, JWT helpers, generic middleware). No business rules that belong to a single feature.

## HTTP API conventions

- Public API prefix: **`/api/v1/...`** (keep versioning when breaking clients).
- **JSON** request and response bodies unless explicitly documented otherwise.
- **Errors** for clients: use **`AppError`** (or equivalent) so the global handler returns a stable shape, e.g. `{ "error": { "message": "...", "code": "..." } }`.
- **Authentication**: **`Authorization: Bearer <access_token>`** for protected routes unless a route is explicitly public.

## Roles and authorization

- **`USER`** — default registered account (buyer-side).
- **`SELLER`** — granted after an approved seller application (see architecture doc).
- **`SUPER_ADMIN`** — platform administration; not self-registered via public API; use seed or controlled ops.
- Enforce **role + resource** checks in services when the rule is about data ownership, not only in routes.

## Database and Prisma

- Schema changes go through **`prisma migrate`** (or team-agreed workflow); avoid editing **already applied** migration SQL unless you know the impact on all environments.
- Run **`npm run db:generate`** after schema changes so the Prisma Client types match the database.

## Dependencies

- Add **runtime** packages to **`dependencies`**; **types** and build tools to **`devDependencies`**.
- If TypeScript reports a missing **`@types/...`** package (e.g. transitive types like `connect`), add the missing **`@types/*`** explicitly rather than turning off strict checks.

## Logging and observability

- **Morgan** is used for HTTP logging in development; keep logs free of secrets and large PII dumps.
- Prefer structured messages for real production logging when you extend beyond Morgan.

## Git and reviews

- Commits and PRs: **clear English**, describe *what* and *why*.
- Keep diffs **focused** on the task; avoid unrelated refactors in the same change.

## Security headers and CORS

- **Helmet** and **CORS** are configured in `app.ts`. Tighten origins for production; do not use `*` with credentials.

## When you add a new feature module

1. Create **`src/modules/<feature>/`** with routes → controller → service pattern as in existing modules.
2. Register it in **`src/modules/registerModules.ts`**.
3. Update **`ARCHITECTURE.md`** with one or two sentences if behavior or boundaries change.

---

If a rule conflicts with product needs, discuss and update **this file** instead of silently diverging.
