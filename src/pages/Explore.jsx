import React from 'react';
import PostGrid from '../components/PostGrid';

const Explore = () => {
  const explorePosts = [
    { id: 1, image: 'https://picsum.photos/500/500?random=1', likes: 120, comments: 14 },
    { id: 2, image: 'https://picsum.photos/500/500?random=2', likes: 85, comments: 9 },
    { id: 3, image: 'https://picsum.photos/500/500?random=3', likes: 240, comments: 31 },
    { id: 4, image: 'https://picsum.photos/500/500?random=4', likes: 93, comments: 5 },
    { id: 5, image: 'https://picsum.photos/500/500?random=5', likes: 156, comments: 22 },
    { id: 6, image: 'https://picsum.photos/500/500?random=6', likes: 312, comments: 45 },
  ];

  return (
    <div className="main-layout">
      <PostGrid posts={explorePosts} />
    </div>
  );
};

export default Explore;