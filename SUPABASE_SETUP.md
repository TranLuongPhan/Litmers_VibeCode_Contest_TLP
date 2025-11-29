# Supabase Setup Guide for Vercel Deployment

This guide will help you set up Supabase as your PostgreSQL database for this Next.js application deployed on Vercel.

## Prerequisites

- A Vercel account
- A Supabase account (free tier available)
- Your Next.js application code

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **Sign In** or **Start your project**
3. Sign in with GitHub (recommended) or email
4. Click **New Project**
5. Fill in the project details:
   - **Name**: `vibecode-db` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient to start
6. Click **Create new project**
7. Wait 2-3 minutes for the database to be provisioned

## Step 2: Get Your Database Connection Strings

After your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **Database** in the left menu
3. Scroll down to **Connection string** section
4. You'll need **TWO** connection strings:

### Connection Pooling URL (for your application)

1. Select **URI** tab under **Connection Pooling**
2. Copy the connection string (it looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with your database password
4. Add query parameters: `?pgbouncer=true&connection_limit=1`
5. This becomes your `DATABASE_URL`

**Example:**
```
DATABASE_URL="postgresql://postgres.abcdefgh:MyPassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Direct Connection URL (for migrations)

1. Select **URI** tab under **Connection string**
2. Copy the connection string (it looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with your database password
4. This becomes your `DIRECT_URL`

**Example:**
```
DIRECT_URL="postgresql://postgres.abcdefgh:MyPassword123@db.abcdefgh.supabase.co:5432/postgres"
```

## Step 3: Configure Local Environment

1. In your project root, create or update `.env` file:

```bash
# Copy from .env.example
DATABASE_URL="your-pooling-connection-string-here"
DIRECT_URL="your-direct-connection-string-here"

# Generate this with: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"

NEXTAUTH_URL="http://localhost:3000"
```

2. Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

3. Copy the output and paste it as your `AUTH_SECRET`

## Step 4: Run Database Migrations

1. Open terminal in your project directory
2. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all necessary tables in your Supabase database
- Generate the Prisma Client

3. Verify the migration worked:

```bash
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can see your database tables.

## Step 5: Configure Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables for **Production**, **Preview**, and **Development**:

| Variable Name | Value |
|--------------|-------|
| `DATABASE_URL` | Your Supabase pooling connection string |
| `DIRECT_URL` | Your Supabase direct connection string |
| `AUTH_SECRET` | Your generated auth secret |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://your-app.vercel.app`) |

5. Click **Save** for each variable

## Step 6: Deploy to Vercel

### Option A: Deploy via Git (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Add Supabase configuration"
git push
```

2. Vercel will automatically deploy your changes

### Option B: Deploy via Vercel CLI

```bash
vercel --prod
```

## Step 7: Run Migrations in Production

After deployment, you need to run migrations on your production database:

1. Go to your Vercel project dashboard
2. Click on **Deployments**
3. Click on your latest deployment
4. Click **...** (three dots) → **Redeploy**
5. Check **Use existing Build Cache**
6. Click **Redeploy**

Alternatively, use Vercel CLI:

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## Verification

1. Visit your deployed application
2. Try to register a new account at `/register`
3. Check if you can login at `/login`
4. Verify the user was created in Supabase:
   - Go to Supabase Dashboard
   - Click **Table Editor**
   - Select **User** table
   - You should see your registered user

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

- Make sure you've added the environment variables in Vercel dashboard
- Redeploy your application after adding variables

### "Can't reach database server"

- Verify your connection strings are correct
- Check that you replaced `[YOUR-PASSWORD]` with your actual password
- Ensure there are no extra spaces in the connection strings

### "SSL connection required"

- Supabase requires SSL by default (already configured in the connection strings)
- If you see this error, ensure you're using the exact connection strings from Supabase

### "Prisma Client not found"

- Run `npx prisma generate` locally
- Ensure `vercel.json` has the correct build command
- Redeploy your application

### Migration fails with "relation already exists"

- Your tables might already exist
- Use `npx prisma migrate resolve --applied <migration_name>` to mark migrations as applied
- Or use `npx prisma db push` to sync schema without migrations

## Next Steps

- **Enable Row Level Security (RLS)** in Supabase for better security
- **Set up backups** in Supabase dashboard
- **Monitor database usage** in Supabase dashboard
- **Consider upgrading** to Pro plan if you exceed free tier limits

## Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations locally
npx prisma migrate dev

# Run migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Push schema changes without migrations
npx prisma db push
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Vercel Documentation](https://vercel.com/docs)

---

**Need help?** Check the [Supabase Discord](https://discord.supabase.com) or [Vercel Discord](https://discord.gg/vercel)
