import { currentUser, suggestions } from "../data/mockData";

export default function Suggestions() {
  return (
    <aside className="suggestions">
      <div className="suggestions__profile">
        <img
          src={currentUser.avatar}
          alt={currentUser.username}
        />

        <div>
          <div className="suggestion-row__username">
            {currentUser.username}
          </div>

          <div className="suggestion-row__subtitle">
            {currentUser.name}
          </div>
        </div>
      </div>

      <div className="suggestions__header">
        <h3>Suggested for you</h3>
        <button>See All</button>
      </div>

      {suggestions.map((user) => (
        <div key={user.id} className="suggestion-row">
          <img
            src={user.avatar}
            alt={user.username}
          />

          <div className="suggestion-row__meta">
            <div className="suggestion-row__username">
              {user.username}
            </div>

            <div className="suggestion-row__subtitle">
              {user.subtitle}
            </div>
          </div>

          <button className="suggestion-row__follow">
            Follow
          </button>
        </div>
      ))}
    </aside>
  );
}