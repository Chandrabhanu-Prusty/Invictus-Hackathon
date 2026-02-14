import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email already registered
    if (users.find((u) => u.email === email)) {
      setError("An account with this email already exists.");
      return;
    }

    // Save new user
    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    setSuccess("Registration successful! Redirecting to login...");
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="login-page">
      <div className="login-logo">▦</div>
      <div className="login-card">
        {/* Header band */}
        <div className="auth-header">
          <div className="auth-title">PCB Component Inventory</div>
          <div className="auth-sub">CREATE YOUR ACCOUNT</div>
        </div>

        {/* Form body */}
        <div className="auth-body">
          <h3 className="auth-h">Register New Operator</h3>

          <form onSubmit={handleRegister} className="auth-form">
            <label className="field-label">Name</label>
            <div className="input-with-icon">
              <span className="icon">👤</span>
              <input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
              />
            </div>

            <label className="field-label">Email</label>
            <div className="input-with-icon">
              <span className="icon">📧</span>
              <input
                placeholder="john.doe@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <label className="field-label">Password</label>
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>

            <label className="field-label">Confirm Password</label>
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button className="auth-btn" type="submit">Register</button>
          </form>

          <div className="back-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <div className="notice">
            BY REGISTERING YOU AGREE TO THE TERMS OF SERVICE AND PRIVACY POLICY.
            ALL ACTIONS ARE LOGGED FOR COMPLIANCE AUDITING.
          </div>
          <div className="footer-meta">
            <span className="status ok">● INVENTORY ENGINE: ONLINE</span>
            <span className="muted">&nbsp;&nbsp;|&nbsp;&nbsp; SUPPORT ID: 0800-PCB-HELP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
