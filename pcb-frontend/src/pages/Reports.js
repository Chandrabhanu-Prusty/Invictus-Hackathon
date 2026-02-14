import React, { useEffect, useState } from "react";

export default function Reports(){
  const [components, setComponents] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(()=>{
    setComponents(JSON.parse(localStorage.getItem('components') || '[]'));
  },[]);

  const totalUnits = components.reduce((s,c)=>s + (c.usageMonth || 0), 0);
  const spend = components.reduce((s,c)=>s + ((c.unitPrice||0) * (c.usageMonth||0)), 0).toFixed(2);

  const paged = components.slice((page-1)*perPage, page*perPage).map(c=>({ id:c.id, sku:c.partNumber, description:c.name, category:c.category||'General', supplier:c.supplier||'Unknown', unitsUsed: c.usageMonth||0, unitPrice: c.unitPrice?`$${c.unitPrice.toFixed(3)}`:'$0.00', totalValue: c.unitPrice ? `$${(c.unitPrice*(c.usageMonth||0)).toFixed(2)}` : '$0.00' }));

  return (
    <div className="container reports-page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">Inventory &gt; Reports</div>
          <h1>Inventory & Consumption Reports</h1>
          <div className="muted">Last data sync: Oct 26, 2023, 08:45 AM</div>
        </div>
        <div className="header-actions">
          <button className="btn">Download PDF</button>
          <button className="btn primary">Export to Excel</button>
        </div>
      </div>

      <div className="filters" style={{marginTop:12}}>
        <select>
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
        <select>
          <option>All Categories</option>
        </select>
        <select>
          <option>All Suppliers</option>
        </select>
      </div>

      <div className="cards-row" style={{marginTop:12}}>
        <div className="card">
          <div className="card-header"><h4>Total Components Used</h4></div>
          <div className="card-body"><div className="card-value">{totalUnits.toLocaleString()} units</div></div>
        </div>
        <div className="card">
          <div className="card-header"><h4>Spend This Month</h4></div>
          <div className="card-body"><div className="card-value">${spend}</div></div>
        </div>
        <div className="card">
          <div className="card-header"><h4>Top Category</h4></div>
          <div className="card-body"><div className="card-value">SMD Resistors</div></div>
        </div>
      </div>

      <div style={{marginTop:16}}>
        <div className="card">
          <div className="card-header"><h4>Consumption Analytics</h4></div>
          <div className="card-body"><div style={{height:260,display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}>Line chart placeholder</div></div>
        </div>
      </div>

      <div style={{marginTop:18}}>
        <div className="card">
          <div className="card-header"><h4>Monthly Consumption Totals</h4></div>
          <div className="card-body">
            <table className="inventory-table">
              <thead><tr><th>Component ID</th><th>Description</th><th>Category</th><th>Supplier</th><th>Units Used</th><th>Unit Price</th><th>Total Value</th></tr></thead>
              <tbody>
                {paged.map(r=> (
                  <tr key={r.id}><td>{r.sku}</td><td>{r.description}</td><td>{r.category}</td><td>{r.supplier}</td><td>{r.unitsUsed}</td><td>{r.unitPrice}</td><td>{r.totalValue}</td></tr>
                ))}
              </tbody>
            </table>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
              <div className="muted">Showing 1 - {Math.min(components.length, perPage)} of {components.length} components</div>
              <div>
                <button className="btn">Previous</button>
                <button className="btn primary" style={{marginLeft:8}}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

