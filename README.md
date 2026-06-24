# Project Manager

A web app for storing and managing project-related information and assets.

Built with React, TypeScript, NestJS, and PostgreSQL.

## Structure

```
backend/   — NestJS REST API
frontend/  — React + Vite + Tailwind
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 15+ installed locally ([download](https://www.postgresql.org/download/windows/))

---

## Backend setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create databases

In pgAdmin or psql, create two databases:
- `project_manager` — development
- `project_manager_test` — tests

### 3. Configure environment

**Windows:**
```bash
copy .env.example .env
copy .env.test.example .env.test
```

**Mac/Linux:**
```bash
cp .env.example .env
cp .env.test.example .env.test
```

Edit `.env` and fill in your Postgres password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_manager"
```

Edit `.env.test` and fill in your Postgres password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_manager_test"
```

### 4. Run migrations

Against the dev database:
```bash
npx prisma migrate dev --name init
```

Against the test database:
```bash
npm run db:migrate:test
```

### 5. Seed sample data

```bash
npm run seed
```

### 6. Start the backend

```bash
npm run start:dev
```

Backend runs at `http://localhost:3000/api`

---

## Frontend setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Add thumbnail images (optional)

Place the following images in `frontend/public/thumbnails/`:
- `link.png`
- `document.png`
- `image.png`
- `youtube.png`
- `vimeo.png`

Without these, assets will show no thumbnail. Source 100x100px icons from [flaticon.com](https://flaticon.com) or [icons8.com](https://icons8.com).

### 3. Start the frontend

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Running tests

### Backend

```bash
cd backend
npm test          # unit tests
npm run test:e2e  # E2E tests (requires test database to be set up)
```

### Frontend

```bash
cd frontend
npm test
```