import React, { useEffect, useMemo, useState } from "react";

export default function Inventory(){
  const [components, setComponents] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(()=>{
    const comps = JSON.parse(localStorage.getItem('components') || '[]');
    setComponents(comps);
  },[]);

  function saveAll(list){
    setComponents(list);
    localStorage.setItem('components', JSON.stringify(list));
  }

  function handleDelete(id){
    const updated = components.filter(c => c.id !== id);
    saveAll(updated);
  }

  const categories = useMemo(()=>{
    const set = new Set(components.map(c=>c.category).filter(Boolean));
    return ["All",...Array.from(set)];
  },[components]);

  const annotated = components.map(c=>({
    ...c,
    status: c.stock > c.monthlyRequired ? 'OK' : (c.stock > (c.monthlyRequired/2) ? 'LOW' : 'CRITICAL')
  }));

  const filtered = annotated.filter(c=>{
    if(query){
      const q = query.toLowerCase();
      if(!(c.name.toLowerCase().includes(q) || (c.partNumber||'').toLowerCase().includes(q))) return false;
    }
    if(category !== 'All' && c.category !== category) return false;
    if(statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page-1)*perPage;
  const pageItems = filtered.slice(start, start+perPage);

  return (
    <div className="container inventory-page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">MAIN &gt; <strong>INVENTORY MANAGEMENT</strong></div>
          <h1>Inventory Management</h1>
          <p className="muted">Manage and track PCB components across all production lines and storage zones.</p>
        </div>

        <div className="header-actions">
          <button className="btn">Edit Bulk</button>
          <button className="btn">Import Excel</button>
          <button className="btn primary">Add Component</button>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi card"><div className="kpi-title">TOTAL SKUs</div><div className="kpi-value">{components.length}</div></div>
        <div className="kpi card"><div className="kpi-title">LOW STOCK ALERT</div><div className="kpi-value">{components.filter(c=>c.stock <= c.monthlyRequired).length}</div></div>
        <div className="kpi card"><div className="kpi-title">IN STOCK</div><div className="kpi-value">{components.reduce((s,c)=>s+(c.stock||0),0)}</div></div>
        <div className="kpi card"><div className="kpi-title">MONTHLY FLOW</div><div className="kpi-value">45k+</div></div>
      </div>

      <div className="filters card">
        <div className="left-filters">
          <input placeholder="Search Part Number or Name..." value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} />
        </div>
        <div className="right-filters">
          <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}}>
            {categories.map(cat=> <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}}>
            <option>All</option>
            <option>OK</option>
            <option>LOW</option>
            <option>CRITICAL</option>
          </select>
          <button className="btn">Download</button>
        </div>
      </div>

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
            {pageItems.map(c=> (
              <tr key={c.id}>
                <td>
                  <div style={{fontWeight:700}}>{c.name}</div>
                  <div style={{fontSize:12,color:'#64748b'}}>{c.category}</div>
                </td>
                <td><div className="chip">{c.partNumber}</div></td>
                <td>{c.category}</td>
                <td style={{fontWeight:700}}>{c.stock}</td>
                <td>{c.monthlyRequired}</td>
                <td><span className={`status-chip ${c.status.toLowerCase()}`}>{c.status}</span></td>
                <td>
                  <button className="btn small">Edit</button>
                  <button className="btn small danger" onClick={()=>handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <div>Showing {start+1}-{Math.min(start+perPage, total)} of {total} results</div>
          <div className="pagination">
            <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))}>&lt;</button>
            {Array.from({length:pages}).slice(0,7).map((_,i)=> (
              <button key={i} className={i+1===page? 'btn primary':'btn'} onClick={()=>setPage(i+1)}>{i+1}</button>
            ))}
            <button className="btn" onClick={()=>setPage(p=>Math.min(pages,p+1))}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

