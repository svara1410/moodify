require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "moodify_secret_key_change_in_prod";
const MONGO_URI = process.env.MONGO_URI;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

// ── MongoDB ────────────────────────────────────────────────────────────────────
let useDB = false;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => { console.log("MongoDB connected ✅"); useDB = true; })
    .catch((e) => console.log("MongoDB failed, using in-memory:", e.message));
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  favoriteCategories: { type: [String], default: [] },
  nowPlaying: { title: { type: String, default: "Blinding Lights" }, artist: { type: String, default: "The Weeknd" }, mood: { type: String, default: "Chill" } },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);
const memUsers = new Map();

async function findUser(email) { return useDB ? await User.findOne({ email }) : memUsers.get(email) || null; }
async function createUser(data) {
  if (useDB) return await User.create(data);
  memUsers.set(data.email, { ...data, favoriteCategories: [], nowPlaying: { title: "Blinding Lights", artist: "The Weeknd", mood: "Chill" }, createdAt: new Date() });
  return memUsers.get(data.email);
}
async function saveUser(user) { return useDB ? await user.save() : (memUsers.set(user.email, user), user); }

// ── Auth Middleware ────────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });
  try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid or expired token" }); }
}

// ── Auth Routes ────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  if (await findUser(email)) return res.status(409).json({ error: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({ name, email, passwordHash });
  const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { name, email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const user = await findUser(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { name: user.name, email } });
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const user = await findUser(req.user.email);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ name: user.name, email: user.email, createdAt: user.createdAt, favoriteCategories: user.favoriteCategories, nowPlaying: user.nowPlaying });
});

// ── Spotify Token (cached) ─────────────────────────────────────────────────────
let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return null;
  try {
    const resp = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });
    const data = await resp.json();
    spotifyToken = data.access_token;
    spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return spotifyToken;
  } catch { return null; }
}

// ── Categories ─────────────────────────────────────────────────────────────────
const categories = [
  { title: "Chill", desc: "Relax and unwind with smooth beats", color: "#1db954", playlistId: "37i9dQZF1DX4WYpdgoIcn6" },
  { title: "Workout", desc: "High-energy tracks to keep you moving", color: "#e74c3c", playlistId: "37i9dQZF1DX70RN3TfWWJh" },
  { title: "Focus", desc: "Stay productive with instrumental vibes", color: "#2980b9", playlistId: "37i9dQZF1DXcF6B6QPhFDv" },
  { title: "Party", desc: "Upbeat hits to keep the night alive", color: "#f39c12", playlistId: "37i9dQZF1DXaXB8fQg7xif" },
  { title: "Romance", desc: "Love songs to set the mood", color: "#9b59b6", playlistId: "37i9dQZF1DX50QitC6Oqtn" },
  { title: "Trending", desc: "Latest popular tracks around the world", color: "#16a085", playlistId: "37i9dQZEVXbLRQDuF5jeBp" },
  { title: "Rock", desc: "Powerful guitar riffs and anthems", color: "#c0392b", playlistId: "37i9dQZF1DWXRqgorJj26U" },
  { title: "Pop", desc: "Catchy and fun pop hits", color: "#ff6f61", playlistId: "37i9dQZF1DXarRysLJmuju" },
  { title: "Jazz", desc: "Smooth and soulful jazz tunes", color: "#34495e", playlistId: "37i9dQZF1DXbITWG1ZJKYt" },
  { title: "Hip-Hop", desc: "Rap and hip-hop bangers", color: "#2c3e50", playlistId: "37i9dQZF1DX0XUsuxWHRQd" },
  { title: "Classical", desc: "Timeless symphonies and piano pieces", color: "#8e44ad", playlistId: "37i9dQZF1DWWEJlAGA9gs0" },
  { title: "EDM", desc: "Electronic beats to get you hyped", color: "#27ae60", playlistId: "37i9dQZF1DX4dyzvuaRJ0n" },
  { title: "Indie", desc: "Alternative and indie vibes", color: "#d35400", playlistId: "37i9dQZF1DX2Nc3B70tvx0" },
  { title: "Soul", desc: "Heartfelt and soulful tracks", color: "#6c3483", playlistId: "37i9dQZF1DXaXDsfv6nvZ5" },
  { title: "Kids", desc: "Fun songs for the little ones", color: "#f4d03f", playlistId: "37i9dQZF1DWYqgap5oZh2d" },
  { title: "Sleep", desc: "Calm and relaxing sounds for sleep", color: "#2e86c1", playlistId: "37i9dQZF1DWZd79rJ6a7lp" },
];

