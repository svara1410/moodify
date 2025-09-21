import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProtectedLogin.css";

function ProtectedLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.email && form.password) {
      localStorage.setItem("loggedIn", "true"); // mark user as logged in
      alert(`Logged in as ${form.email}`);
      navigate("/"); // redirect to home or previous page
    }
  };

  return (
    <div className="protected-login-container">
      <div className="protected-login-box">
        <h1>Login to Access</h1>
        <form onSubmit={handleSubmit} className="protected-login-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default ProtectedLogin;
