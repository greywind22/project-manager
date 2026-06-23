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

### Static thumbnails served from frontend/public
**Decision:** Thumbnails are static fallback images in `frontend/public/thumbnails/` — one per asset type (link.png, document.png, image.png, youtube.png, vimeo.png). YouTube videos additionally use the YouTube CDN thumbnail which requires no API key.
**Alternatives considered:** Generating real thumbnails on upload (pdf-thumbnail for docs, microlink.io og:image for links, Vimeo oEmbed API for Vimeo).
**Reason:** Real thumbnail generation adds third-party dependencies and async complexity not warranted within the time constraint.

### Separate endpoints per asset type
**Decision:** `/assets/links`, `/assets/files`, `/assets/videos` rather than a single `/assets` endpoint.
**Alternatives considered:** Single `/assets` endpoint with a `type` discriminator.
**Reason:** Request shapes are fundamentally different — links and videos are JSON, files are multipart. A unified endpoint would require runtime type switching with no real benefit.

### Nested asset routes
**Decision:** Asset routes nested under projects: `POST /api/projects/:projectId/assets/links`.
**Alternatives considered:** Flat routes `POST /api/assets` with `projectId` in the body.
**Reason:** Ownership is clear in the URL. An asset always belongs to a project — the route reflects that relationship.

### File asset update replaces the file on disk
**Decision:** Updating a file asset deletes the old file and saves the new one before updating the DB record.
**Tradeoff:** If the DB update fails after the new file is saved, the new file is orphaned on disk. A robust solution would use a transaction with compensating actions (save new file, attempt DB update, rollback by deleting new file on failure). Out of scope for this exercise.