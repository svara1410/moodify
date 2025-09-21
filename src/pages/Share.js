import React from "react";
import "./Share.css";

export default function Share() {
  const currentUrl = window.location.href;

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="share-container">
      <h1>Share Your Moodify Playlist</h1>
      <p className="share-subtitle">
        Share your favorite playlists with friends across apps 🎶
      </p>

      <div className="share-options">
        {/* Instagram (no direct API → suggest copy link) */}
        <div className="share-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png"
            alt="Instagram"
          />
          <h3>Instagram</h3>
          <p>
            Instagram doesn’t allow direct link sharing. Copy & paste in Bio/DM.
          </p>
          <button onClick={handleCopyLink}>Copy for Instagram</button>
        </div>

        {/* Facebook */}
        <div className="share-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/145/145802.png"
            alt="Facebook"
          />
          <h3>Facebook</h3>
          <p>Post your playlist link on Facebook with friends.</p>
          <button
            onClick={() =>
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
                "_blank"
              )
            }
          >
            Share
          </button>
        </div>

        {/* Twitter */}
        <div className="share-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
            alt="Twitter"
          />
          <h3>Twitter</h3>
          <p>Tweet your playlist and let the world know your vibe.</p>
          <button
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?url=${currentUrl}&text=Check%20out%20my%20Moodify%20playlist!`,
                "_blank"
              )
            }
          >
            Share
          </button>
        </div>

        {/* Copy Link */}
        <div className="share-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/60/60510.png"
            alt="Copy Link"
          />
          <h3>Copy Link</h3>
          <p>Copy and share your playlist anywhere you want.</p>
          <button onClick={handleCopyLink}>Copy</button>
        </div>
      </div>
    </div>
  );
}
