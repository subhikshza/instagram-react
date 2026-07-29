// src/services/storage.js
// Image upload helper. NOTE: file uploads to Firebase Storage are primarily
// Member 3's responsibility (Backend Logic). This is included so createPost has
// a matching upload helper and the two pieces slot together cleanly.
//
// Usage from an <input type="file"> handler:
//   const url = await uploadPostImage(file, currentUser.uid);
//   await createPost({ uid, username, avatar }, { image: url, caption });

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase/firebase";

/**
 * Upload an image File/Blob for a post and return its public download URL.
 * @param {File|Blob} file
 * @param {string} uid   used to namespace the storage path
 */
export async function uploadPostImage(file, uid) {
  if (!file) throw new Error("uploadPostImage: file is required");
  const safeName = (file.name || "upload").replace(/[^\w.\-]/g, "_");
  const path = `posts/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
}

/** Upload a user avatar and return its download URL. */
export async function uploadAvatar(file, uid) {
  if (!file) throw new Error("uploadAvatar: file is required");
  const storageRef = ref(storage, `avatars/${uid}`);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
}

/** Delete an uploaded object by its full storage path (e.g. when deleting a post). */
export async function deleteImageByPath(path) {
  await deleteObject(ref(storage, path));
}