app.get("/api/categories", (req, res) => {
  const withUrls = categories.map(c => ({ ...c, url: `https://open.spotify.com/playlist/${c.playlistId}` }));
  res.json(withUrls);
});

// ── Spotify: Playlist Tracks ───────────────────────────────────────────────────
app.get("/api/spotify/playlist/:id", async (req, res) => {
  const token = await getSpotifyToken();
  if (!token) return res.status(503).json({ error: "Spotify not configured" });
  try {
    const r = await fetch(`https://api.spotify.com/v1/playlists/${req.params.id}/tracks?limit=10&fields=items(track(name,artists,album(images),duration_ms,external_urls))`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    const tracks = (data.items || []).map(({ track }) => ({
      name: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      image: track.album.images?.[0]?.url,
      duration: Math.floor(track.duration_ms / 1000),
      url: track.external_urls?.spotify,
    }));
    res.json(tracks);
  } catch { res.status(500).json({ error: "Failed to fetch tracks" }); }
});

// ── Spotify: Search ────────────────────────────────────────────────────────────
app.get("/api/spotify/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });
  const token = await getSpotifyToken();
  if (!token) return res.status(503).json({ error: "Spotify not configured" });
  try {
    const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=8`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    const tracks = (data.tracks?.items || []).map(t => ({
      name: t.name,
      artist: t.artists.map(a => a.name).join(", "),
      image: t.album.images?.[0]?.url,
      duration: Math.floor(t.duration_ms / 1000),
      url: t.external_urls?.spotify,
    }));
    res.json(tracks);
  } catch { res.status(500).json({ error: "Search failed" }); }
});

// ── Mood Detection (FREE - rule based, no API key needed) ──────────────────────
const moodRules = [
  { keywords: ["sad","cry","heartbreak","lonely","miss","upset","depressed","down","hurt","broken"], category: "Soul", emoji: "💙", vibe: "Healing & Comfort" },
  { keywords: ["happy","excited","great","amazing","celebrate","joy","wonderful","fantastic","awesome","best day"], category: "Party", emoji: "🎉", vibe: "Pure Joy" },
  { keywords: ["study","focus","work","concentrate","productive","deadline","exam","coding","reading"], category: "Focus", emoji: "🎯", vibe: "Deep Focus" },
  { keywords: ["workout","gym","run","exercise","train","fitness","energy","lift","cardio","sport"], category: "Workout", emoji: "💪", vibe: "High Energy" },
  { keywords: ["love","romantic","date","crush","relationship","sweet","tender","heart","valentine"], category: "Romance", emoji: "❤️", vibe: "Love & Warmth" },
  { keywords: ["sleep","tired","rest","relax","calm","peaceful","night","bed","sleepy","unwind"], category: "Sleep", emoji: "🌙", vibe: "Peaceful Rest" },
  { keywords: ["chill","lazy","afternoon","lounge","easy","mellow","slow","casual","hang"], category: "Chill", emoji: "😌", vibe: "Easy Vibes" },
  { keywords: ["party","dance","club","night out","friends","friday","weekend","fun","groove"], category: "Party", emoji: "🕺", vibe: "Let's Dance" },
  { keywords: ["angry","frustrated","mad","annoyed","rage","stress","vent","intense"], category: "Rock", emoji: "🔥", vibe: "Unleash It" },
  { keywords: ["coffee","morning","wake","breakfast","fresh","start","sunrise"], category: "Pop", emoji: "☀️", vibe: "Morning Boost" },
  { keywords: ["rainy","rain","cozy","blanket","inside","cloudy","grey","storm"], category: "Jazz", emoji: "🌧️", vibe: "Cozy Rainy Day" },
  { keywords: ["nostalgic","memories","childhood","old","classic","throwback","remember"], category: "Classical", emoji: "🎵", vibe: "Timeless Feels" },
  { keywords: ["hype","lit","fire","banger","bass","drop","bounce","vibe"], category: "EDM", emoji: "⚡", vibe: "Full Hype" },
  { keywords: ["indie","alternative","artsy","creative","unique","different","underground"], category: "Indie", emoji: "🎸", vibe: "Alternative Soul" },
];

app.post("/api/mood/detect", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const rule of moodRules) {
    const score = rule.keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = rule; }
  }

  // Fallback if nothing matched
  if (!best) {
    best = { category: "Trending", emoji: "🎵", vibe: "Good Vibes" };
  }

  const categoryData = categories.find(c => c.title === best.category);
  const reasons = {
    Soul: "This will help you process your feelings beautifully",
    Party: "Time to celebrate and let loose!",
    Focus: "Perfect beats to keep you in the zone",
    Workout: "This will power up your session",
    Romance: "Setting the perfect romantic atmosphere",
    Sleep: "Gentle sounds to ease you into rest",
    Chill: "Smooth vibes to help you unwind",
    Rock: "Channel that energy into something powerful",
    Pop: "Upbeat tunes to kick off your day",
    Jazz: "Warm, cozy sounds for a rainy mood",
    Classical: "Timeless music that transcends time",
    EDM: "Massive drops to amplify your energy",
    Indie: "Unique sounds that match your vibe",
    Trending: "Fresh hits that match your energy",
  };

  res.json({
    category: best.category,
    emoji: best.emoji,
    vibe: best.vibe,
    reason: reasons[best.category] || "Perfect match for your mood",
    color: categoryData?.color || "#1db954",
    playlistUrl: `https://open.spotify.com/playlist/${categoryData?.playlistId}`,
  });
});

