import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

export default function Post({ post }) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState("");

  function toggleLike() {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  }

  function submitComment(e) {
    e.preventDefault();

    if (!commentText.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        username: "subhiksha.codes",
        text: commentText.trim(),
      },
    ]);

    setCommentText("");
  }

  return (
    <article className="post">
      <header className="post__header">
        <img
          className="post__avatar"
          src={post.avatar}
          alt={post.username}
        />

        <div className="post__meta">
          <span className="post__username">{post.username}</span>

          {post.location && (
            <span className="post__location">
              {post.location}
            </span>
          )}
        </div>

        <button className="post__more">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <img
        className="post__image"
        src={post.image}
        alt={post.caption}
      />

      <div className="post__actions">
        <button onClick={toggleLike}>
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

        <button
          className="post__save"
          onClick={() => setSaved(!saved)}
        >
          <Bookmark
            size={24}
            fill={saved ? "#262626" : "none"}
          />
        </button>
      </div>

      <p className="post__likes">
        {likeCount.toLocaleString()} likes
      </p>

      <p className="post__caption">
        <span className="post__username">
          {post.username}
        </span>{" "}
        {post.caption}
      </p>

      {comments.length > 0 && (
        <div className="post__comments-preview">
          {comments.slice(-2).map((comment) => (
            <p
              key={comment.id}
              className="post__comment-row"
            >
              <span className="post__username">
                {comment.username}
              </span>{" "}
              {comment.text}
            </p>
          ))}
        </div>
      )}

      <form
        className="post__add-comment"
        onSubmit={submitComment}
      >
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) =>
            setCommentText(e.target.value)
          }
        />

        <button type="submit">Post</button>
      </form>
    </article>
  );
}