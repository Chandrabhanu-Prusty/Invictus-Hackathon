import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import Table from "../components/Table";

export default function Dashboard() {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    const comps = JSON.parse(localStorage.getItem('components') || '[]');
    setComponents(comps);
  }, []);

  const totalComponents = components.reduce((s, c) => s + c.stock, 0);
  const lowStock = components.filter(c => c.stock <= c.monthlyRequired).length;
  const activePCBTypes = 2; // from mock

  const topConsumed = components.slice(0,4).map(c => ({ id: c.id, "Component Name": c.name, "Part Number": c.partNumber, "Current Stock": c.stock }));

  return (
    <div className="dashboard container">
      <div className="cards-row">
        <Card title="Total Components">
          <div className="card-value">{totalComponents}</div>
          <div className="card-meta"><div className="trend" style={{color:'#10b981'}}>+2.4% vs last month</div><div className="small-icon">📦</div></div>
        </Card>
        <Card title="Low Stock Items">
          <div className="card-value">{lowStock}</div>
          <div className="card-meta"><div className="trend" style={{color:'#f97316'}}>Urgent action required</div><div className="small-icon">⚠️</div></div>
        </Card>
        <Card title="Monthly Consumption">
          <div className="card-value">{components.reduce((s,c)=>s+c.monthlyRequired,0)}</div>
          <div className="card-meta"><div className="trend" style={{color:'#10b981'}}>+12.8% Peak production</div><div className="small-icon">📈</div></div>
        </Card>
        <Card title="Active PCB Types">
          <div className="card-value">{activePCBTypes}</div>
          <div className="card-meta"><div className="trend" style={{color:'#64748b'}}>0% Stable pipeline</div><div className="small-icon">🗂️</div></div>
        </Card>
      </div>

      <div className="main-grid">
        <div className="left">
          <Card title="Component Usage Trend" className="chart">
            <div className="chart-area">Chart placeholder</div>
          </Card>

          <Card title="Top Consumed Components">
            <Table columns={["Component Name","Part Number","Current Stock"]} data={topConsumed} />
          </Card>
        </div>

        <div className="right">
          <div className="card alerts-panel">
            <div style={{padding:'0 18px'}}>
              <div className="card-header"><h4>Critical Stock Alerts</h4></div>
              <div className="card-body">
                <div className="alert-list">
                  {components.filter(c=>c.stock<=c.monthlyRequired).slice(0,5).map(a=> (
                    <div key={a.id} className={`alert-item ${a.stock <= (a.monthlyRequired/2) ? 'critical':''}`}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <div className="title">{a.name}</div>
                          <div className="meta">PN: {a.partNumber}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div className="qty">{a.stock} Units</div>
                          <div style={{marginTop:8}}><span className="status critical">CRITICAL</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="alert-footer"><button className="btn primary">ORDER NOW</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

