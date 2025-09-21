import React, { useState } from "react";
import "./Home.css";

const categories = [
  {
    title: "Chill",
    desc: "Relax and unwind with smooth beats",
    color: "#1db954",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6",
  },
  {
    title: "Workout",
    desc: "High-energy tracks to keep you moving",
    color: "#e74c3c",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh",
  },
  {
    title: "Focus",
    desc: "Stay productive with instrumental vibes",
    color: "#2980b9",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXcF6B6QPhFDv",
  },
  {
    title: "Party",
    desc: "Upbeat hits to keep the night alive",
    color: "#f39c12",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXaXB8fQg7xif",
  },
  {
    title: "Romance",
    desc: "Love songs to set the mood",
    color: "#9b59b6",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn",
  },
  {
    title: "Trending",
    desc: "Latest popular tracks around the world",
    color: "#16a085",
    url: "https://open.spotify.com/playlist/37i9dQZEVXbLRQDuF5jeBp",
  },
  {
    title: "Rock",
    desc: "Powerful guitar riffs and anthems",
    color: "#c0392b",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U",
  },
  {
    title: "Pop",
    desc: "Catchy and fun pop hits",
    color: "#ff6f61",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXarRysLJmuju",
  },
  {
    title: "Jazz",
    desc: "Smooth and soulful jazz tunes",
    color: "#34495e",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt",
  },
  {
    title: "Hip-Hop",
    desc: "Rap and hip-hop bangers",
    color: "#2c3e50",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
  },
  {
    title: "Classical",
    desc: "Timeless symphonies and piano pieces",
    color: "#8e44ad",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0",
  },
  {
    title: "EDM",
    desc: "Electronic beats to get you hyped",
    color: "#27ae60",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n",
  },
  {
    title: "Indie",
    desc: "Alternative and indie vibes",
    color: "#d35400",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX2Nc3B70tvx0",
  },
  {
    title: "Soul",
    desc: "Heartfelt and soulful tracks",
    color: "#6c3483",
    url: "https://open.spotify.com/playlist/37i9dQZF1DXaXDsfv6nvZ5",
  },
  {
    title: "Kids",
    desc: "Fun songs for the little ones",
    color: "#f4d03f",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWYqgap5oZh2d",
  },
  {
    title: "Sleep",
    desc: "Calm and relaxing sounds for sleep",
    color: "#2e86c1",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
  },
];

function Home() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-container">
      <h1>Discover by Category</h1>

      {/* Search Bar */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="category-grid">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat, i) => (
            <a
              key={i}
              href={cat.url}
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
              style={{
                background: `linear-gradient(135deg, ${cat.color}, #191414)`,
              }}
            >
              <h2>{cat.title}</h2>
              <p>{cat.desc}</p>
            </a>
          ))
        ) : (
          <p className="no-results">No categories found.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
