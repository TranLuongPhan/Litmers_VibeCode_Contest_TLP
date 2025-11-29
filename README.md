# VibeCode App

A full-stack Next.js application with authentication, built with Prisma, NextAuth, and Supabase.

## Features

- 🔐 **Authentication**: Email/password authentication with NextAuth.js
- 🗄️ **Database**: PostgreSQL via Supabase with Prisma ORM
- 🎨 **Modern UI**: Built with Next.js 16 and React 19
- 🚀 **Deployment**: Optimized for Vercel deployment
- 🔒 **Protected Routes**: Middleware-based route protection

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Deployment**: Vercel
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- A Vercel account (optional, for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd vibecode-app
npm install
```

### 2. Set Up Database

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Get your connection strings
- Configure environment variables

### 3. Configure Environment Variables

Create a `.env` file in the project root (use `.env.example` as template):

```bash
# Database (from Supabase)
DATABASE_URL="your-pooling-connection-string"
DIRECT_URL="your-direct-connection-string"

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Project Structure

```
vibecode-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth API routes
│   │   │   └── register/      # Registration API
│   │   ├── dashboard/         # Protected dashboard page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── layout.tsx         # Root layout with SessionProvider
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── auth.ts                # NextAuth configuration
│   └── middleware.ts          # Route protection middleware
├── .env.example               # Environment variables template
├── SUPABASE_SETUP.md          # Detailed Supabase setup guide
└── vercel.json                # Vercel deployment config
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma studio    # Open database GUI
npx prisma migrate dev    # Run migrations (development)
npx prisma migrate deploy # Run migrations (production)
npx prisma generate  # Generate Prisma Client

# Linting
npm run lint         # Run ESLint
```

## Authentication Flow

1. **Registration** (`/register`):
   - User enters name, email, and password
   - Password is hashed with bcrypt
   - User is stored in Supabase database
   - Redirects to login page

2. **Login** (`/login`):
   - User enters email and password
   - NextAuth validates credentials
   - JWT session is created
   - Redirects to dashboard

3. **Protected Routes**:
   - Middleware checks authentication
   - Unauthenticated users are redirected to login
   - Currently protects `/dashboard/*` routes

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
4. Deploy!

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed deployment instructions.

## Troubleshooting

### Common Issues

**"Environment variable not found"**
- Ensure `.env` file exists in project root
- Restart dev server after changing `.env`

**"Can't reach database server"**
- Verify Supabase connection strings are correct
- Check that database password is correct
- Ensure Supabase project is active

**"Prisma Client not found"**
- Run `npx prisma generate`
- Restart dev server

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for more troubleshooting tips.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## License

MIT

