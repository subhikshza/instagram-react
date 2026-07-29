import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, PlusSquare, User, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

// Instagram-style left sidebar navigation.
// Uses NavLink so the current page is highlighted automatically.
export default function Sidebar() {
  const navigate = useNavigate();
  const linkClass = ({ isActive }) => "nav-item" + (isActive ? " active" : "");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="nav-sidebar">
      <div className="nav-logo">Instagram</div>

      <div className="nav-links">
        {/* `end` makes Home active only on "/", not on every route */}
        <NavLink to="/" end className={linkClass}>
          <Home />
          <span>Home</span>
        </NavLink>

        <NavLink to="/explore" className={linkClass}>
          <Compass />
          <span>Explore</span>
        </NavLink>

        <NavLink to="/create" className={linkClass}>
          <PlusSquare />
          <span>Create</span>
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <User />
          <span>Profile</span>
        </NavLink>
      </div>

      <button type="button" className="nav-item nav-logout" onClick={handleLogout}>
        <LogOut />
        <span>Log out</span>
      </button>
    </nav>
  );
}
