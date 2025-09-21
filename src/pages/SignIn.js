import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";

function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // LOGIN
      localStorage.setItem("loggedIn", "true"); // mark user as logged in
      alert(`Logged in as ${form.email}`);
      navigate("/"); // redirect to home
    } else {
      // REGISTER
      alert(`Registered user: ${form.name}, ${form.email}`);
      setIsLogin(true); // switch to login page after registration
      setForm({ email: "", password: "", name: "" });
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h1>{isLogin ? "Login" : "Register"}</h1>
        <form onSubmit={handleSubmit} className="signin-form">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
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
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <p className="toggle-text">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
