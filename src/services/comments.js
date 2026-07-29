// src/services/comments.js
// CRUD for comments — stored as a subcollection: posts/{postId}/comments/{id}.
// A writeBatch keeps the post's commentsCount in sync with the comment docs.

import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function commentsCol(postId) {
  return collection(db, "posts", postId, "comments");
}

/**
 * Add a comment to a post and bump the post's commentsCount atomically.
 * @param {string} postId
 * @param {object} author  { uid, username }
 * @param {string} text
 * @returns {string} new comment id
 */
export async function addComment(postId, author, text) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("addComment: text is empty");

  const batch = writeBatch(db);
  const commentRef = doc(commentsCol(postId)); // pre-generate id
  batch.set(commentRef, {
    uid: author.uid,
    username: author.username,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, "posts", postId), { commentsCount: increment(1) });
  await batch.commit();
  return commentRef.id;
}

/**
 * Get the most recent comments for a post (oldest-first display order).
 * @param {number} [max]  preview count; omit for "all"
 * @returns {Array<{id, uid, username, text, createdAt}>}
 */
export async function getCommentsForPost(postId, max) {
  const base = query(commentsCol(postId), orderBy("createdAt", "asc"));
  const q = max ? query(commentsCol(postId), orderBy("createdAt", "asc"), limit(max)) : base;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Delete a comment and decrement the post's commentsCount atomically. */
export async function deleteComment(postId, commentId) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "posts", postId, "comments", commentId));
  batch.update(doc(db, "posts", postId), { commentsCount: increment(-1) });
  await batch.commit();
}

/** Realtime comments listener. Returns an unsubscribe function. */
export function subscribeToComments(postId, callback) {
  const q = query(commentsCol(postId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
