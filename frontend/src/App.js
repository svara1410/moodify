import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import NowPlaying from "./components/NowPlaying";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import Analytics from "./pages/Analytics";
import Share from "./pages/Share";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import MoodDetector from "./pages/MoodDetector";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Navbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/mood" element={<MoodDetector />} />
              <Route path="/playlist" element={<PrivateRoute><Playlist /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/share" element={<Share />} />
            </Routes>
          </div>
          <NowPlaying />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
