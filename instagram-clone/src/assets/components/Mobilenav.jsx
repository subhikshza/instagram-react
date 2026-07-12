import { Link } from "react-router-dom";

function MobileNav() {
  return (
    <div className="mobile-nav">
      <Link to="/">🏠</Link>
      <Link to="/search">🔍</Link>
      <Link to="/reels">🎬</Link>
      <Link to="/messages">💬</Link>
      <Link to="/profile">👤</Link>
    </div>
  );
}

export default MobileNav;