import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import Analytics from "./pages/Analytics";
import Share from "./pages/Share";
import SignIn from "./pages/SignIn";
import ProtectedLogin from "./pages/ProtectedLogin";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/signin"
            element={<SignIn onLogin={handleLogin} />}
          />
          <Route path="/protected-login" element={<ProtectedLogin />} />

          <Route
            path="/playlist"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Playlist />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route path="/share" element={<Share />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
