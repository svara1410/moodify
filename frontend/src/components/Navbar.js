import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };
  const close = () => setMenuOpen(false);
  const link = (to) => ({ isActive }) => isActive ? "active" : "";

  return (
    <nav className="navbar">
      <div className="navbar-logo">🎵 Moodify</div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li><NavLink to="/" onClick={close} className={link("/")}>Home</NavLink></li>
        <li><NavLink to="/mood" onClick={close} className={link("/mood")}>
          <span className="ai-badge">✨ AI Mood</span>
        </NavLink></li>
        <li><NavLink to="/playlist" onClick={close} className={link("/playlist")}>Playlist</NavLink></li>
        <li><NavLink to="/analytics" onClick={close} className={link("/analytics")}>Analytics</NavLink></li>
        <li><NavLink to="/share" onClick={close} className={link("/share")}>Share</NavLink></li>

        {user ? (
          <>
            <li>
              <NavLink to="/profile" onClick={close} className={({ isActive }) => `profile-link ${isActive ? "active" : ""}`}>
                <span className="avatar-circle">{user.name.charAt(0).toUpperCase()}</span>
                {user.name.split(" ")[0]}
              </NavLink>
            </li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li><NavLink to="/signin" onClick={close} className={({ isActive }) => `signin-link ${isActive ? "active" : ""}`}>Sign In</NavLink></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
