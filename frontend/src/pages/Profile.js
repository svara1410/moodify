import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import "./Profile.css";

function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/user/profile").then((data) => {
      setProfile(data);
      setNewName(data.name);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.post("/user/profile", { name: newName });
      setProfile((p) => ({ ...p, name: updated.name }));
      setMsg("Name updated! ✅");
      setEditing(false);
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const avatar = profile?.name ? profile.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">{avatar}</div>

        {editing ? (
          <div className="profile-edit">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
            <div className="edit-btns">
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-name-row">
            <h1>{profile?.name}</h1>
            <button className="edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
          </div>
        )}

        {msg && <p className="profile-msg">{msg}</p>}
        <p className="profile-email">{profile?.email}</p>
        <p className="profile-joined">Joined {joinedDate}</p>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{profile?.totalFavorites || 0}</span>
          <span className="stat-label">Favourites</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">🎵</span>
          <span className="stat-label">Music Lover</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{profile?.nowPlaying?.mood || "Chill"}</span>
          <span className="stat-label">Current Mood</span>
        </div>
      </div>

      {profile?.favoriteCategories?.length > 0 && (
        <div className="profile-favs">
          <h2>❤️ Your Favourite Categories</h2>
          <div className="fav-tags">
            {profile.favoriteCategories.map((cat, i) => (
              <span key={i} className="fav-tag">{cat}</span>
            ))}
          </div>
        </div>
      )}

      {profile?.nowPlaying && (
        <div className="profile-now">
          <h2>🎧 Last Playing</h2>
          <div className="now-card">
            <div className="now-disc">♪</div>
            <div>
              <p className="now-title">{profile.nowPlaying.title}</p>
              <p className="now-artist">{profile.nowPlaying.artist}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
