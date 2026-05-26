// ============================================================
//  FIREBASE CONFIGURATION — Hein & Maine
// ============================================================
//
//  HOW TO SET UP (takes ~5 minutes):
//
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → name it "hein-and-maine" → Continue
//  3. Disable Google Analytics (not needed) → Create project
//  4. In the project overview, click the </> (Web) icon to add a web app
//  5. Register the app (nickname: "hein-and-maine") → Continue
//  6. Copy the firebaseConfig object shown on screen
//  7. Paste the values into the fields below (replacing each "YOUR_..." placeholder)
//
//  FIRESTORE SETUP:
//  8. In the left sidebar: Build → Firestore Database
//  9. Click "Create database" → Start in test mode → Next
//  10. Choose your nearest region (e.g. us-east1) → Enable
//
//  That's it! Collections (watchlist, notes, journal) are created
//  automatically the first time you add data — no manual setup needed.
//
//  ⚠️  TEST MODE WARNING: Firestore test mode rules expire after 30 days.
//  After that, open Firestore → Rules and paste this (safe for a private site):
//
//  rules_version = '2';
//  service cloud.firestore {
//    match /databases/{database}/documents {
//      match /{document=**} {
//        allow read, write: if true;
//      }
//    }
//  }
//
// ============================================================

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",                        // ← paste here
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",     // ← paste here
  projectId:         "YOUR_PROJECT_ID",                     // ← paste here
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",         // ← paste here
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",            // ← paste here
  appId:             "YOUR_APP_ID",                         // ← paste here
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
