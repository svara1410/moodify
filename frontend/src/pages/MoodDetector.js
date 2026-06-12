import React, { useState } from "react";
import "./MoodDetector.css";

const CATEGORIES = [
  "Chill","Workout","Focus","Party","Romance","Trending",
  "Rock","Pop","Jazz","Hip-Hop","Classical","EDM","Indie","Soul","Kids","Sleep"
];

const CATEGORY_URLS = {
  Chill: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6",
  Workout: "https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh",
  Focus: "https://open.spotify.com/playlist/37i9dQZF1DXcF6B6QPhFDv",
  Party: "https://open.spotify.com/playlist/37i9dQZF1DXaXB8fQg7xif",
  Romance: "https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn",
  Trending: "https://open.spotify.com/playlist/37i9dQZEVXbLRQDuF5jeBp",
  Rock: "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U",
  Pop: "https://open.spotify.com/playlist/37i9dQZF1DXarRysLJmuju",
  Jazz: "https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt",
  "Hip-Hop": "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
  Classical: "https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0",
  EDM: "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n",
  Indie: "https://open.spotify.com/playlist/37i9dQZF1DX2Nc3B70tvx0",
  Soul: "https://open.spotify.com/playlist/37i9dQZF1DXaXDsfv6nvZ5",
  Kids: "https://open.spotify.com/playlist/37i9dQZF1DWYqgap5oZh2d",
  Sleep: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
};

const CATEGORY_COLORS = {
  Chill:"#1db954",Workout:"#e74c3c",Focus:"#2980b9",Party:"#f39c12",
  Romance:"#9b59b6",Trending:"#16a085",Rock:"#c0392b",Pop:"#ff6f61",
  Jazz:"#34495e","Hip-Hop":"#2c3e50",Classical:"#8e44ad",EDM:"#27ae60",
  Indie:"#d35400",Soul:"#6c3483",Kids:"#f4d03f",Sleep:"#2e86c1"
};

const PROMPTS = [
  "I just got promoted and feel like celebrating 🎉",
  "It's raining outside and I want to relax 🌧️",
  "I have a big exam tomorrow and need to study",
  "Feeling heartbroken after a breakup 💔",
  "It's Friday night and I'm heading out with friends",
];

function MoodDetector() {
  const [mood, setMood] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detectMood = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const BASE = process.env.REACT_APP_API_URL || "";
      const response = await fetch(`${BASE}/api/mood/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e) {
      setError("Couldn't detect mood. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    detectMood(mood);
  };

  return (
    <div className="mood-detector-page">
      <div className="md-hero">
        <div className="md-sparkles">✨</div>
        <h1>AI Mood Detector</h1>
        <p>Tell us how you're feeling — we'll find your perfect playlist</p>
      </div>

      <div className="md-card">
        <form onSubmit={handleSubmit} className="md-form">
          <textarea
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g. I just finished a long week and want to unwind..."
            rows={3}
            className="md-input"
          />
          <button type="submit" disabled={loading || !mood.trim()} className="md-btn">
            {loading ? (
              <span className="md-loading"><span className="dot" /><span className="dot" /><span className="dot" /></span>
            ) : (
              "🎵 Detect My Mood"
            )}
          </button>
        </form>

        <div className="md-prompts">
          <p className="md-prompts-label">Try an example:</p>
          <div className="md-prompt-chips">
            {PROMPTS.map((p, i) => (
              <button key={i} className="md-chip" onClick={() => { setMood(p); detectMood(p); }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="md-error">{error}</div>}

      {result && (
        <div
          className="md-result"
          style={{ "--cat-color": CATEGORY_COLORS[result.category] || "#1db954" }}
        >
          <div className="md-result-top">
            <span className="md-emoji">{result.emoji}</span>
            <div>
              <h2 className="md-category">{result.category}</h2>
              <p className="md-vibe">{result.vibe}</p>
            </div>
          </div>
          <p className="md-reason">"{result.reason}"</p>
          <a
            href={CATEGORY_URLS[result.category]}
            target="_blank"
            rel="noopener noreferrer"
            className="md-open-btn"
          >
            Open Playlist in Spotify ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default MoodDetector;
