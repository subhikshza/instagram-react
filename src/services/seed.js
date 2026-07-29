// src/services/seed.js
// One-click demo seeding: inserts the sample posts into Firestore so the feed
// looks populated. The posts keep their original display usernames/avatars but
// are owned by the current user's uid (so security rules allow the write).

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { posts as mockPosts } from "../data/mockData";

export async function seedSamplePosts(uid) {
  for (const p of mockPosts) {
    await addDoc(collection(db, "posts"), {
      uid, // owned by current user so rules allow it
      username: p.username, // keep the original display name
      avatar: p.avatar,
      image: p.image,
      caption: p.caption,
      location: p.location || "",
      likesCount: p.likes || 0,
      commentsCount: (p.comments && p.comments.length) || 0,
      createdAt: serverTimestamp(),
    });
  }
}
