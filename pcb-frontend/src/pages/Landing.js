import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div className="landing">
      <div className="landing-content">
        <div className="hero-text">
          <small style={{color:'#94a3b8',fontWeight:700}}>INDUSTRIAL AUTOMATION 4.0</small>
          <h1 style={{fontSize:44,margin:'12px 0',lineHeight:1.05}}>Automated PCB<br/>Component<br/>Inventory System</h1>
          <p style={{color:'#64748b',maxWidth:520}}>Eliminate manual counting. Track every capacitor, resistor, and IC from production to board assembly in real-time with enterprise-grade precision.</p>
          <div className="landing-actions">
            <button onClick={() => nav('/login')} className="btn primary">Login to Dashboard</button>
            <button onClick={() => nav('/landing')} className="btn">View System Features</button>
          </div>
        </div>

        <div className="hero-visual">
          <div style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 12px 30px rgba(2,6,23,0.08)'}}>
            <div style={{height:220,background:'#f1f5f9',borderRadius:8,position:'relative'}}>
              <div style={{position:'absolute',right:24,top:24,width:220,height:140,background:'#0e5bd8',borderRadius:6}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
