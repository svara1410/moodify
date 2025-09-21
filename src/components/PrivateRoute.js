import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  // Redirect to different login page
  return isLoggedIn ? children : <Navigate to="/protected-login" />;
}

export default PrivateRoute;
