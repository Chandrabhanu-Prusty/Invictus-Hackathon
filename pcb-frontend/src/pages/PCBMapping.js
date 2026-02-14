import React, { useEffect, useState } from "react";

export default function PCBMapping(){
  const [pcbs, setPcbs] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedPcb, setSelectedPcb] = useState("");
  const [componentId, setComponentId] = useState("");
  const [qtyPerPcb, setQtyPerPcb] = useState(1);
  const [bomRows, setBomRows] = useState([]);

  useEffect(()=>{
    setPcbs(JSON.parse(localStorage.getItem('pcbs') || '[]'));
    setComponents(JSON.parse(localStorage.getItem('components') || '[]'));
  },[]);

  useEffect(()=>{
    if(!selectedPcb) { setBomRows([]); return; }
    const key = `bom_${selectedPcb}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    setBomRows(saved);
  },[selectedPcb]);

  function addRow(){
    if(!selectedPcb || !componentId || !qtyPerPcb) return alert('Fill all fields');
    const newRow = { id: Date.now(), compId: parseInt(componentId), qty: parseInt(qtyPerPcb) };
    const updated = [...bomRows, newRow];
    setBomRows(updated);
    localStorage.setItem(`bom_${selectedPcb}`, JSON.stringify(updated));
    setComponentId(""); setQtyPerPcb(1);
  }

  function removeRow(id){
    const updated = bomRows.filter(r=>r.id!==id);
    setBomRows(updated);
    localStorage.setItem(`bom_${selectedPcb}`, JSON.stringify(updated));
  }

  function updateMapping(){
    alert('Mapping updated (mock)');
  }

  function getCompById(id){
    return components.find(c=>c.id===id) || {name:'Unknown', partNumber:'--', stock:0};
  }

  return (
    <div className="container">
      <div className="breadcrumbs">Inventory &gt; <strong>PCB Mapping</strong></div>
      <h1>PCB-to-Component Mapping</h1>
      <p className="muted">Define and manage the Bill of Materials (BOM) for specific PCB production models.</p>

      <div className="card bom-form">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3>Configure Bill of Materials</h3>
              <div className="meta">Last modified: -- by Admin</div>
            </div>

            <div className="form-row inline">
              <div className="field">
                <label>Select PCB Name</label>
                <select value={selectedPcb} onChange={e=>setSelectedPcb(e.target.value)}>
                  <option value="">-- Select PCB --</option>
                  {pcbs.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="field">
                <label>Add Component</label>
                <select value={componentId} onChange={e=>setComponentId(e.target.value)}>
                  <option value="">-- Select Component --</option>
                  {components.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="field small">
                <label>Quantity per PCB</label>
                <input type="number" value={qtyPerPcb} onChange={e=>setQtyPerPcb(e.target.value)} />
              </div>

              <div className="field actions-field">
                <label style={{visibility:'hidden'}}>add</label>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn" onClick={addRow}>+ Add Row</button>
                </div>
              </div>
            </div>

            <div className="form-actions" style={{marginTop:12}}>
              <div>
                <button className="btn" onClick={()=>{localStorage.removeItem(`bom_${selectedPcb}`); setBomRows([]);}}>Reset Form</button>
              </div>
              <div>
                <button className="btn primary" onClick={updateMapping}>Update Mapping</button>
              </div>
            </div>
          </div>

          <div className="card mapping-summary">
            <div className="summary-header">
              <h3>Mapping Summary</h3>
              <div className="summary-actions"><button className="btn">Export CSV</button><button className="btn">Print BOM</button></div>
            </div>

            <table className="mapping-table">
              <thead>
                <tr><th>Component</th><th>Part No.</th><th>Qty Per Unit</th><th>Total Stock Check</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bomRows.length===0 && (
                  <tr><td colSpan={5} style={{padding:28,textAlign:'center',color:'#64748b'}}>No BOM rows for selected PCB</td></tr>
                )}
                {bomRows.map(r=>{
                  const comp = getCompById(r.compId);
                  const stock = comp.stock || 0;
                  const status = stock===0 ? 'STOCK OUT' : (stock < r.qty ? 'LOW' : 'SUFFICIENT');
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{fontWeight:700}}>{comp.name}</div>
                        <div className="muted" style={{fontSize:12}}>Description placeholder</div>
                      </td>
                      <td><span className="chip">{comp.partNumber || '--'}</span></td>
                      <td>{r.qty}</td>
                      <td>
                        {status==='SUFFICIENT' && <span className="status-chip ok">Sufficient ({stock} units)</span>}
                        {status==='LOW' && <span className="status-chip low">Low Stock ({stock} units)</span>}
                        {status==='STOCK OUT' && <span className="status-chip critical">Stock Out ({stock} units)</span>}
                      </td>
                      <td><button className="btn small" onClick={()=>removeRow(r.id)}>🗑️</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
      </div>
    </div>
  );
}
