import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import "./NowPlaying.css";

const JAMENDO_CLIENT_ID = "20b67e7c";

const MOOD_TAGS = {
  Chill: "chill",
  Workout: "energetic",
  Focus: "instrumental",
  Party: "party",
  Romance: "romantic",
  Rock: "rock",
  Pop: "pop",
  Jazz: "jazz",
  "Hip-Hop": "hiphop",
  Classical: "classical",
  EDM: "electronic",
  Indie: "indie",
  Soul: "soul",
  Trending: "pop",
  Kids: "kids",
  Sleep: "ambient",
};

function fmt(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function NowPlaying() {
  const { user } = useAuth();
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState("Chill");

  // Fetch tracks from Jamendo
  const fetchTracks = async (tag = "chill") => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&tags=${tag}&audioformat=mp32&order=popularity_total`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setTracks(data.results);
        setCurrent(0);
        setProgress(0);
      }
    } catch (e) {
      console.error("Jamendo fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks(MOOD_TAGS[mood]);
  }, [mood]);

  // Sync audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !tracks[current]?.audio) return;
    audio.src = tracks[current].audio;
    audio.volume = volume;
    if (playing) audio.play().catch(() => setPlaying(false));
    setProgress(0);
    setLiked(false);
  }, [current, tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
    setDuration(audio.duration || 0);
  };

  const handleEnded = () => {
    setCurrent((c) => (c + 1) % tracks.length);
    setPlaying(true);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
    setProgress(pct * duration);
  };

  const prev = () => { setCurrent((c) => (c - 1 + tracks.length) % tracks.length); setPlaying(true); };
  const next = () => { setCurrent((c) => (c + 1) % tracks.length); setPlaying(true); };

  const song = tracks[current];
  const progressPct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="now-playing-bar">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onCanPlay={() => { if (playing) audioRef.current?.play().catch(() => {}); }}
      />

      {/* Left */}
      <div className="np-left">
        <div className="np-thumb" style={{ backgroundImage: song?.image ? `url(${song.image})` : "none" }}>
          {!song?.image && "🎵"}
        </div>
        <div className="np-info">
          <span className="np-title">{loading ? "Loading..." : song?.name || "—"}</span>
          <span className="np-artist">{song?.artist_name || "Jamendo"}</span>
        </div>
        <button className={`np-heart ${liked ? "liked" : ""}`} onClick={() => setLiked(!liked)}>
          {liked ? "♥" : "♡"}
        </button>
      </div>

      {/* Center */}
      <div className="np-center">
        <div className="np-controls">
          <button className="np-btn" onClick={prev}>⏮</button>
          <button className="np-play-btn" onClick={() => setPlaying(!playing)}>
            {playing ? "⏸" : "▶"}
          </button>
          <button className="np-btn" onClick={next}>⏭</button>
        </div>
        <div className="np-progress-row">
          <span className="np-time">{fmt(progress)}</span>
          <div className="np-progress-bar" onClick={handleSeek}>
            <div className="np-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="np-time end">{fmt(duration)}</span>
        </div>
      </div>

      {/* Right */}
      <div className="np-right">
        {/* Mood selector */}
        <select
          className="np-mood-select"
          value={mood}
          onChange={(e) => { setMood(e.target.value); setPlaying(false); }}
        >
          {Object.keys(MOOD_TAGS).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="np-vol-wrap">
          <span className="np-vol-icon">{volume === 0 ? "🔇" : volume < 0.4 ? "🔈" : "🔊"}</span>
          <input
            type="range" min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="np-volume"
          />
        </div>
        {user && <span className="np-user">🎧 {user.name.split(" ")[0]}</span>}
      </div>
    </div>
  );
}

export default NowPlaying;