// ── Favourites ─────────────────────────────────────────────────────────────────
app.get("/api/user/favorites", authMiddleware, async (req, res) => {
  const user = await findUser(req.user.email);
  res.json(user?.favoriteCategories || []);
});

app.post("/api/user/favorites/toggle", authMiddleware, async (req, res) => {
  const { title } = req.body;
  const user = await findUser(req.user.email);
  if (!user) return res.status(404).json({ error: "User not found" });
  const idx = user.favoriteCategories.indexOf(title);
  if (idx === -1) user.favoriteCategories.push(title);
  else user.favoriteCategories.splice(idx, 1);
  await saveUser(user);
  res.json({ favorites: user.favoriteCategories });
});

// ── Profile ────────────────────────────────────────────────────────────────────
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  const user = await findUser(req.user.email);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ name: user.name, email: user.email, createdAt: user.createdAt, favoriteCategories: user.favoriteCategories, nowPlaying: user.nowPlaying, totalFavorites: user.favoriteCategories.length });
});

app.put("/api/user/profile", authMiddleware, async (req, res) => {
  const { name } = req.body;
  const user = await findUser(req.user.email);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (name) user.name = name;
  await saveUser(user);
  res.json({ name: user.name, email: user.email });
});

// ── Analytics ──────────────────────────────────────────────────────────────────
app.get("/api/analytics", authMiddleware, async (req, res) => {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  res.json({
    weeklyHours: days.map(day => ({ day, hours: +(Math.random() * 5 + 0.5).toFixed(1) })),
    topGenres: [{ name:"Pop",value:35 },{ name:"Hip-Hop",value:25 },{ name:"Rock",value:15 },{ name:"Jazz",value:10 },{ name:"EDM",value:15 }],
    topArtists: [
      { rank:1, name:"The Weeknd", streams:"120 hrs" },{ rank:2, name:"Taylor Swift", streams:"95 hrs" },
      { rank:3, name:"Drake", streams:"80 hrs" },{ rank:4, name:"Arijit Singh", streams:"70 hrs" },{ rank:5, name:"Coldplay", streams:"65 hrs" }
    ],
    topSongs: [
      { rank:1, title:"Blinding Lights", artist:"The Weeknd", time:"30 hrs" },{ rank:2, title:"Levitating", artist:"Dua Lipa", time:"25 hrs" },
      { rank:3, title:"Shape of You", artist:"Ed Sheeran", time:"22 hrs" },{ rank:4, title:"Peaches", artist:"Justin Bieber", time:"20 hrs" },
      { rank:5, title:"Kesariya", artist:"Arijit Singh", time:"18 hrs" }
    ],
  });
});

// ── Health ─────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status:"ok", uptime:process.uptime(), db: useDB ? "mongodb" : "memory", spotify: !!SPOTIFY_CLIENT_ID }));

// ── Serve React build ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "../frontend/build/index.html")));
}

app.listen(PORT, () => console.log(`Moodify backend running on port ${PORT}`));
