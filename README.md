# Project Manager

A web app for storing and managing project-related information and assets.

Built with React, TypeScript, NestJS, and PostgreSQL.

## Monorepo structure

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

### 1. Create databases

In pgAdmin or psql, create two databases:
- `project_manager` — development
- `project_manager_test` — tests

### 2. Configure environment

```bash
cd backend
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

### 3. Run migrations

Against the dev database:

```bash
cd backend
npx prisma migrate dev --name init
```

Against the test database:

```bash
npm run db:migrate:test
```

### 4. Seed sample data

```bash
npm run seed
```

### 5. Start the backend

```bash
npm run start:dev
```

Backend runs at `http://localhost:3000/api`

---

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Running tests

```bash
cd backend
npm test
```