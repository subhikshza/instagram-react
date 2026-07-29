import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSuggestions, followUser } from "../services";
import { suggestions as mockSuggestions } from "../data/mockData";

export default function Suggestions() {
  const { user, profile } = useAuth();

  const username = profile?.username || user?.email?.split("@")[0] || "you";
  const name = profile?.name || user?.displayName || "";
  const avatar = profile?.avatar || `https://i.pravatar.cc/150?u=${user?.uid || "guest"}`;

  const [people, setPeople] = useState([]);
  const [usingMock, setUsingMock] = useState(false);
  const [followed, setFollowed] = useState({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const real = await getSuggestions(user?.uid, 5);
        if (!active) return;
        if (real && real.length) {
          setPeople(real);
        } else {
          setPeople(mockSuggestions); // keep the sidebar populated for the demo
          setUsingMock(true);
        }
      } catch {
        if (active) {
          setPeople(mockSuggestions);
          setUsingMock(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleFollow(target) {
    setFollowed((f) => ({ ...f, [target.id]: true })); // optimistic
    if (!usingMock && user) {
      try {
        await followUser(user.uid, target.id);
      } catch {
        setFollowed((f) => ({ ...f, [target.id]: false }));
      }
    }
  }

  return (
    <aside className="suggestions">
      <div className="suggestions__profile">
        <img src={avatar} alt={username} />
        <div>
          <div className="suggestion-row__username">{username}</div>
          <div className="suggestion-row__subtitle">{name}</div>
        </div>
      </div>

      <div className="suggestions__header">
        <h3>Suggested for you</h3>
        <button>See All</button>
      </div>

      {people.map((u) => (
        <div key={u.id} className="suggestion-row">
          <img src={u.avatar} alt={u.username} />
          <div className="suggestion-row__meta">
            <div className="suggestion-row__username">{u.username}</div>
            <div className="suggestion-row__subtitle">
              {u.subtitle || "Suggested for you"}
            </div>
          </div>
          <button
            className="suggestion-row__follow"
            onClick={() => handleFollow(u)}
            disabled={followed[u.id]}
          >
            {followed[u.id] ? "Following" : "Follow"}
          </button>
        </div>
      ))}
    </aside>
  );
}
