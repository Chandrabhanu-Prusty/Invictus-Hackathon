import React, { useEffect, useState, useRef } from "react";

const FIELD_MAP = {
    "Name": "name",
    "Part Number": "partNumber",
    "Category": "category",
    "Current Stock": "stock",
    "Monthly Required": "monthlyRequired",
};
const FIELDS = Object.keys(FIELD_MAP);

export default function ImportPage() {
    const [step, setStep] = useState(1); // 1=upload, 2=map, 3=preview, 4=done
    const [rawRows, setRawRows] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    const [importData, setImportData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [importResult, setImportResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState("");
    const [importHistory, setImportHistory] = useState([]);
    const fileRef = useRef();

    useEffect(() => {
        setImportHistory(JSON.parse(localStorage.getItem("importHistory") || "[]"));
    }, []);

    /* ── Parse CSV text ── */
    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) return { headers: [], rows: [] };
        const hdr = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
        const rows = lines.slice(1).map((line) => {
            const vals = line.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
            const obj = {};
            hdr.forEach((h, i) => { obj[h] = vals[i] || ""; });
            return obj;
        });
        return { headers: hdr, rows };
    }

    /* ── Handle file selection ── */
    function handleFile(file) {
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const { headers: hdr, rows } = parseCSV(e.target.result);
            setHeaders(hdr);
            setRawRows(rows);

            // Auto-map columns by matching names
            const autoMap = {};
            FIELDS.forEach((field) => {
                const match = hdr.find((h) => h.toLowerCase().replace(/[^a-z]/g, "") === field.toLowerCase().replace(/[^a-z]/g, ""));
                if (match) autoMap[field] = match;
            });
            setMapping(autoMap);
            setStep(2);
        };
        reader.readAsText(file);
    }

    function onDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }

    function onBrowse(e) {
        const file = e.target.files[0];
        if (file) handleFile(file);
    }

    /* ── Step 2 → 3: Validate mapping and build import preview ── */
    function processMapping() {
        const errs = [];
        // Name and Part Number are required mappings
        if (!mapping["Name"]) errs.push("'Name' column must be mapped.");
        if (!mapping["Part Number"]) errs.push("'Part Number' column must be mapped.");
        if (errs.length > 0) { setErrors(errs); return; }

        const data = rawRows.map((row, i) => {
            const item = {};
            FIELDS.forEach((field) => {
                const csvCol = mapping[field];
                if (csvCol) {
                    const val = row[csvCol];
                    if (field === "Current Stock" || field === "Monthly Required") {
                        item[FIELD_MAP[field]] = parseInt(val) || 0;
                    } else {
                        item[FIELD_MAP[field]] = val || "";
                    }
                }
            });
            item._row = i + 2; // original row number (1-indexed + header)
            return item;
        });

        // Validate each row
        const rowErrors = [];
        data.forEach((d) => {
            if (!d.name) rowErrors.push(`Row ${d._row}: Name is empty.`);
            if (!d.partNumber) rowErrors.push(`Row ${d._row}: Part Number is empty.`);
        });

        const validData = data.filter((d) => d.name && d.partNumber);
        setImportData(validData);
        setErrors(rowErrors);
        setStep(3);
    }

    /* ── Step 3 → 4: Import into localStorage ── */
    function doImport() {
        const existing = JSON.parse(localStorage.getItem("components") || "[]");
        let added = 0;
        let updated = 0;

        importData.forEach((item) => {
            const idx = existing.findIndex((c) => c.partNumber === item.partNumber);
            if (idx >= 0) {
                // Update existing component
                existing[idx] = {
                    ...existing[idx],
                    name: item.name || existing[idx].name,
                    category: item.category || existing[idx].category,
                    stock: item.stock !== undefined ? item.stock : existing[idx].stock,
                    monthlyRequired: item.monthlyRequired !== undefined ? item.monthlyRequired : existing[idx].monthlyRequired,
                };
                updated++;
            } else {
                // Add new component
                existing.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    partNumber: item.partNumber,
                    category: item.category || "General",
                    stock: item.stock || 0,
                    monthlyRequired: item.monthlyRequired || 0,
                });
                added++;
            }
        });

        localStorage.setItem("components", JSON.stringify(existing));

        const result = { added, updated, total: importData.length, date: new Date().toLocaleString(), file: fileName };
        setImportResult(result);

        // Save to history
        const history = [{ id: Date.now(), ...result }, ...importHistory].slice(0, 20);
        setImportHistory(history);
        localStorage.setItem("importHistory", JSON.stringify(history));

        setStep(4);
    }

    /* ── Reset ── */
    function reset() {
        setStep(1);
        setRawRows([]);
        setHeaders([]);
        setMapping({});
        setImportData([]);
        setErrors([]);
        setImportResult(null);
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
    }

    return (
        <div className="container">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <div className="breadcrumbs">Data Management &gt; <strong>IMPORT</strong></div>
                    <h1>Import Components</h1>
                    <p className="muted">Upload a CSV file to bulk-add or update inventory components.</p>
                </div>
                <div className="header-actions">
                    {step > 1 && <button className="btn" onClick={reset}>↩ Start Over</button>}
                </div>
            </div>

            {/* ── Progress Steps ── */}
            <div className="import-steps">
                {[
                    { n: 1, label: "Upload File" },
                    { n: 2, label: "Map Columns" },
                    { n: 3, label: "Preview & Validate" },
                    { n: 4, label: "Complete" },
                ].map((s) => (
                    <div key={s.n} className={`import-step ${step === s.n ? "active" : ""} ${step > s.n ? "done" : ""}`}>
                        <div className="step-circle">{step > s.n ? "✓" : s.n}</div>
                        <div className="step-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════ STEP 1: Upload ══════════════ */}
            {step === 1 && (
                <div className="card" style={{ padding: 24, marginTop: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Upload CSV File</h3>

                    <div
                        className={`drop-zone ${dragOver ? "drag-over" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileRef.current?.click()}
                    >
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                            Drag & drop your CSV file here
                        </div>
                        <div className="muted">or click to browse</div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
                            Supported: .csv files with headers in the first row
                        </div>
                        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={onBrowse} style={{ display: "none" }} />
                    </div>

                    <div className="card" style={{ marginTop: 20, padding: 16, background: "#f8fafc" }}>
                        <h4 style={{ marginTop: 0 }}>📋 Expected CSV Format</h4>
                        <p className="muted" style={{ fontSize: 13, margin: "4px 0 10px" }}>Your CSV should have the following columns (order doesn't matter):</p>
                        <div style={{ overflowX: "auto" }}>
                            <table className="mapping-table">
                                <thead>
                                    <tr><th>Column</th><th>Required</th><th>Example</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td style={{ fontWeight: 700 }}>Name</td><td><span className="status-chip critical">Required</span></td><td>Resistor 10k</td></tr>
                                    <tr><td style={{ fontWeight: 700 }}>Part Number</td><td><span className="status-chip critical">Required</span></td><td>R-10K-0603</td></tr>
                                    <tr><td style={{ fontWeight: 700 }}>Category</td><td><span className="status-chip ok">Optional</span></td><td>Resistor</td></tr>
                                    <tr><td style={{ fontWeight: 700 }}>Current Stock</td><td><span className="status-chip ok">Optional</span></td><td>1200</td></tr>
                                    <tr><td style={{ fontWeight: 700 }}>Monthly Required</td><td><span className="status-chip ok">Optional</span></td><td>300</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
                            💡 Matching Part Numbers will update existing components instead of creating duplicates.
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ STEP 2: Map Columns ══════════════ */}
            {step === 2 && (
                <div className="card" style={{ padding: 24, marginTop: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Map CSV Columns</h3>
                    <p className="muted" style={{ marginTop: -8 }}>
                        File: <strong>{fileName}</strong> — {rawRows.length} rows detected with {headers.length} columns
                    </p>

                    {errors.length > 0 && (
                        <div className="auth-error" style={{ marginBottom: 16 }}>
                            {errors.map((e, i) => <div key={i}>{e}</div>)}
                        </div>
                    )}

                    <table className="mapping-table" style={{ maxWidth: 600 }}>
                        <thead>
                            <tr><th>System Field</th><th>CSV Column</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {FIELDS.map((field) => {
                                const req = field === "Name" || field === "Part Number";
                                return (
                                    <tr key={field}>
                                        <td>
                                            <span style={{ fontWeight: 700 }}>{field}</span>
                                            {req && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
                                        </td>
                                        <td>
                                            <select
                                                value={mapping[field] || ""}
                                                onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                                                style={{ width: "100%", padding: "6px 10px", border: "1px solid #e6eef6", borderRadius: 6, fontSize: 13 }}
                                            >
                                                <option value="">— Skip —</option>
                                                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            {mapping[field] ? (
                                                <span className="status-chip ok">Mapped</span>
                                            ) : req ? (
                                                <span className="status-chip critical">Required</span>
                                            ) : (
                                                <span className="status-chip low">Skipped</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button className="btn" onClick={() => setStep(1)}>← Back</button>
                        <button className="btn primary" onClick={processMapping}>Continue to Preview →</button>
                    </div>
                </div>
            )}

            {/* ══════════════ STEP 3: Preview ══════════════ */}
            {step === 3 && (
                <div className="card" style={{ padding: 24, marginTop: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0 }}>Import Preview</h3>
                        <div className="muted">{importData.length} valid rows ready to import</div>
                    </div>

                    {errors.length > 0 && (
                        <div className="auth-error" style={{ marginTop: 12 }}>
                            <strong>⚠ {errors.length} validation warning(s):</strong>
                            <div style={{ maxHeight: 80, overflowY: "auto", marginTop: 4 }}>
                                {errors.map((e, i) => <div key={i} style={{ fontSize: 12 }}>{e}</div>)}
                            </div>
                        </div>
                    )}

                    <div style={{ overflowX: "auto", marginTop: 16 }}>
                        <table className="mapping-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Part Number</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                    <th>Monthly Required</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importData.slice(0, 20).map((d, i) => (
                                    <tr key={i}>
                                        <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                                        <td style={{ fontWeight: 700 }}>{d.name}</td>
                                        <td><span className="chip">{d.partNumber}</span></td>
                                        <td>{d.category || "—"}</td>
                                        <td>{d.stock}</td>
                                        <td>{d.monthlyRequired}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {importData.length > 20 && (
                            <div className="muted" style={{ textAlign: "center", marginTop: 8 }}>Showing 20 of {importData.length} rows</div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button className="btn" onClick={() => setStep(2)}>← Back</button>
                        <button className="btn primary" onClick={doImport}>✅ Import {importData.length} Components</button>
                    </div>
                </div>
            )}

            {/* ══════════════ STEP 4: Complete ══════════════ */}
            {step === 4 && importResult && (
                <div className="card" style={{ padding: 32, marginTop: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                    <h2 style={{ margin: "0 0 8px" }}>Import Complete!</h2>
                    <p className="muted">File: {importResult.file}</p>

                    <div className="kpis" style={{ justifyContent: "center", marginTop: 20 }}>
                        <div className="kpi card"><div className="kpi-title">TOTAL PROCESSED</div><div className="kpi-value">{importResult.total}</div></div>
                        <div className="kpi card"><div className="kpi-title">NEW ADDED</div><div className="kpi-value" style={{ color: "#10b981" }}>{importResult.added}</div></div>
                        <div className="kpi card"><div className="kpi-title">EXISTING UPDATED</div><div className="kpi-value" style={{ color: "#3b82f6" }}>{importResult.updated}</div></div>
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
                        <button className="btn primary" onClick={reset}>📁 Import Another File</button>
                        <button className="btn" onClick={() => window.location.href = "/inventory"}>📦 View Inventory</button>
                    </div>
                </div>
            )}

            {/* ── Import History ── */}
            {importHistory.length > 0 && step === 1 && (
                <div className="card" style={{ marginTop: 20, padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Import History</h3>
                    <table className="mapping-table">
                        <thead>
                            <tr><th>Date</th><th>File</th><th>Total</th><th>Added</th><th>Updated</th></tr>
                        </thead>
                        <tbody>
                            {importHistory.slice(0, 10).map((h) => (
                                <tr key={h.id}>
                                    <td className="muted">{h.date}</td>
                                    <td style={{ fontWeight: 600 }}>{h.file}</td>
                                    <td>{h.total}</td>
                                    <td style={{ color: "#10b981", fontWeight: 600 }}>+{h.added}</td>
                                    <td style={{ color: "#3b82f6", fontWeight: 600 }}>{h.updated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
