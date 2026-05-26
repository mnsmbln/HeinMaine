# Hein & Maine 🤍

A cozy, private long-distance relationship website for two. Built with React + Vite + Firebase Firestore.

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
- An internet connection (for Firebase + Google Fonts)

---

### 1. Install dependencies

Open your terminal, navigate to this folder, and run:

```bash
npm install
```

---

### 2. Create your Firebase project

> This takes about 5 minutes and is completely free.

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)**
2. Sign in with a Google account
3. Click **"Add project"** → name it `hein-and-maine` → Continue
4. Disable Google Analytics (you don't need it) → **Create project**

**Add a Web App:**

5. On the project overview page, click the **`</>`** (Web) icon
6. Give it a nickname: `hein-and-maine` → click **Register app**
7. You'll see a `firebaseConfig` object — **keep this page open**

**Enable Firestore:**

8. In the left sidebar: **Build → Firestore Database**
9. Click **Create database**
10. Choose **"Start in test mode"** → Next
11. Pick a region close to you (e.g. `us-east1`) → **Enable**

---

### 3. Paste your Firebase credentials

Open **`src/firebase.js`** and replace each `"YOUR_..."` placeholder with the values from your Firebase console:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",          // ← from Firebase console
  authDomain:        "hein-and-maine.firebaseapp.com",
  projectId:         "hein-and-maine",
  storageBucket:     "hein-and-maine.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc...",
}
```

Save the file. That's the only thing you need to change.

---

### 4. Run the app locally

```bash
npm run dev
```

Open your browser to **http://localhost:5173** — the site should load with the warm cozy design.

> **Note about the clocks:** They tick live in your browser, no Firebase needed.  
> **Note about Firestore features:** Once your Firebase credentials are pasted, the Watch Together, Love Notes, and Journal sections will sync in real time between any two devices.

---

### 5. Deploy to Vercel (free, takes ~2 minutes)

Vercel gives you a live URL so both of you can access the site from anywhere.

**Option A — Vercel CLI (easiest):**

```bash
# Install Vercel CLI globally (one-time)
npm install -g vercel

# Log in to Vercel
vercel login

# Deploy from inside your project folder
vercel
```

Follow the prompts:
- Set up and deploy? → `Y`
- Which scope? → your personal account
- Link to existing project? → `N`
- Project name → `hein-and-maine` (or anything you like)
- In which directory is your code? → `.` (current directory)
- Override settings? → `N`

Your site will be live at a URL like `https://hein-and-maine.vercel.app` 🎉

**Option B — GitHub + Vercel dashboard:**

1. Push this folder to a private GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. No environment variables needed (Firebase config is in source)
4. Click Deploy

> **No environment variables needed** — Firebase config lives directly in `src/firebase.js`. For a private two-person site this is fine.

---

## ⚠️ Important: Firestore rules expiry

Firestore "test mode" rules **expire after 30 days**. After that, the app will stop being able to read/write data.

To fix it, open Firestore in your Firebase console → **Rules** tab → replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**. This is safe for a private two-person site.

---

## Color Palette

| Name | Hex |
|------|-----|
| Cream | `#FDF6EC` |
| Cream Dark | `#F0E6D3` |
| Terracotta | `#C5705D` |
| Dusty Rose | `#D4A5A5` |
| Soft Brown | `#8B6355` |
| Muted Green | `#8FAF8B` |

---

## Tech Stack

- **React 18** + **Vite 5** — fast modern frontend
- **Tailwind CSS 3** — utility-first styling with custom earthy palette
- **Firebase Firestore v10** — real-time shared database (free Spark plan)
- **Google Fonts** — Playfair Display (serif) + Lato (sans-serif)
- **react-icons** — icon set
- **Intl API** — timezone formatting (no date library needed)

---

## Firestore data structure

```
watchlist/
  {docId}: { title, type, watchDate, addedBy, watched, createdAt }

notes/
  {docId}: { from, text, linkUrl, createdAt }

journal/
  {docId}: { writtenBy, title, content, mood, songUrl, createdAt }
```

---

*made with love, for Hein & Maine 🌍❤️*
# HeinMaine
