import React, { useEffect, useState } from "react";

export default function ProductionEntry(){
  const [pcbs, setPcbs] = useState([]);
  const [components, setComponents] = useState([]);
  const [selected, setSelected] = useState("");
  const [batch, setBatch] = useState("");
  const [qty, setQty] = useState(100);
  const [preview, setPreview] = useState([]);

  useEffect(()=>{
    setPcbs(JSON.parse(localStorage.getItem('pcbs') || '[]'));
    setComponents(JSON.parse(localStorage.getItem('components') || '[]'));
  },[]);

  useEffect(()=>{
    if(!selected || qty<=0) { setPreview([]); return; }
    const pcb = pcbs.find(p=>p.id===parseInt(selected));
    if(!pcb) return;
    const table = pcb.bom.map(item=>{
      const comp = components.find(c=>c.id===item.compId) || {name:'Unknown', partNumber:'--', stock:0};
      const required = item.qty * qty;
      return { id: item.compId, component: comp.name, partNumber: comp.partNumber, qtyPerUnit: item.qty, required, projected: comp.stock - required, stock: comp.stock };
    });
    setPreview(table);
  },[selected, qty, pcbs, components]);

  function handleSubmit(){
    const comps = [...components];
    preview.forEach(p=>{
      const idx = comps.findIndex(c=>c.id===p.id);
      if(idx>=0) comps[idx].stock = Math.max(0, comps[idx].stock - p.required);
    });
    setComponents(comps);
    localStorage.setItem('components', JSON.stringify(comps));
    setQty(0);
    setSelected("");
    setPreview([]);
    alert('Production recorded. Stocks updated (mock).');
  }

  return (
    <div className="production-shell page-shell">
      <aside className="sidebar-placeholder" />
      <div className="main-area">
        <div className="container">
          <div className="breadcrumbs">Dashboard &gt; Inventory &gt; <strong>Production Entry</strong></div>
          <h1>Production Entry</h1>
          <p className="muted">Record manufacturing output to automatically synchronize component inventory.</p>

          <div className="production-layout">
            <div className="left-col">
              <div className="card">
                <h3>Record Daily Production</h3>
                <div className="form-row">
                  <label>Select PCB Model</label>
                  <select value={selected} onChange={e=>setSelected(e.target.value)}>
                    <option value="">Select a part number...</option>
                    {pcbs.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>Production Batch Number</label>
                  <input placeholder="e.g. BATCH-2023-10-12" value={batch} onChange={e=>setBatch(e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Quantity Produced</label>
                  <input type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value||0))} />
                  <div className="muted" style={{fontSize:12}}>Updates deduction preview automatically.</div>
                </div>
                <div style={{marginTop:12}}>
                  <button className="btn primary" onClick={handleSubmit} disabled={!preview.length}>Submit Production</button>
                </div>
              </div>

              <div className="card info-card">
                <h4>Need help?</h4>
                <p className="muted">Ensure all batches are logged before 5 PM for the daily stock report generation.</p>
              </div>

              
            </div>

            <div className="right-col">
            </div>

            <div className="right-col">
              <div className="card preview-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3>Real-time Deduction Preview</h3>
                  <div className="muted">Calculated for {qty} Units</div>
                </div>

                <table className="mapping-table">
                  <thead>
                    <tr><th>Component Name</th><th>Part SKU</th><th>Qty / Unit</th><th>Total Deduction</th><th>Projected Stock</th></tr>
                  </thead>
                  <tbody>
                    {preview.length===0 && (
                      <tr><td colSpan={5} style={{padding:20,textAlign:'center'}}>Select PCB and enter quantity to see deduction preview</td></tr>
                    )}
                    {preview.map((r,idx)=>{
                      const low = r.projected <= 0;
                      const warn = r.projected > 0 && r.projected < (r.qtyPerUnit*5);
                      return (
                        <tr key={r.id} className={low? 'low-row': warn? 'warn-row':''}>
                          <td style={{fontWeight:700}}>{r.component}</td>
                          <td className="chip">{r.partNumber || '--'}</td>
                          <td>{r.qtyPerUnit}</td>
                          <td style={{color: '#ef4444'}}>-{r.required}</td>
                          <td>{r.projected} {low && <span className="status small critical">LOW STOCK</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                  <div className="muted">Note: This is a preview. No inventory has been modified yet.</div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn">🖨️</button>
                    <button className="btn">⬇️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:12,marginTop:18,alignItems:'stretch'}}>
            <div style={{width:220}}>
              <div className="card stock-alert">
                <div style={{fontWeight:700}}>Stock Alert</div>
                <div className="muted" style={{marginTop:6}}>3 components are below safety threshold.</div>
                <button className="btn" style={{marginTop:12}}>Review Inventory</button>
              </div>
            </div>

            <div style={{flex:1}}>
              <div className="bottom-kpis" style={{display:'flex',gap:12}}>
                <div className="kpi card"><div className="kpi-title">SYSTEM STATUS</div><div className="kpi-value">Mapping Active</div></div>
                <div className="kpi card"><div className="kpi-title">LAST ENTRY</div><div className="kpi-value">2h 15m ago</div></div>
                <div className="kpi card"><div className="kpi-title">MONTHLY OUTPUT</div><div className="kpi-value">12,450 Units</div></div>
                <div className="kpi card"><div className="kpi-title">REORDER LEVEL</div><div className="kpi-value">3 Skus Alert</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

