# Lumina — Premium Streaming Platform

A production-grade Netflix-style streaming web app built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **TMDB** + **NexStream** integrations.

## Features

- **TMDB API v3** — Trending, popular, top rated, genres, search, details, cast, similar, trailers (server-side only)
- **NexStream** — Server-side `/embed` route + `/api/embed` proxy hide your API key; custom player with 10s skip, progress save every 15s, TV episode picker
- **Supabase Auth** — Email/password, Google, GitHub OAuth
- **Multi-profile** — Up to 5 profiles per account (Netflix-style)
- **My List**, **Continue Watching**, **Watch History**, **User Ratings** (1–10)
- **Premium UI** — Hero banner, drag-scroll rows, detail modals, skeleton loaders, AI search assistant

## Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) project
- [TMDB](https://www.themoviedb.org/settings/api) API key (v3)
- [NexStream](https://api.codespecters.com/) API key

## Quick Start

### 1. Clone and install

```bash
npm install
cp .env.example .env.local
```

### 2. Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, for admin tasks |
| `TMDB_API_KEY` | TMDB API v3 key (**server only**) |
| `NEXSTREAM_API_KEY` | NexStream embed key (**server only**) |
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` |

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in [supabase/migrations/001_initial.sql](supabase/migrations/001_initial.sql) via the SQL Editor
3. Enable **Authentication → Providers**: Email, Google, GitHub
4. Add redirect URL: `http://localhost:3000/auth/callback` (and your production URL)
5. Optional: create a public Storage bucket `avatars` for profile images

### 4. Get API keys

**TMDB**

1. Create an account at [themoviedb.org](https://www.themoviedb.org/)
2. Settings → API → Request an API Key (Developer)
3. Copy the **API Key (v3)** into `TMDB_API_KEY`

**NexStream**

1. Visit [api.codespecters.com](https://api.codespecters.com/)
2. Register and obtain your API key (`nx_...`)
3. For production, domain-lock the key to your deployed domain
4. Set `NEXSTREAM_API_KEY` in `.env.local`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → sign up → create a profile → browse and play.

## Project Structure

```
app/
  (auth)/          Login & signup
  (main)/          Protected browse pages
  api/             TMDB proxy, NexStream embed proxy, search
  auth/callback/   OAuth callback
  profiles/        Profile selector
components/
  browse/          Hero, rows, cards
  modals/          Detail & video player
  layout/          Navbar, sidebar
  auth/            Forms & profile UI
lib/
  tmdb/            Server TMDB client
  supabase/        Auth clients
  nexstream/       Embed URL builder (server-only)
actions/           Server Actions (watchlist, progress, profiles)
supabase/migrations/
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL
5. Add the same URL to Supabase Auth redirect URLs
6. Domain-lock your NexStream key to the Vercel domain

```bash
npm run build
```

## Security

- API keys never exposed to the client bundle
- Zod validation on Server Actions
- In-memory rate limiting on API routes (use Upstash Redis in production)
- Row Level Security on all Supabase tables
- Protected routes via middleware

## Disclaimer

This is a demo/educational project. Streaming third-party content may violate copyrights and terms of service. Use responsibly and only with rights you hold or licenses you have obtained.

## License

MIT
