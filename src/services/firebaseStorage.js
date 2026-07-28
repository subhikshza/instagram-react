import { 
  getFirestore, collection, addDoc, deleteDoc, doc, 
  updateDoc, arrayUnion, arrayRemove, serverTimestamp 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase"; // உங்க firebase.js ஃபைலை import செய்கிறது

const db = getFirestore(app);
const storage = getStorage(app);

// 1. Upload Image to Firebase Storage
export async function uploadPostImage(file) {
  if (!file) return null;
  try {
    const fileName = `posts/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.error("Storage Error:", err);
    return null;
  }
}

// 2. Create Post
export async function createPost(userId, caption, imageFile) {
  try {
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadPostImage(imageFile);
    }
    const docRef = await addDoc(collection(db, "posts"), {
      userId,
      caption,
      imageUrl,
      likes: [],
      comments: [],
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("Create Post Error:", err);
    return { success: false, error: err.message };
  }
}

// 3. Delete Post
export async function deletePost(postId) {
  try {
    await deleteDoc(doc(db, "posts", postId));
    return { success: true };
  } catch (err) {
    console.error("Delete Post Error:", err);
    return { success: false, error: err.message };
  }
}

// 4. Like / Unlike Post
export async function toggleLikePost(postId, userId, isLiked) {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
    return { success: true };
  } catch (err) {
    console.error("Like Error:", err);
    return { success: false };
  }
}

// 5. Add Comment
export async function addComment(postId, userId, commentText) {
  try {
    const postRef = doc(db, "posts", postId);
    const newComment = {
      id: Date.now().toString(),
      userId,
      text: commentText,
      createdAt: new Date().toISOString()
    };
    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    });
    return { success: true, comment: newComment };
  } catch (err) {
    console.error("Comment Error:", err);
    return { success: false };
  }
}

// 6. Follow / Unfollow User
export async function toggleFollowUser(currentUserId, targetUserId, isFollowing) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    if (isFollowing) {
      await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
      await updateDoc(targetUserRef, { followers: arrayRemove(currentUserId) });
    } else {
      await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
      await updateDoc(targetUserRef, { followers: arrayUnion(currentUserId) });
    }
    return { success: true };
  } catch (err) {
    console.error("Follow Error:", err);
    return { success: false };
  }
}
