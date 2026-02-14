import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { seedLocal } from "../data/mockData";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    seedLocal();
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Check registered users in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email }));
      nav("/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-logo">▦</div>
      <div className="login-card">
        <div className="auth-header">
          <div className="auth-title">PCB Component Inventory</div>
          <div className="auth-sub">OPERATIONS PORTAL V4.2.0</div>
        </div>

        <div className="auth-body">
          <h3 className="auth-h">Secure Terminal Access</h3>

          <form onSubmit={handleLogin} className="auth-form">
            <label className="field-label">Email</label>
            <div className="input-with-icon">
              <span className="icon">📧</span>
              <input placeholder="john.doe@company.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>

            <label className="field-label">Password</label>
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-btn" type="submit">Login</button>
          </form>

          <div className="back-link">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>

        <div className="auth-footer">
          <div className="notice">AUTHORIZED ACCESS FOR MANUFACTURING OPERATIONS ONLY. ALL ACTIONS, INCLUDING IP ADDRESS AND TIMESTAMPS, ARE LOGGED FOR COMPLIANCE AUDITING.</div>
          <div className="footer-meta"><span className="status ok">● INVENTORY ENGINE: ONLINE</span><span className="muted">&nbsp;&nbsp;|&nbsp;&nbsp; SUPPORT ID: 0800-PCB-HELP</span></div>
        </div>
      </div>
    </div>
  );
}
