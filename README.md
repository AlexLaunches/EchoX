# EchoX

A 24/7 X engagement bot that monitors a curated X List, identifies high-traffic original posts, and generates AI-powered reply drafts for manual review and approval.

## How It Works

1. A Vercel Cron Job runs every 40 minutes
2. It fetches new tweets from a configured X List
3. Retweets and replies are filtered out
4. The top 3 original posts by engagement are sent to Claude
5. Claude generates 3 reply drafts per tweet: Value-Adder, Challenger, and Wit
6. Drafts appear in the dashboard for review, editing, and posting

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI:** Claude claude-sonnet-4-20250514
- **APIs:** X API v2
- **Hosting:** Vercel
- **Auth:** Supabase Auth

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/AlexLaunches/EchoX.git
cd echox
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

### 4. Set up Supabase

Run the following SQL in your Supabase SQL Editor:

- Create tables: `niches`, `processed_tweets`, `drafts`
- Enable RLS with service role policies
- Add a foreign key from `drafts.tweet_id` to `processed_tweets.tweet_id`

### 5. Add your X List

Insert a row into the `niches` table with your X List ID and persona instruction.

### 6. Deploy to Vercel

Connect your GitHub repo to Vercel, add all environment variables, and deploy.

## Dashboard

Visit `/dashboard` to review pending drafts. You will be prompted to log in with your Supabase Auth credentials.

## Environment Variables

See `.env.example` for all required variables.
