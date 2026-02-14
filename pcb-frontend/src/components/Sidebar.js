import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">PCB Inventory</div>
      </div>
      <nav className="menu">
        <NavLink to="/dashboard" className={({isActive})=> isActive? 'menu-item active':'menu-item'}><span className="icon">🏠</span> Dashboard</NavLink>
        <NavLink to="/inventory" className={({isActive})=> isActive? 'menu-item active':'menu-item'}><span className="icon">📦</span> Inventory Mgmt</NavLink>
        <NavLink to="/pcb-mapping" className={({isActive})=> isActive? 'menu-item active':'menu-item'}><span className="icon">🧩</span> PCB Mapping</NavLink>
        <NavLink to="/production" className={({isActive})=> isActive? 'menu-item active':'menu-item'}><span className="icon">🏭</span> Production Entry</NavLink>
        <NavLink to="/low-stock" className={({isActive})=> isActive? 'menu-item active':'menu-item'}><span className="icon">⚠️</span> Low Stock Alerts</NavLink>
        <NavLink to="/reports" className={({isActive})=> isActive? 'menu-item active':'menu-item'}><span className="icon">📈</span> Reports</NavLink>
        <NavLink to="/export" className={({isActive})=> isActive? 'menu-item active':'menu-item'}><span className="icon">⬇️</span> Export</NavLink>
      </nav>
    </aside>
  );
}

