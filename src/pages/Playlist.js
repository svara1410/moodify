import React from "react";
import "./Playlist.css";

const playlists = [
  {
    name: "Chill Beats",
    desc: "Lo-fi and relaxing tracks",
    color: "#8e44ad",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6",
  },
  {
    name: "Energy Boost",
    desc: "Pump up your mood",
    color: "#e67e22",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh",
  },
  {
    name: "Classic Hits",
    desc: "Timeless songs you love",
    color: "#3498db",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U",
  },
  {
    name: "Top Charts",
    desc: "Currently trending tracks",
    color: "#2ecc71",
    url: "https://open.spotify.com/playlist/37i9dQZEVXbLRQDuF5jeBp",
  },
];

function Playlist() {
  return (
    <div className="playlist-container">
      <h1>My Playlists</h1>
      <div className="playlist-grid">
        {playlists.map((list, idx) => (
          <div
            key={idx}
            className="playlist-card"
            style={{ background: `linear-gradient(135deg, ${list.color}, #191414)` }}
          >
            <h2>{list.name}</h2>
            <p>{list.desc}</p>
            <a
              href={list.url}
              target="_blank"
              rel="noopener noreferrer"
              className="play-btn"
            >
              Play
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Playlist;
