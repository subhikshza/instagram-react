import { useEffect, useState, useCallback } from "react";
import Stories from "./Stories";
import Post from "./Post";
import { getFeedPosts } from "../services";
import { seedSamplePosts } from "../services/seed";
import { useAuth } from "../context/AuthContext";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getFeedPosts(user?.uid);
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const removePost = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  async function handleSeed() {
    if (!user) return;
    setSeeding(true);
    try {
      await seedSamplePosts(user.uid);
      setLoading(true);
      await load();
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <Stories />

      {loading ? (
        <div className="feed-state">Loading feed…</div>
      ) : posts.length === 0 ? (
        <div className="feed-state">
          <p>No posts yet.</p>
          <p style={{ margin: "8px 0 16px", fontSize: 13 }}>
            Tap <strong>Create</strong> to make one, or load a few samples to fill the feed.
          </p>
          <button className="auth-btn" onClick={handleSeed} disabled={seeding}>
            {seeding ? "Adding samples…" : "Load sample posts"}
          </button>
        </div>
      ) : (
        posts.map((post) => <Post key={post.id} post={post} onDeleted={removePost} />)
      )}
    </div>
  );
}
