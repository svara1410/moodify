import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Moodify</div>
      <ul className="navbar-links">
        <li><NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink></li>
        <li><NavLink to="/playlist" className={({ isActive }) => (isActive ? "active" : "")}>Playlist</NavLink></li>
        <li><NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>Analytics</NavLink></li>
        <li><NavLink to="/share" className={({ isActive }) => (isActive ? "active" : "")}>Share</NavLink></li>
        <li><NavLink to="/signin" className={({ isActive }) => (isActive ? "active" : "")}>Sign In</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
