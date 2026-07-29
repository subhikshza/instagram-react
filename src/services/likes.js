// src/services/likes.js
// Likes are stored in TWO places, written together in one batch:
//   1. posts/{postId}/likes/{uid}  -> source of truth; doc existence == liked.
//      (one doc per user per post, so likes can't be double-counted)
//   2. users/{uid}/likes/{postId}  -> a mirror, so we can cheaply list every
//      post a given viewer has liked when enriching the feed (no extra index).
// The post's likesCount is kept in sync in the same batch.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/** Like a post (idempotent — liking twice does not double-count). */
export async function likePost(postId, uid) {
  const likeRef = doc(db, "posts", postId, "likes", uid);
  if ((await getDoc(likeRef)).exists()) return; // already liked

  const batch = writeBatch(db);
  batch.set(likeRef, { uid, createdAt: serverTimestamp() });
  batch.set(doc(db, "users", uid, "likes", postId), {
    postId,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, "posts", postId), { likesCount: increment(1) });
  await batch.commit();
}

/** Unlike a post (idempotent). */
export async function unlikePost(postId, uid) {
  const likeRef = doc(db, "posts", postId, "likes", uid);
  if (!(await getDoc(likeRef)).exists()) return; // wasn't liked

  const batch = writeBatch(db);
  batch.delete(likeRef);
  batch.delete(doc(db, "users", uid, "likes", postId));
  batch.update(doc(db, "posts", postId), { likesCount: increment(-1) });
  await batch.commit();
}

/** Toggle like state. Returns the new state: true = now liked, false = now unliked. */
export async function toggleLike(postId, uid) {
  if (await hasLiked(postId, uid)) {
    await unlikePost(postId, uid);
    return false;
  }
  await likePost(postId, uid);
  return true;
}

/** Has this user liked this post? */
export async function hasLiked(postId, uid) {
  const snap = await getDoc(doc(db, "posts", postId, "likes", uid));
  return snap.exists();
}

/** All uids that liked a post. */
export async function getPostLikes(postId) {
  const snap = await getDocs(collection(db, "posts", postId, "likes"));
  return snap.docs.map((d) => d.id);
}

/** Set of post ids the viewer has liked — reads the viewer's mirror. */
export async function getLikedPostIds(uid) {
  const snap = await getDocs(collection(db, "users", uid, "likes"));
  return new Set(snap.docs.map((d) => d.id));
}
