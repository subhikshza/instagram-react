import React from 'react';

const ProfileHeader = () => {
  return (
    <div className="profile-header">
      <div className="avatar-wrapper">
        <div className="avatar-inner">
          <img src="https://picsum.photos/150/150?random=99" alt="Avatar" className="avatar-img" />
        </div>
      </div>

      <div className="profile-info">
        <div className="username-row">
          <h2 className="username">madhavan_dev</h2>
          <button className="edit-btn">Edit profile</button>
        </div>

        <div className="stats-row">
          <div><strong>12</strong> posts</div>
          <div><strong>450</strong> followers</div>
          <div><strong>320</strong> following</div>
        </div>

        <div>
          <h1 className="bio-name">Madhavan</h1>
          <p className="bio-text">Web Developer | Building clean interfaces ✨</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;