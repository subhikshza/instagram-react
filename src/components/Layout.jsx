import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// Shared layout: the sidebar stays put while the routed page renders in <Outlet/>.
export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
}
