import { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import PostGrid from "../components/PostGrid";
import { getPostsByUser } from "../services";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("POSTS");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      try {
        const data = await getPostsByUser(user.uid);
        if (active)
          setPosts(
            data.map((p) => ({
              id: p.id,
              image: p.image,
              likes: p.likesCount || 0,
              comments: p.commentsCount || 0,
            }))
          );
      } catch {
        if (active) setPosts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="main-layout">
      <ProfileHeader />

      <div className="profile-tabs">
        <button
          onClick={() => setActiveTab("POSTS")}
          className={`tab-btn ${activeTab === "POSTS" ? "active" : ""}`}
        >
          POSTS
        </button>
        <button
          onClick={() => setActiveTab("SAVED")}
          className={`tab-btn ${activeTab === "SAVED" ? "active" : ""}`}
        >
          SAVED
        </button>
      </div>

      {activeTab === "POSTS" ? (
        loading ? (
          <div className="no-content">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="no-content">No posts yet. Create your first post!</div>
        ) : (
          <PostGrid posts={posts} />
        )
      ) : (
        <div className="no-content">No saved posts yet.</div>
      )}
    </div>
  );
};

export default Profile;
