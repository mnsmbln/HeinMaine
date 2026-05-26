// ============================================================
//  SUPABASE CONFIGURATION — Hein & Maine
// ============================================================
//
//  HOW TO SET UP (takes ~5 minutes, completely free):
//
//  1. Go to https://supabase.com and sign up / sign in
//  2. Click "New project"
//  3. Name it "hein-and-maine", set a database password, pick a region
//  4. Wait ~2 minutes for the project to spin up
//  5. Go to Project Settings → API
//  6. Copy "Project URL"  → paste as SUPABASE_URL below
//  7. Copy "anon public" key → paste as SUPABASE_ANON_KEY below
//
//  DATABASE SETUP:
//  8. Go to the SQL Editor (left sidebar)
//  9. Click "New query" and paste + run the SQL from README.md
//     (creates the watchlist, notes, and journal tables)
//
// ============================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://eyhpbxniyuhdimqqngzf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_i26Hgp-19EyYWqgWEEp7Gw_z9BcyDYH'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
