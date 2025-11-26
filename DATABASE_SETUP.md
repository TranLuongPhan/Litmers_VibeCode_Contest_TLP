# PostgreSQL Database Setup Guide

## Option 1: Vercel Postgres (Recommended)

This is the easiest option since you're deploying to Vercel.

### Step 1: Create Database via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `vibecode-db`)
6. Select a region (choose one close to you)
7. Click **Create**

### Step 2: Get Connection String

After creating the database:
1. Click on your new database
2. Go to the **Settings** tab
3. Find the **Connection String** section
4. Copy the `DATABASE_URL` (it looks like: `postgres://username:password@host/database`)

### Step 3: Add to Your Project

Create or update your `.env` file in the project root:

```bash
DATABASE_URL="your-connection-string-here"
AUTH_SECRET="generate-this-with-openssl-command-below"
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 4: Run Migrations

```bash
cd vibecode-app
npx prisma migrate dev --name init
```

---

## Option 2: Neon (Free Tier)

Neon offers a generous free tier with serverless Postgres.

### Steps:

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string
5. Add to `.env` as shown above
6. Run migrations

---

## Option 3: Supabase (Free Tier)

Supabase provides a free PostgreSQL database with additional features.

### Steps:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password
6. Add to `.env` and run migrations

---

## Option 4: Local PostgreSQL (Development Only)

For local development, you can install PostgreSQL on your machine.

### Windows:

1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Install PostgreSQL
3. During installation, set a password for the `postgres` user
4. After installation, create a database:

```bash
# Open Command Prompt or PowerShell
psql -U postgres
CREATE DATABASE vibecode;
\q
```

5. Your connection string will be:
```
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/vibecode"
```

### macOS (using Homebrew):

```bash
brew install postgresql@15
brew services start postgresql@15
createdb vibecode
```

Connection string:
```
DATABASE_URL="postgresql://localhost:5432/vibecode"
```

---

## After Setting Up Database

### 1. Update .env file

```bash
DATABASE_URL="your-connection-string"
AUTH_SECRET="your-generated-secret"
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

This will create all the tables (User, Account, Session, VerificationToken).

### 4. Verify Database

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555` where you can see your tables.

---

## Troubleshooting

### "Environment variable not found"
- Make sure `.env` is in the project root (`vibecode-app/.env`)
- Restart your dev server after changing `.env`

### "Can't reach database server"
- Check your connection string is correct
- Verify your database is running (for local setup)
- Check firewall settings

### "SSL connection required"
For some providers, you may need to add `?sslmode=require` to your connection string:
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

---

## Quick Start (Recommended Path)

**For fastest setup:**

1. Use **Vercel Postgres** (free tier available)
2. Create database in Vercel dashboard
3. Copy connection string to `.env`
4. Run `npx prisma migrate dev --name init`
5. Start your app with `npm run dev`
6. Test registration at `http://localhost:3000/register`

That's it! 🚀
