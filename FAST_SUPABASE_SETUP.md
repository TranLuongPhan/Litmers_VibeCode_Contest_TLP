# Supabase Database Setup Guide

Since I cannot access your Supabase account directly, you need to create the database yourself. It's free and easy!

## Step 1: Create Project on Supabase

1.  Go to [https://supabase.com/dashboard/projects](https://supabase.com/dashboard/projects)
2.  Click **"New Project"**.
3.  **Name:** `vibecode-db` (or anything you like).
4.  **Password:** Type a strong password and **COPY IT NOW** (you will need it in the next step).
5.  **Region:** Choose one close to you (e.g., Singapore, Tokyo, US West).
6.  Click **"Create new project"**.

## Step 2: Get Connection Strings

Wait a minute for the project to set up (it will say "Setting up project"). Once it's green/active:

1.  Click on your project card.
2.  In the left sidebar, click the **Settings icon (gear)** at the bottom, then **"Database"**.
3.  Scroll down to **"Connection string"**.
4.  Click the **"URI"** tab.

You will see a string like this:
`postgresql://postgres.xxxx:YOUR-PASSWORD@aws-0-xxxx.pooler.supabase.com:6543/postgres`

## Step 3: Update your .env file

1.  Open the `.env` file in your project root (VS Code).
2.  Update the `DATABASE_URL` line. Paste the string you copied, but **replace `[YOUR-PASSWORD]` with the actual password** you created in Step 1.
    *   **Tip:** If your password has special characters like `#` or `?`, you might need to "URL encode" them (e.g., `#` becomes `%23`). It's easier to just use letters and numbers if possible.
3.  Add `?pgbouncer=true` to the end of the `DATABASE_URL` if it's not there.

Example:
```env
DATABASE_URL="postgresql://postgres.abcd:MySecretPass123@aws-0-sg.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcd:MySecretPass123@aws-0-sg.pooler.supabase.com:5432/postgres"
```
*(Note: `DIRECT_URL` is usually the same but port `5432` instead of `6543` and no `pgbouncer` param).*

## Step 4: Run the Migration

Once your `.env` is saved with the correct URL and password, run this command in your terminal:

```bash
npx prisma migrate dev --name init
```

This will verify the connection and create the tables.

