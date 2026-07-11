import React from 'react';

const PostGrid = ({ posts }) => {
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <div key={post.id} className="grid-item">
          <img src={post.image} alt="Post" className="grid-img" />
          <div className="hover-overlay">
            <div>❤️ {post.likes}</div>
            <div>💬 {post.comments}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostGrid;