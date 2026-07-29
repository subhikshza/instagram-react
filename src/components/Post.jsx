import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  toggleLike as toggleLikeDb,
  toggleSave as toggleSaveDb,
  addComment as addCommentDb,
  deletePost as deletePostDb,
} from "../services";

export default function Post({ post, onDeleted }) {
  const { user, profile } = useAuth();
  const myUsername = profile?.username || user?.email?.split("@")[0] || "you";

  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner = user && post.uid && user.uid === post.uid;

  async function handleLike() {
    if (!user) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1)); // optimistic
    try {
      await toggleLikeDb(post.id, user.uid);
    } catch {
      setLiked(!next); // revert on failure
      setLikeCount((c) => (next ? c - 1 : c + 1));
    }
  }

  async function handleSave() {
    if (!user) return;
    const next = !saved;
    setSaved(next);
    try {
      await toggleSaveDb(post.id, user.uid);
    } catch {
      setSaved(!next);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || !user) return;
    setCommentText("");
    const optimistic = { id: `temp-${Date.now()}`, username: myUsername, text };
    setComments((prev) => [...prev, optimistic]);
    try {
      const id = await addCommentDb(post.id, { uid: user.uid, username: myUsername }, text);
      // swap temp id for the real one
      setComments((prev) => prev.map((c) => (c.id === optimistic.id ? { ...c, id } : c)));
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
    }
  }

  async function handleDelete() {
    if (!isOwner) return;
    setMenuOpen(false);
    try {
      await deletePostDb(post.id, user.uid);
      onDeleted?.(post.id);
    } catch {
      /* ignore */
    }
  }

  return (
    <article className="post">
      <header className="post__header">
        <img className="post__avatar" src={post.avatar} alt={post.username} />

        <div className="post__meta">
          <span className="post__username">{post.username}</span>
          {post.location && <span className="post__location">{post.location}</span>}
        </div>

        <div className="post__more-wrap">
          <button className="post__more" onClick={() => setMenuOpen((o) => !o)}>
            <MoreHorizontal size={20} />
          </button>
          {menuOpen && isOwner && (
            <div className="post__menu">
              <button className="post__menu-item" onClick={handleDelete}>
                <Trash2 size={16} /> Delete post
              </button>
            </div>
          )}
        </div>
      </header>

      <img className="post__image" src={post.image} alt={post.caption} />

      <div className="post__actions">
        <button onClick={handleLike}>
          <Heart
            size={24}
            fill={liked ? "#ed4956" : "none"}
            color={liked ? "#ed4956" : "currentColor"}
          />
        </button>

        <button>
          <MessageCircle size={24} />
        </button>

        <button>
          <Send size={24} />
        </button>

        <button className="post__save" onClick={handleSave}>
          <Bookmark size={24} fill={saved ? "#262626" : "none"} />
        </button>
      </div>

      <p className="post__likes">{likeCount.toLocaleString()} likes</p>

      <p className="post__caption">
        <span className="post__username">{post.username}</span> {post.caption}
      </p>

      {comments.length > 0 && (
        <div className="post__comments-preview">
          {comments.slice(-2).map((comment) => (
            <p key={comment.id} className="post__comment-row">
              <span className="post__username">{comment.username}</span> {comment.text}
            </p>
          ))}
        </div>
      )}

      <form className="post__add-comment" onSubmit={submitComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </article>
  );
}
