# Database Migration Guide

## Breaking Change: Ride → Trip

This migration replaces the `Ride` model with `Trip` and updates `User`. **Existing data will be lost.**

## Steps

### 1. Backup (optional)

```bash
pg_dump -U postgres vandi > backup.sql
```

### 2. Reset and migrate (development)

```bash
cd vandi
npx prisma migrate dev --name production_trip_schema
```

This will:
- Drop existing `Ride` and `Rating` tables
- Create new `Trip` and `Rating` tables
- Update `User` table (add `name`, change `id` to uuid)

### 3. If you have existing users

The User model now uses `uuid()` for id. If you have existing users with `cuid()`, you may need to:

1. Run a custom migration to preserve users
2. Or reset: `npx prisma migrate reset` (drops all data)

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Verify

```bash
npm run dev
```

Sign up a new user, book a trip, and verify the flow.
