// src/firebase/firebase.js
//
// Firebase initialization for the Instagram clone.
//
// This is a drop-in upgrade of the existing firebase.js (Member 1's file).
// It keeps the SAME exports (auth, db, storage, default app) and the SAME
// VITE_FIREBASE_* env var names, so nothing already using it breaks.
//
// Two additions:
//   1. Works in Node too (for the DB test scripts), not just Vite — it reads
//      config from import.meta.env OR process.env.
//   2. Optional Firebase Emulator support: set VITE_USE_EMULATOR=true (Vite)
//      or USE_EMULATOR=true (Node) to point auth/firestore/storage at local
//      emulators instead of the real project. Used by the test harness.
//
// If Member 1 prefers to keep their original firebase.js, that is fine —
// the only thing the service layer needs is that this module exports `db`
// and `storage`.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Read an env var from Vite (import.meta.env) first, then Node (process.env).
function env(key) {
  // import.meta.env exists under Vite; under Node import.meta has no `env`,
  // so the optional chaining just yields undefined without throwing.
  const viteVal =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env[key]
      : undefined;
  if (viteVal !== undefined) return viteVal;
  if (typeof process !== "undefined" && process.env) return process.env[key];
  return undefined;
}

const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID") || "demo-instagram-clone",
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("VITE_FIREBASE_APP_ID"),
};

// Avoid re-initializing during hot reloads / repeated imports.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- Optional: connect to local emulators for safe, offline testing ---
const useEmulator =
  env("VITE_USE_EMULATOR") === "true" || env("USE_EMULATOR") === "true";

if (useEmulator) {
  const host = env("EMULATOR_HOST") || "127.0.0.1";
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
  try {
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  } catch {
    // auth emulator may already be connected; ignore.
  }
}

export default app;
