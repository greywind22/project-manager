# Decisions

Deliberate technical choices made during development, with alternatives considered.

---

## Stack

### NestJS for the backend
**Decision:** NestJS over plain Express.
**Reason:** Matches the job spec. Module/controller/service pattern enforces separation of concerns and is familiar to the team.

### PostgreSQL for the database
**Decision:** PostgreSQL over MongoDB or SQLite.
**Reason:** Asset types are varied but relationships are clear (project → assets). Relational data. JSONB covers custom fields. SQLite is not production-appropriate; MongoDB adds complexity without benefit over Postgres JSONB.

### Prisma as the ORM
**Decision:** Prisma over TypeORM or Drizzle.
**Reason:** Best TypeScript integration of the options — generated types from the schema give type safety across the backend almost for free.

## Data model

### Address stored as a single string
**Decision:** `address` is a single `String` field.
**Alternatives considered:** structured fields (street, suburb, state, postcode).
**Reason:** address is display-only in this context. Structured fields would be needed for filtering by suburb or mapping API integration. Can be migrated later if needed.

### Asset model — polymorphic base table pattern
**Decision:** Base `Asset` table for shared fields, per-type tables (`AssetLink`, `AssetFile`, `AssetVideo`) for type-specific fields.
**Alternatives considered:**
- Single table with nullable columns — type-specific constraints can only be enforced in application code, not at the database level
- Separate tables with no base table — every shared operation (list, delete, thumbnail) requires a UNION query
**Reason:** shared operations work cleanly on the base table; type-specific constraints are enforced by the database. Tradeoff: every asset read is a join, Prisma returns null sub-tables for non-matching types.

### Custom field values stored as JSONB
**Decision:** `value` column is JSONB, `valueType` enum tells the frontend how to render it.
**Alternatives considered:** storing value as `text` and casting in application code.
**Reason:** JSONB preserves native types in the database (boolean stays boolean, number stays number). Storing as text and casting later is indefensible — nothing prevents a boolean field storing an invalid value.

### Prisma v6 over v7
**Decision:** Downgraded from Prisma v7 to v6.
**Reason:** Prisma v7 moved datasource configuration out of `schema.prisma` into a separate `prisma.config.ts` file — a breaking change that adds setup complexity. v6 supports the standard `schema.prisma` url configuration. Can be revisited with more time.