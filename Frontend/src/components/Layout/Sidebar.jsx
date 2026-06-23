import { useState } from "react";
import "./Sidebar.css";

function Sidebar({ activePage, onNavigate, collapsed, onToggle }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "safety", label: "Safety metrics", icon: "🛡️" },
    { id: "costs", label: "Dept. costs", icon: "🧾" },
    { id: "compliance", label: "Compliance", icon: "✅" },
    { id: "calendar", label: "EHSS Training calendar", icon: "📅" },
    { id: "equipment", label: "Lifting equipment", icon: "🏗️" },
    { id: "ppe", label: "PPE inventory", icon: "🦺" },
    { id: "sustainability", label: "Sustainability", icon: "🌿" },
    { id: "action-tracker", label: "Action Tracker", icon: "📌" },
    { id: "reports", label: "Reports", icon: "📊" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-logo">
        {!collapsed && <div className="sidebar-logo-icon">🛡️</div>}
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div
              className="sidebar-logo-title"
              title="Environment, Health, Safety and Sustainability"
            >
              EHSS
            </div>
            <div className="sidebar-logo-sub">Management System</div>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : ""}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {!collapsed && (
              <span className="sidebar-nav-label">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">LN</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Linda</div>
              <div className="sidebar-user-role">EHSS Officer</div>
            </div>
          </div>
        )}
        {!collapsed && <button className="sidebar-logout">Logout</button>}
      </div>
    </div>
  );
}

export default Sidebar;
