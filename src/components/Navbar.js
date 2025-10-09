import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session or token (example)
    localStorage.removeItem("authToken");
    // Redirect to sign-in page
    navigate("/signin");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Moodify</div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/playlist" className={({ isActive }) => (isActive ? "active" : "")}>
            Playlist
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
            Analytics
          </NavLink>
        </li>
        <li>
          <NavLink to="/share" className={({ isActive }) => (isActive ? "active" : "")}>
            Share
          </NavLink>
        </li>
        <li>
          <NavLink to="/signin" className={({ isActive }) => (isActive ? "active" : "")}>
            Sign In
          </NavLink>
        </li>
        <li>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
