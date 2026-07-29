// src/services/follows.js
// Follow graph, mirrored so both directions are cheap to read:
//   users/{followerUid}/following/{targetUid}
//   users/{targetUid}/followers/{followerUid}
// followingCount / followersCount on each user doc are kept in sync in the
// same batch.

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

/** followerUid starts following targetUid (idempotent, no self-follow). */
export async function followUser(followerUid, targetUid) {
  if (followerUid === targetUid) throw new Error("Cannot follow yourself");

  const edgeRef = doc(db, "users", followerUid, "following", targetUid);
  if ((await getDoc(edgeRef)).exists()) return; // already following

  const batch = writeBatch(db);
  batch.set(edgeRef, { uid: targetUid, createdAt: serverTimestamp() });
  batch.set(doc(db, "users", targetUid, "followers", followerUid), {
    uid: followerUid,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, "users", followerUid), { followingCount: increment(1) });
  batch.update(doc(db, "users", targetUid), { followersCount: increment(1) });
  await batch.commit();
}

/** followerUid stops following targetUid (idempotent). */
export async function unfollowUser(followerUid, targetUid) {
  const edgeRef = doc(db, "users", followerUid, "following", targetUid);
  if (!(await getDoc(edgeRef)).exists()) return; // wasn't following

  const batch = writeBatch(db);
  batch.delete(edgeRef);
  batch.delete(doc(db, "users", targetUid, "followers", followerUid));
  batch.update(doc(db, "users", followerUid), { followingCount: increment(-1) });
  batch.update(doc(db, "users", targetUid), { followersCount: increment(-1) });
  await batch.commit();
}

/** Does followerUid follow targetUid? */
export async function isFollowing(followerUid, targetUid) {
  const snap = await getDoc(doc(db, "users", followerUid, "following", targetUid));
  return snap.exists();
}

/** List uids that follow `uid`. */
export async function getFollowers(uid) {
  const snap = await getDocs(collection(db, "users", uid, "followers"));
  return snap.docs.map((d) => d.id);
}

/** List uids that `uid` follows. */
export async function getFollowing(uid) {
  const snap = await getDocs(collection(db, "users", uid, "following"));
  return snap.docs.map((d) => d.id);
}
