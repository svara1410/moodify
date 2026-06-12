import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import "./Playlist.css";

const JAMENDO_CLIENT_ID = "20b67e7c";

const MOOD_TAGS = {
  Chill:"chill", Workout:"energetic", Focus:"instrumental", Party:"party",
  Romance:"romantic", Rock:"rock", Pop:"pop", Jazz:"jazz",
  "Hip-Hop":"hiphop", Classical:"classical", EDM:"electronic",
  Indie:"indie", Soul:"soul", Trending:"pop", Kids:"kids", Sleep:"ambient"
};

function fmt(s) {
  if (!s) return "0:00";
  return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
}

function Playlist() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => { api.get("/categories").then(setCategories); }, []);

  const fetchJamendo = async (tag, query = "") => {
    setLoading(true);
    setTracks([]);
    try {
      const url = query
        ? `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(query)}&audioformat=mp32`
        : `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&tags=${tag}&audioformat=mp32&order=popularity_total`;
      const res = await fetch(url);
      const data = await res.json();
      setTracks(data.results || []);
    } catch { setTracks([]); }
    finally { setLoading(false); }
  };

  const loadCategory = (cat) => {
    setSelected(cat);
    setSearch("");
    fetchJamendo(MOOD_TAGS[cat.title] || "pop");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSelected(null);
    fetchJamendo(null, search);
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      setPlaying(!playing);
      return;
    }
    setCurrentTrack(track);
    setPlaying(true);
    setProgress(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audio) return;
    audio.src = currentTrack.audio;
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  const EMOJIS = { Chill:"😌",Workout:"💪",Focus:"🎯",Party:"🎉",Romance:"❤️",Rock:"🎸",Pop:"✨",Jazz:"🎷","Hip-Hop":"🔥",Classical:"🎻",EDM:"⚡",Indie:"🎸",Soul:"💙",Trending:"📈",Kids:"🧸",Sleep:"🌙" };

  return (
    <div className="playlist-container">
      <audio
        ref={audioRef}
        onTimeUpdate={() => { setProgress(audioRef.current?.currentTime||0); setDuration(audioRef.current?.duration||0); }}
        onEnded={() => setPlaying(false)}
      />

      <h1>Playlists</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="🔍 Search any song or artist on Jamendo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="playlist-search"
        />
        <button type="submit" className="search-btn">Search</button>
      </form>

      <div className="category-pills">
        {categories.map((c, i) => (
          <button key={i}
            className={`pill ${selected?.title === c.title ? "pill-active" : ""}`}
            style={{ "--pill-color": c.color }}
            onClick={() => loadCategory(c)}
          >
            {EMOJIS[c.title]} {c.title}
          </button>
        ))}
      </div>

      {/* Mini player for current track */}
      {currentTrack && (
        <div className="mini-player">
          <img src={currentTrack.image} alt="" className="mini-thumb" />
          <div className="mini-info">
            <span className="mini-title">{currentTrack.name}</span>
            <span className="mini-artist">{currentTrack.artist_name}</span>
          </div>
          <div className="mini-controls">
            <button className="np-play-btn small" onClick={() => setPlaying(!playing)}>
              {playing ? "⏸" : "▶"}
            </button>
            <div className="mini-progress">
              <div className="mini-fill" style={{ width: duration ? `${(progress/duration)*100}%` : "0%" }} />
            </div>
            <span className="mini-time">{fmt(progress)} / {fmt(duration)}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="tracks-list">
          {[...Array(8)].map((_, i) => <div key={i} className="track-skeleton" />)}
        </div>
      )}

      {!loading && tracks.length > 0 && (
        <div className="tracks-list">
          {tracks.map((t, i) => (
            <div
              key={t.id}
              className={`track-row ${currentTrack?.id === t.id ? "track-active" : ""}`}
              onClick={() => playTrack(t)}
            >
              <span className="track-num">
                {currentTrack?.id === t.id && playing ? "▶" : i + 1}
              </span>
              <img src={t.image} alt={t.name} className="track-img" onError={(e) => e.target.style.display="none"} />
              <div className="track-info">
                <span className="track-name">{t.name}</span>
                <span className="track-artist">{t.artist_name}</span>
              </div>
              <span className="track-duration">{fmt(t.duration)}</span>
              <span className="track-play">{currentTrack?.id === t.id && playing ? "⏸" : "▶"}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && tracks.length === 0 && !selected && (
        <div className="playlist-empty">
          <div className="empty-icon">🎵</div>
          <p>Pick a category or search for a song</p>
          <p className="empty-sub">Powered by Jamendo — real full songs, free forever</p>
        </div>
      )}

      {!loading && tracks.length === 0 && selected && (
        <div className="playlist-empty">
          <p>No tracks found for {selected.title}</p>
        </div>
      )}
    </div>
  );
}

export default Playlist;
