import Stories from "./Stories";
import Post from "./Post";
import { posts } from "../data/mockData";

export default function Feed() {
  return (
    <div>
      <Stories />

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}