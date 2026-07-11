import React, { useState } from 'react';
import ProfileHeader from '../components/ProfileHeader';
import PostGrid from '../components/PostGrid';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('POSTS');

  const userPosts = [
    { id: 10, image: 'https://picsum.photos/500/500?random=10', likes: 45, comments: 3 },
    { id: 11, image: 'https://picsum.photos/500/500?random=11', likes: 88, comments: 12 },
    { id: 12, image: 'https://picsum.photos/500/500?random=12', likes: 73, comments: 8 },
  ];

  return (
    <div className="main-layout">
      <ProfileHeader />

      <div className="profile-tabs">
        <button 
          onClick={() => setActiveTab('POSTS')} 
          className={`tab-btn ${activeTab === 'POSTS' ? 'active' : ''}`}
        >
          POSTS
        </button>
        <button 
          onClick={() => setActiveTab('SAVED')} 
          className={`tab-btn ${activeTab === 'SAVED' ? 'active' : ''}`}
        >
          SAVED
        </button>
      </div>

      {activeTab === 'POSTS' ? (
        <PostGrid posts={userPosts} />
      ) : (
        <div className="no-content">No saved posts yet.</div>
      )}
    </div>
  );
};

export default Profile;