# Assumptions

Things assumed due to missing information. Each would be verified with the client given more time.

---

- There are multiple projects (list + detail view), not a single project
- `bookingId` and `customerRef` are opaque reference strings from an external system, not FKs to internal tables. Not all projects may have them.

- Photo vs Document distinction is user-driven — the user picks which section to upload into
- Address is for display only — no need to filter or search by address components
- Not all projects will have all asset types
- Video assets are external URLs only (YouTube/Vimeo) — raw video upload is out of scope
- Link thumbnails will be null for now — no rich preview
- Custom fields are seeded, not user-created via the UI