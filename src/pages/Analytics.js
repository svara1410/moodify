import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import "./Analytics.css";

const genreData = [
  { name: "Pop", value: 35 },
  { name: "Hip-Hop", value: 25 },
  { name: "Rock", value: 15 },
  { name: "Jazz", value: 10 },
  { name: "EDM", value: 15 },
];

const listeningData = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 4 },
  { day: "Fri", hours: 3.5 },
  { day: "Sat", hours: 5 },
  { day: "Sun", hours: 2.5 },
];

const COLORS = ["#1db954", "#e74c3c", "#3498db", "#9b59b6", "#f39c12"];

const topArtists = [
  { rank: 1, name: "The Weeknd", streams: "120 hrs" },
  { rank: 2, name: "Taylor Swift", streams: "95 hrs" },
  { rank: 3, name: "Drake", streams: "80 hrs" },
  { rank: 4, name: "Arijit Singh", streams: "70 hrs" },
  { rank: 5, name: "Coldplay", streams: "65 hrs" },
];

const topSongs = [
  { rank: 1, title: "Blinding Lights", artist: "The Weeknd", time: "30 hrs" },
  { rank: 2, title: "Levitating", artist: "Dua Lipa", time: "25 hrs" },
  { rank: 3, title: "Shape of You", artist: "Ed Sheeran", time: "22 hrs" },
  { rank: 4, title: "Peaches", artist: "Justin Bieber", time: "20 hrs" },
  { rank: 5, title: "Kesariya", artist: "Arijit Singh", time: "18 hrs" },
];

function Analytics() {
  return (
    <div className="analytics-container">
      <h1>My Music Analytics</h1>

      <div className="charts-grid">
        {/* Pie Chart for Genres */}
        <div className="chart-card">
          <h2>Top Genres</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart for Listening Time */}
        <div className="chart-card">
          <h2>Listening Time (hrs)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={listeningData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#1db954" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Artists */}
      <div className="top-artists-section">
        <h2>Your Top Artists</h2>
        <div className="artist-list">
          {topArtists.map((artist, index) => (
            <div key={index} className="artist-card">
              <span className="artist-rank">#{artist.rank}</span>
              <div className="artist-info">
                <h3>{artist.name}</h3>
                <p>{artist.streams} listened</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Songs */}
      <div className="top-songs-section">
        <h2>Your Top Songs</h2>
        <div className="song-list">
          {topSongs.map((song, index) => (
            <div key={index} className="song-card">
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
