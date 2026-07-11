import { stories } from "../data/mockData";

export default function Stories() {
  return (
    <div className="stories-bar">
      {stories.map((story) => (
        <button key={story.id} className="story">
          <div className={`story__ring${story.seen ? " seen" : ""}`}>
            <img src={story.avatar} alt={story.username} />
          </div>

          <span className="story__username">
            {story.username}
          </span>
        </button>
      ))}
    </div>
  );
}