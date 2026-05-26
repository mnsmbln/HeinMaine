# Hein & Maine 🤍

A cozy, private long-distance relationship website for two. Built with React + Vite + Supabase (PostgreSQL).

---

## Features

| Tab | What it does |
|-----|-------------|
| 🕐 Our Clocks | Live dual-timezone clocks — Rockville (EST/EDT) and Doha (AST) |
| 🎬 Watch Together | Shared watchlist with dual-timezone date display |
| 💌 Love Notes | Masonry wall of sticky-note-style messages |
| 📖 Our Journal | Shared diary with mood tracking and search |

---

## Setup

### Prerequisites
- **Node.js 18+** — download from [nodejs.org](https://nodejs.org)

---

### 1. Install dependencies

```bash
npm install
```

---

### 2. Create your Supabase project

> Free forever, no credit card needed.

1. Go to **[supabase.com](https://supabase.com)** → sign up with GitHub or email
2. Click **"New project"**
3. Name it `hein-and-maine`, set a database password, pick a region → **Create project**
4. Wait about 2 minutes for it to spin up

---

### 3. Get your credentials

1. In the left sidebar go to **Project Settings → API**
2. Copy **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy **anon public** key (a long string starting with `eyJ...`)
4. Open **`src/supabase.js`** and paste them in:

```js
const SUPABASE_URL      = 'https://xxxx.supabase.co'   // ← your URL
const SUPABASE_ANON_KEY = 'eyJ...'                      // ← your anon key
```

---

### 4. Create the database tables

1. In the Supabase sidebar go to **SQL Editor** → **New query**
2. Paste the entire block below and click **Run**:

```sql
-- Watchlist table
CREATE TABLE watchlist (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT        NOT NULL,
  type       TEXT        NOT NULL,
  watch_date TEXT,
  added_by   TEXT        NOT NULL,
  watched    BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  sender     TEXT        NOT NULL,
  text       TEXT        NOT NULL,
  link_url   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal table
CREATE TABLE journal (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  written_by TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  mood       TEXT,
  song_url   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read/write (safe for a private two-person site)
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow all" ON watchlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON notes     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON journal   FOR ALL USING (true) WITH CHECK (true);

-- Enable real-time updates
ALTER TABLE watchlist REPLICA IDENTITY FULL;
ALTER TABLE notes     REPLICA IDENTITY FULL;
ALTER TABLE journal   REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE watchlist;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE journal;
```

---

### 5. Run the app locally

```bash
npm run dev
```

Open **http://localhost:5173**

---

### 6. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) → New Project → Import → Deploy.

---

## Database schema

```
watchlist  — id, title, type, watch_date, added_by, watched, created_at
notes      — id, sender, text, link_url, created_at
journal    — id, written_by, title, content, mood, song_url, created_at
```

---

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** — custom earthy palette
- **Supabase** — PostgreSQL database + real-time subscriptions
- **Google Fonts** — Playfair Display + Lato
- **react-icons**

---

*made with love, for Hein & Maine 🌍❤️*
