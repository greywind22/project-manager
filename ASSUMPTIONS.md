# Assumptions

Things assumed due to missing information. Each would be verified with the client given more time.

---

- There are multiple projects (list + detail view), not a single project
- `bookingId` and `customerRef` are opaque reference strings from an external system, not FKs to internal tables. Not all projects may have them.
- Photo vs Document distinction is user-driven — the user picks which section to upload into
- Address is for display only — no need to filter or search by address components
- Not all projects will have all asset types
- Video assets are external URLs only (YouTube/Vimeo) — raw video upload is out of scope
- Asset thumbnails are static fallback images served from `frontend/public/thumbnails/`. YouTube videos use the YouTube CDN thumbnail (no API key required). Vimeo and links use static icons.
- Custom fields are seeded, not user-created via the UI
- Booked date is display-only — not used for filtering or sorting
- Status values are a fixed set (In Progress, Complete, Cancelled) based on the mockup. No requirement to support custom statuses.
- Single user — no multi-user or role-based access. All data is visible to whoever has access to the app.