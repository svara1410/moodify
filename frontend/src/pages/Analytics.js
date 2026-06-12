import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { api } from "../api";
import "./Analytics.css";

const COLORS = ["#1db954", "#e74c3c", "#3498db", "#9b59b6", "#f39c12"];

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/analytics")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="analytics-container"><p className="loading-msg">Loading analytics…</p></div>;
  if (error) return <div className="analytics-container"><p className="error-msg">Failed to load: {error}</p></div>;

  return (
    <div className="analytics-container">
      <h1>My Music Analytics</h1>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Top Genres</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.topGenres} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {data.topGenres.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Weekly Listening (hrs)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip contentStyle={{ background: "#1e1e1e", border: "none" }} />
              <Legend />
              <Bar dataKey="hours" fill="#1db954" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="top-artists-section">
        <h2>Your Top Artists</h2>
        <div className="artist-list">
          {data.topArtists.map((artist, i) => (
            <div key={i} className="artist-card">
              <span className="artist-rank">#{artist.rank}</span>
              <div className="artist-info">
                <h3>{artist.name}</h3>
                <p>{artist.streams} listened</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="top-songs-section">
        <h2>Your Top Songs</h2>
        <div className="song-list">
          {data.topSongs.map((song, i) => (
            <div key={i} className="song-card">
              <span className="song-rank">#{song.rank}</span>
              <div className="song-info">
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
              </div>
              <span className="song-time">{song.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
