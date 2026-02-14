import React, { useEffect, useState } from "react";

export default function ExportPage(){
  const [components, setComponents] = useState([]);
  const columnGroups = {
    "Component Info": ["Component ID","Description","Category","Supplier"],
    "Stock & Usage": ["Units In Stock","Units Used","Threshold"],
    "Financial Records": ["Unit Price","Total Value"]
  };
  const allCols = Object.values(columnGroups).flat();
  const [selected, setSelected] = useState(new Set(allCols.slice(0,5)));
  const [fileName, setFileName] = useState('Financial_Report_Q4_2023.xlsx');
  const [includeMeta, setIncludeMeta] = useState(true);
  const [range, setRange] = useState({from:'2023-10-01', to:'2023-12-31'});

  useEffect(()=>{
    setComponents(JSON.parse(localStorage.getItem('components') || '[]'));
  },[]);

  function toggle(col){
    const s = new Set(selected);
    if(s.has(col)) s.delete(col); else s.add(col);
    setSelected(s);
  }

  function selectAll(){
    setSelected(new Set(allCols));
  }

  function clearAll(){
    setSelected(new Set());
  }

  function doDownload(){
    // Build CSV preview (mock) and download as .xlsx (simple CSV for demo)
    const cols = Array.from(selected);
    const rows = components.slice(0,50).map(c=>{
      return cols.map(col=>{
        switch(col){
          case 'Component ID': return c.partNumber || '';
          case 'Description': return c.name || '';
          case 'Category': return c.category || '';
          case 'Supplier': return c.supplier || '';
          case 'Units In Stock': return c.stock || 0;
          case 'Units Used': return c.usageMonth || 0;
          case 'Threshold': return c.threshold || c.monthlyRequired || 0;
          case 'Unit Price': return c.unitPrice || 0;
          case 'Total Value': return ((c.unitPrice||0)*(c.usageMonth||0)).toFixed(2);
          default: return '';
        }
      }).join(',');
    });
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const previewCols = Array.from(selected);
  const previewRows = components.slice(0,5);

  return (
    <div className="container export-shell">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">Data Management &gt; Export Configuration</div>
          <h1>Configure Export</h1>
        </div>
        <div className="header-actions">
          <button className="btn">Cancel</button>
          <button className="btn primary" onClick={doDownload}>Download .xlsx</button>
        </div>
      </div>

      <div className="export-layout">
        <div className="export-left card">
          <div className="left-header"><h3>General Settings</h3></div>
          <div className="left-body">
            <label className="section-label">File Name</label>
            <input value={fileName} onChange={e=>setFileName(e.target.value)} />

            <div className="switch-row">
              <div className="section-label">Include Metadata</div>
              <label className="toggle">
                <input type="checkbox" checked={includeMeta} onChange={e=>setIncludeMeta(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>

            <div style={{marginTop:12}}>
              <div className="section-label">Date Range</div>
              <div className="date-row">
                <input type="date" value={range.from} onChange={e=>setRange({...range, from:e.target.value})} />
                <input type="date" value={range.to} onChange={e=>setRange({...range, to:e.target.value})} />
              </div>
            </div>

            <div style={{marginTop:16}} className="columns-section">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div className="section-label">Column Selection</div>
                <div style={{fontSize:13}}><button className="btn small" onClick={selectAll}>Select All</button> <button className="btn small" onClick={clearAll}>Clear</button></div>
              </div>

              {Object.entries(columnGroups).map(([group, cols])=> (
                <div key={group} className="col-group">
                  <div className="group-title">{group}</div>
                  <div className="group-list">
                    {cols.map(c=> (
                      <label key={c} className="col-item"><input type="checkbox" checked={selected.has(c)} onChange={()=>toggle(c)} /> {c}</label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="export-right">
          <div className="card export-preview">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h4>Export Preview</h4>
              <div className="view-toggle"><button className="btn small">Grid View</button><button className="btn small">JSON View</button></div>
            </div>

            <div className="preview-grid">
              <table className="preview-table">
                <thead>
                  <tr>{previewCols.map(c=> <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {previewRows.map((r,idx)=> (
                    <tr key={idx}>{previewCols.map((c,ci)=>{
                      let v='';
                      switch(c){
                        case 'Component ID': v=r.partNumber; break;
                        case 'Description': v=r.name; break;
                        case 'Category': v=r.category; break;
                        case 'Supplier': v=r.supplier; break;
                        case 'Units In Stock': v=r.stock; break;
                        case 'Units Used': v=r.usageMonth; break;
                        case 'Threshold': v=r.threshold || r.monthlyRequired; break;
                        case 'Unit Price': v=r.unitPrice; break;
                        case 'Total Value': v=((r.unitPrice||0)*(r.usageMonth||0)).toFixed(2); break;
                        default: v='';
                      }
                      return <td key={ci}>{v}</td>;
                    })}</tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="preview-footer" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>{previewCols.length} selected columns • Estimated size: 1.2 MB</div>
              <div className="muted">Preview Zoom: 100%</div>
            </div>
          </div>

          <div style={{marginTop:12}} className="tip card">
            <div style={{fontWeight:700}}>Tip:</div>
            <div className="muted">You can save this configuration as a template for monthly recurring exports.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
