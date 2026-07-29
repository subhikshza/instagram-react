// src/services/saves.js
// Bookmarks / saved posts — supports the `saved` flag on each post in the UI.
// Stored as users/{uid}/saved/{postId}. (Bonus collection beyond the core five;
// kept tiny because the <Post/> component renders a saved state.)

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/** Save (bookmark) a post for a user. */
export async function savePost(postId, uid) {
  await setDoc(doc(db, "users", uid, "saved", postId), {
    postId,
    createdAt: serverTimestamp(),
  });
}

/** Remove a saved post. */
export async function unsavePost(postId, uid) {
  await deleteDoc(doc(db, "users", uid, "saved", postId));
}

/** Toggle saved state. Returns the new state. */
export async function toggleSave(postId, uid) {
  const ref = doc(db, "users", uid, "saved", postId);
  if ((await getDoc(ref)).exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { postId, createdAt: serverTimestamp() });
  return true;
}

/** Set of post ids the viewer has saved — used to fill the `saved` flag. */
export async function getSavedPostIds(uid) {
  const snap = await getDocs(collection(db, "users", uid, "saved"));
  return new Set(snap.docs.map((d) => d.id));
}
