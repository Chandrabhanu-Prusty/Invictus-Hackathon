import React, { useEffect, useMemo, useState } from "react";

export default function Inventory() {
  const [components, setComponents] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 5;

  /* ── Modal state ── */
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", partNumber: "", category: "", stock: "", monthlyRequired: "" });

  useEffect(() => {
    const comps = JSON.parse(localStorage.getItem("components") || "[]");
    setComponents(comps);
  }, []);

  function saveAll(list) {
    setComponents(list);
    localStorage.setItem("components", JSON.stringify(list));
  }

  /* ── CRUD ── */
  function openAdd() {
    setEditId(null);
    setForm({ name: "", partNumber: "", category: "", stock: "", monthlyRequired: "" });
    setShowModal(true);
  }

  function openEdit(c) {
    setEditId(c.id);
    setForm({
      name: c.name,
      partNumber: c.partNumber,
      category: c.category,
      stock: String(c.stock),
      monthlyRequired: String(c.monthlyRequired),
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name || !form.partNumber || !form.category || !form.stock || !form.monthlyRequired) {
      alert("Please fill all fields");
      return;
    }
    const entry = {
      name: form.name,
      partNumber: form.partNumber,
      category: form.category,
      stock: Number(form.stock),
      monthlyRequired: Number(form.monthlyRequired),
    };

    if (editId !== null) {
      // Update
      const updated = components.map((c) => (c.id === editId ? { ...c, ...entry } : c));
      saveAll(updated);
    } else {
      // Add
      const maxId = components.reduce((m, c) => Math.max(m, c.id), 0);
      saveAll([...components, { id: maxId + 1, ...entry }]);
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this component?")) return;
    saveAll(components.filter((c) => c.id !== id));
  }

  function handleDownloadCSV() {
    const headers = ["Name", "Part Number", "Category", "Stock", "Monthly Required", "Status"];
    const rows = annotated.map((c) => [c.name, c.partNumber, c.category, c.stock, c.monthlyRequired, c.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Derived data ── */
  const categories = useMemo(() => {
    const set = new Set(components.map((c) => c.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [components]);

  const annotated = components.map((c) => ({
    ...c,
    status: c.stock > c.monthlyRequired ? "OK" : c.stock > c.monthlyRequired / 2 ? "LOW" : "CRITICAL",
  }));

  const filtered = annotated.filter((c) => {
    if (query) {
      const q = query.toLowerCase();
      if (!(c.name.toLowerCase().includes(q) || (c.partNumber || "").toLowerCase().includes(q))) return false;
    }
    if (category !== "All" && c.category !== category) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    return true;
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const totalStock = components.reduce((s, c) => s + (c.stock || 0), 0);
  const lowCount = components.filter((c) => c.stock <= c.monthlyRequired).length;
  const monthlyFlow = components.reduce((s, c) => s + (c.monthlyRequired || 0), 0);

  return (
    <div className="container inventory-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="breadcrumbs">MAIN &gt; <strong>INVENTORY MANAGEMENT</strong></div>
          <h1>Inventory Management</h1>
          <p className="muted">Manage and track PCB components across all production lines and storage zones.</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={handleDownloadCSV}>⬇ Export CSV</button>
          <button className="btn primary" onClick={openAdd}>+ Add Component</button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="kpis">
        <div className="kpi card"><div className="kpi-title">TOTAL SKUs</div><div className="kpi-value">{components.length}</div></div>
        <div className="kpi card"><div className="kpi-title">LOW STOCK ALERT</div><div className="kpi-value" style={{ color: lowCount > 0 ? "#ef4444" : "#10b981" }}>{lowCount}</div></div>
        <div className="kpi card"><div className="kpi-title">IN STOCK</div><div className="kpi-value">{totalStock.toLocaleString()}</div></div>
        <div className="kpi card"><div className="kpi-title">MONTHLY FLOW</div><div className="kpi-value">{monthlyFlow.toLocaleString()}</div></div>
      </div>

      {/* ── Filters ── */}
      <div className="filters card">
        <div className="left-filters">
          <input placeholder="Search Part Number or Name..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </div>
        <div className="right-filters">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="All">All Status</option>
            <option value="OK">OK</option>
            <option value="LOW">LOW</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap card">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Part Number</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Monthly Req.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>No components found.</td></tr>
            )}
            {pageItems.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{c.category}</div>
                </td>
                <td><div className="chip">{c.partNumber}</div></td>
                <td>{c.category}</td>
                <td style={{ fontWeight: 700 }}>{c.stock}</td>
                <td>{c.monthlyRequired}</td>
                <td><span className={`status-chip ${c.status.toLowerCase()}`}>{c.status}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn small" onClick={() => openEdit(c)}>✏️ Edit</button>
                    <button className="btn small danger" onClick={() => handleDelete(c.id)}>🗑 Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <div>Showing {total > 0 ? start + 1 : 0}–{Math.min(start + perPage, total)} of {total} results</div>
          <div className="pagination">
            <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>&lt;</button>
            {Array.from({ length: pages }).slice(0, 7).map((_, i) => (
              <button key={i} className={i + 1 === page ? "btn primary" : "btn"} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="btn" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>&gt;</button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="inv-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <h3>{editId !== null ? "Edit Component" : "Add New Component"}</h3>
              <button className="inv-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="inv-modal-body">
              <label className="field-label">Component Name</label>
              <input type="text" placeholder="e.g. Resistor 10k" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <label className="field-label">Part Number</label>
              <input type="text" placeholder="e.g. R-10K-0603" value={form.partNumber} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} />

              <label className="field-label">Category</label>
              <input type="text" placeholder="e.g. Resistor, IC, Capacitor" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Current Stock</label>
                  <input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Monthly Required</label>
                  <input type="number" placeholder="0" value={form.monthlyRequired} onChange={(e) => setForm({ ...form, monthlyRequired: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="inv-modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn primary" onClick={handleSave}>{editId !== null ? "Save Changes" : "Add Component"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
