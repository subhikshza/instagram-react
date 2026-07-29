import { useAuth } from "../context/AuthContext";

const ProfileHeader = () => {
  const { user, profile } = useAuth();

  const username = profile?.username || user?.email?.split("@")[0] || "user";
  const name = profile?.name || user?.displayName || "";
  const avatar = profile?.avatar || `https://i.pravatar.cc/150?u=${user?.uid}`;
  const posts = profile?.postsCount ?? 0;
  const followers = profile?.followersCount ?? 0;
  const following = profile?.followingCount ?? 0;
  const bio = profile?.bio || "";

  return (
    <div className="profile-header">
      <div className="avatar-wrapper">
        <div className="avatar-inner">
          <img src={avatar} alt={username} className="avatar-img" />
        </div>
      </div>

      <div className="profile-info">
        <div className="username-row">
          <h2 className="username">{username}</h2>
          <button className="edit-btn">Edit profile</button>
        </div>

        <div className="stats-row">
          <div><strong>{posts}</strong> posts</div>
          <div><strong>{followers}</strong> followers</div>
          <div><strong>{following}</strong> following</div>
        </div>

        <div>
          <h1 className="bio-name">{name}</h1>
          {bio && <p className="bio-text">{bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
