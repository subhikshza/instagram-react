import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

/* ================= USERS ================= */

export const createUser = async (userData) => {
  return await addDoc(collection(db, "users"), {
    ...userData,
    createdAt: serverTimestamp(),
  });
};

export const getUser = async (userId) => {
  const userRef = doc(db, "users", userId);
  return await getDoc(userRef);
};

/* ================= POSTS ================= */

export const createPost = async (postData) => {
  return await addDoc(collection(db, "posts"), {
    ...postData,
    createdAt: serverTimestamp(),
  });
};

export const getPosts = async () => {
  return await getDocs(collection(db, "posts"));
};

export const deletePost = async (postId) => {
  return await deleteDoc(doc(db, "posts", postId));
};

/* ================= COMMENTS ================= */

export const addComment = async (commentData) => {
  return await addDoc(collection(db, "comments"), {
    ...commentData,
    createdAt: serverTimestamp(),
  });
};

export const getComments = async (postId) => {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId)
  );

  return await getDocs(q);
};

/* ================= FOLLOWERS ================= */

export const followUser = async (followData) => {
  return await addDoc(collection(db, "followers"), {
    ...followData,
    createdAt: serverTimestamp(),
  });
};

export const unfollowUser = async (followId) => {
  return await deleteDoc(doc(db, "followers", followId));
};

/* ================= LIKES ================= */

export const likePost = async (likeData) => {
  return await addDoc(collection(db, "likes"), {
    ...likeData,
    createdAt: serverTimestamp(),
  });
};

export const unlikePost = async (likeId) => {
  return await deleteDoc(doc(db, "likes", likeId));
};