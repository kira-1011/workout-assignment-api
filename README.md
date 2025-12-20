# Workout Assignment API

REST API for trainers to create and assign workouts to clients.

---

## Prerequisites

- Node.js 18+
- pnpm
- Docker (recommended) or PostgreSQL

---

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd workout-assignment-api
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workout_db"
JWT_SECRET="your-secret-key-minimum-32-characters-long"
JWT_EXPIRES_IN=604800000
PORT=3000
```

> **Note:** When using Docker, `DATABASE_URL` is automatically set to connect to the containerized database.

---

## Running the Application

### Option A: Docker (Recommended)

Docker includes both the API and PostgreSQL database. Migrations run automatically on startup.

**Development:**

```bash
docker-compose up -d
```

This starts:
- API server with hot-reloading at `http://localhost:3000`
- PostgreSQL database at `localhost:5432`
- Swagger docs at `http://localhost:3000/api-docs`

**Production:**

Update `docker-compose.yml` to use the `prod` target:

```yaml
services:
  api:
    build:
      context: .
      target: prod  # Change from 'dev' to 'prod'
```

Then run:

```bash
docker-compose up -d --build
```

---

### Option B: Local Setup

**1. Start PostgreSQL locally**

Ensure PostgreSQL is running and create a database named `workout_db`.

**2. Run database migrations**

```bash
pnpm prisma migrate dev
```

**3. Generate Prisma client**

```bash
pnpm prisma generate
```

**4. Start the server**

```bash
# Development (with hot-reload)
pnpm dev

# Production
pnpm build
pnpm start
```

---

## Prisma Commands

| Command | Description |
|---------|-------------|
| `pnpm prisma generate` | Generate Prisma client |
| `pnpm prisma migrate dev` | Run migrations (development) |
| `pnpm prisma migrate deploy` | Run migrations (production) |
| `pnpm prisma studio` | Open database GUI |

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests (watch mode) |
| `pnpm test:run` | Run tests once |
| `pnpm lint` | Lint & format code |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register user | - |
| POST | `/auth/login` | Login | - |
| POST | `/workouts` | Create workout | Trainer |
| GET | `/workouts` | Get trainer's workouts | Trainer |
| POST | `/workouts/:id/assign` | Assign to client | Trainer |
| GET | `/my-workouts` | Get assigned workouts | Client |

---

## API Documentation

Swagger UI is available at: `http://localhost:3000/api-docs`
