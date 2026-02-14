import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem("token");
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <div style={{fontWeight:700,color:'#0f172a'}}>PCB Component Inventory</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="search"><input placeholder="Search components, parts..." /></div>
        <button className="icon-btn">🔔</button>
        <div className="profile">
          <span className="avatar">U</span>
        </div>
        <button className="btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </header>
  );
}
