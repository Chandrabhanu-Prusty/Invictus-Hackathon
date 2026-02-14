import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  const initials = user ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "U";

  /* ── State ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const searchRef = useRef();
  const notifRef = useRef();
  const profileRef = useRef();

  /* ── Build notifications from real data ── */
  useEffect(() => {
    const comps = JSON.parse(localStorage.getItem("components") || "[]");
    const notifs = [];
    comps.forEach((c) => {
      if (c.stock <= c.monthlyRequired * 0.25) {
        notifs.push({ id: c.id, type: "critical", icon: "🔴", text: `${c.name} is critically low (${c.stock} units)`, link: "/low-stock" });
      } else if (c.stock <= c.monthlyRequired * 0.5) {
        notifs.push({ id: c.id, type: "warning", icon: "🟡", text: `${c.name} stock is low (${c.stock} units)`, link: "/low-stock" });
      } else if (c.stock <= c.monthlyRequired) {
        notifs.push({ id: c.id, type: "info", icon: "🔵", text: `${c.name} below monthly target`, link: "/inventory" });
      }
    });
    setNotifications(notifs);
  }, []);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Global search across components, PCBs, production ── */
  function handleSearch(q) {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const query = q.toLowerCase();
    const comps = JSON.parse(localStorage.getItem("components") || "[]");
    const pcbs = JSON.parse(localStorage.getItem("pcbs") || "[]");
    const prod = JSON.parse(localStorage.getItem("productionHistory") || "[]");

    const results = [];

    comps.forEach((c) => {
      if (c.name?.toLowerCase().includes(query) || c.partNumber?.toLowerCase().includes(query) || c.category?.toLowerCase().includes(query)) {
        results.push({ id: `c-${c.id}`, icon: "📦", title: c.name, sub: `${c.partNumber} · Stock: ${c.stock}`, link: "/inventory" });
      }
    });

    pcbs.forEach((p) => {
      if (p.name?.toLowerCase().includes(query)) {
        results.push({ id: `p-${p.id}`, icon: "🧩", title: p.name, sub: `${(p.bom || []).length} components`, link: "/pcb-mapping" });
      }
    });

    prod.forEach((h) => {
      const pcbName = h.pcbName || `PCB #${h.pcbId}`;
      if (pcbName.toLowerCase().includes(query) || (h.batch || "").toLowerCase().includes(query)) {
        results.push({ id: `h-${h.id}`, icon: "🏭", title: pcbName, sub: `Batch: ${h.batch || "—"} · Qty: ${h.quantity}`, link: "/production" });
      }
    });

    setSearchResults(results.slice(0, 8));
    setShowSearch(true);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  }

  const criticalCount = notifications.filter((n) => n.type === "critical").length;

  return (
    <header className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>PCB Component Inventory</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* ── Global Search ── */}
        <div className="nav-search-wrap" ref={searchRef}>
          <div className="nav-search-box">
            <span className="nav-search-icon">🔍</span>
            <input
              className="nav-search-input"
              placeholder="Search components, parts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (searchQuery) setShowSearch(true); }}
            />
            {searchQuery && (
              <button className="nav-search-clear" onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearch(false); }}>✕</button>
            )}
          </div>
          {showSearch && (
            <div className="nav-dropdown search-dropdown">
              {searchResults.length === 0 ? (
                <div className="nav-dropdown-empty">No results for "{searchQuery}"</div>
              ) : (
                <>
                  <div className="nav-dropdown-title">SEARCH RESULTS ({searchResults.length})</div>
                  {searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="nav-dropdown-item"
                      onClick={() => { navigate(r.link); setShowSearch(false); setSearchQuery(""); }}
                    >
                      <span className="nav-dropdown-icon">{r.icon}</span>
                      <div>
                        <div className="nav-dropdown-item-title">{r.title}</div>
                        <div className="nav-dropdown-item-sub">{r.sub}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Notifications ── */}
        <div className="nav-notif-wrap" ref={notifRef}>
          <button className="nav-icon-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}>
            🔔
            {notifications.length > 0 && (
              <span className={`nav-badge ${criticalCount > 0 ? "critical" : ""}`}>{notifications.length}</span>
            )}
          </button>
          {showNotif && (
            <div className="nav-dropdown notif-dropdown">
              <div className="nav-dropdown-title">
                NOTIFICATIONS ({notifications.length})
                {criticalCount > 0 && <span className="nav-badge-inline critical">{criticalCount} critical</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="nav-dropdown-empty">✅ All stock levels healthy — no alerts</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`nav-dropdown-item ${n.type}`}
                    onClick={() => { navigate(n.link); setShowNotif(false); }}
                  >
                    <span className="nav-dropdown-icon">{n.icon}</span>
                    <div className="nav-dropdown-item-title">{n.text}</div>
                  </div>
                ))
              )}
              <div className="nav-dropdown-footer" onClick={() => { navigate("/low-stock"); setShowNotif(false); }}>
                View All Alerts →
              </div>
            </div>
          )}
        </div>

        {/* ── User Profile ── */}
        <div className="nav-profile-wrap" ref={profileRef}>
          <button className="nav-profile-btn" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}>
            <span className="nav-avatar">{initials}</span>
            {user && <span className="nav-user-name">{user.name}</span>}
          </button>
          {showProfile && (
            <div className="nav-dropdown profile-dropdown">
              <div className="nav-profile-header">
                <div className="nav-avatar large">{initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name || "User"}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{user?.email || "—"}</div>
                </div>
              </div>
              <div className="nav-dropdown-divider" />
              <div className="nav-dropdown-item" onClick={() => { navigate("/dashboard"); setShowProfile(false); }}>
                <span className="nav-dropdown-icon">🏠</span>
                <div className="nav-dropdown-item-title">Dashboard</div>
              </div>
              <div className="nav-dropdown-item" onClick={() => { navigate("/inventory"); setShowProfile(false); }}>
                <span className="nav-dropdown-icon">📦</span>
                <div className="nav-dropdown-item-title">Inventory</div>
              </div>
              <div className="nav-dropdown-item" onClick={() => { navigate("/reports"); setShowProfile(false); }}>
                <span className="nav-dropdown-icon">📈</span>
                <div className="nav-dropdown-item-title">Reports</div>
              </div>
              <div className="nav-dropdown-divider" />
              <div className="nav-dropdown-item danger" onClick={handleLogout}>
                <span className="nav-dropdown-icon">🚪</span>
                <div className="nav-dropdown-item-title">Sign Out</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
