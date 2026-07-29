// src/services/users.js
// CRUD for the `users` collection.  Doc id == Firebase Auth uid.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { toSuggestion } from "./helpers";

const usersCol = collection(db, "users");

/**
 * Create (or upsert) a user profile document. Call this right after signup.
 * @param {string} uid   Firebase Auth uid
 * @param {object} data  { username, name, avatar, email, bio? }
 */
export async function createUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      username: data.username,
      name: data.name || "",
      avatar: data.avatar || "",
      email: data.email || "",
      bio: data.bio || "",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  return uid;
}

/** Read a single user profile by uid. Returns { id, ...data } or null. */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Look up a user by their (unique) username. Returns { id, ...data } or null. */
export async function getUserByUsername(username) {
  const q = query(usersCol, where("username", "==", username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/** Update editable profile fields (name, avatar, bio). */
export async function updateUserProfile(uid, updates) {
  const allowed = ["username", "name", "avatar", "bio"];
  const clean = {};
  for (const k of allowed) if (k in updates) clean[k] = updates[k];
  await updateDoc(doc(db, "users", uid), clean);
}

/** Delete a user profile document. */
export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, "users", uid));
}

/**
 * "Suggested for you" list: newest users, excluding the current user.
 * Returns rows in the exact `suggestions` shape the sidebar renders.
 */
export async function getSuggestions(currentUid, max = 5) {
  const q = query(usersCol, orderBy("createdAt", "desc"), limit(max + 1));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.id !== currentUid)
    .slice(0, max)
    .map((d) => toSuggestion({ id: d.id, ...d.data() }));
}
