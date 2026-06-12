import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useToast } from "../components/Toast";
import { api } from "../api";
import "./Home.css";

function Home() {
  const { user } = useAuth();
  const showToast = useToast();
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then(setCategories).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) api.get("/user/favorites").then(setFavorites).catch(() => {});
    else setFavorites([]);
  }, [user]);

  const toggleFavorite = async (e, title) => {
    e.preventDefault();
    if (!user) { showToast("Sign in to save favourites!", "info"); return; }
    try {
      const data = await api.post("/user/favorites/toggle", { title });
      const added = data.favorites.includes(title);
      setFavorites(data.favorites);
      showToast(added ? `Added ${title} to favourites ♥` : `Removed ${title} from favourites`, added ? "success" : "info");
    } catch { showToast("Something went wrong", "error"); }
  };

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Discover by Mood</h1>
        <p className="home-sub">Find the perfect playlist for every moment</p>
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="🔍 Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <div className="category-grid">
          {filtered.length > 0 ? filtered.map((cat, i) => (
            <a
              key={i}
              href={cat.url}
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
              style={{ background: `linear-gradient(135deg, ${cat.color}cc, #191414)` }}
            >
              <div className="card-top">
                <h2>{cat.title}</h2>
                <button
                  className={`fav-btn ${favorites.includes(cat.title) ? "fav-active" : ""}`}
                  onClick={(e) => toggleFavorite(e, cat.title)}
                  title={favorites.includes(cat.title) ? "Remove from favourites" : "Add to favourites"}
                >
                  {favorites.includes(cat.title) ? "♥" : "♡"}
                </button>
              </div>
              <p>{cat.desc}</p>
              <span className="open-label">Open in Spotify ↗</span>
            </a>
          )) : (
            <p className="no-results">No categories found for "{search}"</p>
          )}
        </div>
      )}

      {!user && (
        <p className="login-hint">
          <a href="/signin">Sign in</a> to save your favourite categories ♥
        </p>
      )}
    </div>
  );
}

export default Home;
