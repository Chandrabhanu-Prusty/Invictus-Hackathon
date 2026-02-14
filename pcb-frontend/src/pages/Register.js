import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/register", { name, email, password });
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  // Inline Styles
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    fontFamily: "Arial, sans-serif"
  };
  const cardStyle = {
    backgroundColor: "white",
    padding: "40px 50px",
    borderRadius: 12,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.2)",
    width: 360,
    textAlign: "center"
  };
  const inputStyle = { width: "100%", padding: 12, margin: "10px 0", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 };
  const buttonStyle = { width: "100%", padding: 14, marginTop: 20, borderRadius: 6, border: "none", backgroundColor: "#667eea", color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer" };
  const linkStyle = { color: "#667EEA", textDecoration: "none", fontSize: 13 };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>Create Account</h2>

        <input
          style={inputStyle}
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          style={inputStyle}
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button style={buttonStyle} onClick={handleRegister}>Register</button>

        <p style={{ marginTop: 20, fontSize: 13 }}>
          Already have an account? <a href="/login" style={linkStyle}>Login</a>
        </p>
      </div>
    </div>
  );
}
