import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyCxGiiNIzrqFwZZoVVEFv-7YrUsCTWU5Hc",
  authDomain:        "heinmaine-a004f.firebaseapp.com",
  projectId:         "heinmaine-a004f",
  storageBucket:     "heinmaine-a004f.firebasestorage.app",
  messagingSenderId: "780068448392",
  appId:             "1:780068448392:web:dc2636296b475599ad973d"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
