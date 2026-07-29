// src/services/posts.js
// CRUD for the `posts` collection + a feed reader that outputs UI-ready posts.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { toFeedPost } from "./helpers";
import { getLikedPostIds } from "./likes";
import { getSavedPostIds } from "./saves";
import { getCommentsForPost } from "./comments";

const postsCol = collection(db, "posts");

/**
 * Create a post. `image` is the download URL of an already-uploaded image
 * (image upload to Storage is Member 3's helper — see services/storage.js).
 *
 * @param {object} author  { uid, username, avatar }  (denormalized for the feed)
 * @param {object} data    { image, caption?, location? }
 * @returns {string} new post id
 */
export async function createPost(author, data) {
  if (!author?.uid) throw new Error("createPost: author.uid is required");
  if (!data?.image) throw new Error("createPost: data.image is required");

  const ref = await addDoc(postsCol, {
    uid: author.uid,
    username: author.username,
    avatar: author.avatar || "",
    image: data.image,
    caption: data.caption || "",
    location: data.location || "",
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });

  // keep the author's postsCount in sync
  await updateDoc(doc(db, "users", author.uid), {
    postsCount: increment(1),
  }).catch(() => {}); // user doc may not exist in some test setups

  return ref.id;
}

/** Read one post. Returns { id, ...data } or null. */
export async function getPost(postId) {
  const snap = await getDoc(doc(db, "posts", postId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** All posts by one user, newest first (raw docs). */
export async function getPostsByUser(uid) {
  const q = query(postsCol, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Update a post's caption / location (only the author should be allowed — see rules). */
export async function updatePost(postId, updates) {
  const allowed = ["caption", "location"];
  const clean = {};
  for (const k of allowed) if (k in updates) clean[k] = updates[k];
  await updateDoc(doc(db, "posts", postId), clean);
}

/**
 * Delete a post and decrement the author's postsCount.
 * (Deleting the comments/likes subcollections is best done by a Cloud Function
 * in production; for this project the post document going away is enough for
 * the demo. A helper to purge subcollections lives in scripts/ if needed.)
 */
export async function deletePost(postId, authorUid) {
  await deleteDoc(doc(db, "posts", postId));
  if (authorUid) {
    await updateDoc(doc(db, "users", authorUid), {
      postsCount: increment(-1),
    }).catch(() => {});
  }
}

/**
 * Build the home feed as an array of UI-ready post objects (exact <Post/> shape).
 * Global reverse-chronological feed — simplest thing that matches the mock UI.
 *
 * @param {string} [viewerUid]  used to fill in `liked` / `saved` per post
 * @param {number} [max]
 */
export async function getFeedPosts(viewerUid, max = 20) {
  const q = query(postsCol, orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  const rawPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // viewer context (liked / saved sets) — one read each, not per-post
  const [likedPostIds, savedPostIds] = await Promise.all([
    viewerUid ? getLikedPostIds(viewerUid) : Promise.resolve(new Set()),
    viewerUid ? getSavedPostIds(viewerUid) : Promise.resolve(new Set()),
  ]);

  // preview comments for each post
  const commentsPerPost = await Promise.all(
    rawPosts.map((p) => getCommentsForPost(p.id, 2))
  );

  return rawPosts.map((p, i) =>
    toFeedPost(p, {
      likedPostIds,
      savedPostIds,
      comments: commentsPerPost[i],
    })
  );
}

/**
 * Realtime feed subscription. Calls `callback(rawPosts)` whenever posts change.
 * Returns an unsubscribe function. (Enrich with toFeedPost in the component if
 * you want liked/saved state — kept raw here so it stays a light listener.)
 */
export function subscribeToFeed(callback, max = 20) {
  const q = query(postsCol, orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
