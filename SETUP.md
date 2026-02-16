# Vandi - Database Setup

## 1. Install dependencies

```bash
npm install
```

This will install Prisma and run `prisma generate`.

## 2. Database credentials

Add `DATABASE_URL` to your **`.env.local`** file. The format is:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Where to put credentials

| File | Purpose |
|------|---------|
| `.env.local` | Your local environment (never commit this) |
| `.env.example` | Template for other developers (safe to commit) |

### Example values

**Local PostgreSQL:**
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/vandi"
```

**Neon (free tier):**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy the connection string, e.g.:
```
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/vandi?sslmode=require"
```

**Supabase (free tier):**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a project → Settings → Database
3. Copy the connection string (URI format)

## 3. Create the database and run migrations

```bash
# Create the database (if using local PostgreSQL, create it first)
# psql -U postgres -c "CREATE DATABASE vandi;"

# Run migrations
npx prisma migrate dev --name init
```

## 4. Start the app

```bash
npm run dev
```

---

## Summary of credentials

| Variable | Where | Example |
|----------|-------|---------|
| `DATABASE_URL` | `.env.local` | `postgresql://postgres:password@localhost:5432/vandi` |
| `JWT_SECRET` | `.env.local` | (already set) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `.env.local` | (already set) |
