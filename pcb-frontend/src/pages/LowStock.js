import React, { useEffect, useState } from "react";

export default function LowStock(){
  const [components, setComponents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(()=>{
    setComponents(JSON.parse(localStorage.getItem('components') || '[]'));
  },[]);

  const alerts = components
    .filter(c => c.stock <= c.threshold || c.stock <= c.monthlyRequired)
    .map(c=>({ id:c.id, name:c.name, mfr: c.manufacturer || 'N/A', mpn: c.partNumber, stock:c.stock, threshold: c.threshold || c.monthlyRequired, status: c.stock<= (c.threshold||c.monthlyRequired)/4 ? 'CRITICAL' : (c.stock <= (c.threshold||c.monthlyRequired)*0.25 ? 'WARNING' : 'LOW') }));

  function reorder(a){
    alert(`Reorder initiated for ${a.name} (mock)`);
  }

  const grouped = alerts.filter(a=> filter==='all' ? true : (filter==='critical' ? a.status==='CRITICAL' : a.status==='WARNING'));

  return (
    <div className="lowstock-shell container">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">Inventory &gt; Low Stock Alerts</div>
          <h1>Low Stock Alerts</h1>
          <div className="muted">Action required for components falling below critical thresholds.</div>
        </div>
        <div className="header-actions">
          <button className="btn">Shortage Report</button>
          <button className="btn primary">Reorder All Critical</button>
        </div>
      </div>

      <div className="cards-row">
        <div className="card">
          <div className="card-header"><h4>Critical Items</h4></div>
          <div className="card-body"><div className="card-value">{alerts.filter(a=>a.status==='CRITICAL').length}</div><div className="card-meta"><div style={{color:'#ef4444'}}>Immediate action required (&lt;10%)</div></div></div>
        </div>
        <div className="card">
          <div className="card-header"><h4>Warning Items</h4></div>
          <div className="card-body"><div className="card-value">{alerts.filter(a=>a.status==='WARNING').length}</div><div className="card-meta"><div style={{color:'#f59e0b'}}>Approach threshold (&lt;25%)</div></div></div>
        </div>
        <div className="card">
          <div className="card-header"><h4>Pending Orders</h4></div>
          <div className="card-body"><div className="card-value">05</div><div className="card-meta"><div style={{color:'#64748b'}}>Estimated restock in 48h</div></div></div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <button className={`btn ${filter==='all'?'primary':''}`} onClick={()=>setFilter('all')}>All Alerts ({alerts.length})</button>
            <button className={`btn ${filter==='critical'?'primary':''}`} onClick={()=>setFilter('critical')}>Critical (&lt;10%)</button>
            <button className={`btn ${filter==='warning'?'primary':''}`} onClick={()=>setFilter('warning')}>Warning (&lt;25%)</button>
          </div>
          <div className="muted">Sort by: Urgency ▾</div>
        </div>

        <div className="alerts-grid" style={{marginTop:12}}>
          {grouped.map(a=> (
            <div key={a.id} className={`alert-card ${a.status.toLowerCase()}`}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:800}}>{a.name}</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>MPN: {a.mpn || 'N/A'}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:800}}>{a.stock} / {a.threshold} units</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>Lead Time: {Math.max(2, Math.round(a.threshold/50))} days</div>
                </div>
              </div>

              <div style={{marginTop:12}}>
                <div style={{height:8,background:'#f1f5f9',borderRadius:6,overflow:'hidden'}}>
                  <div style={{width: `${Math.max(6, Math.min(100, Math.round((a.stock/a.threshold)*100)))}%`,height:8,background:a.status==='CRITICAL'? '#ef4444': a.status==='WARNING'? '#f59e0b':'#10b981' }} />
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                  <button className="btn primary" onClick={()=>reorder(a)}>Quick Reorder</button>
                  <button className="btn">...</button>
                </div>
              </div>
            </div>
          ))}

          <div className="alert-card monitor"><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:160,color:'#64748b'}}>Monitor New SKU</div></div>
        </div>
      </div>
    </div>
  );
}
