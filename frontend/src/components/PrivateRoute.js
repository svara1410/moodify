import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner">Loading…</div>;
  return user ? children : <Navigate to="/signin" replace />;
}

export default PrivateRoute;
