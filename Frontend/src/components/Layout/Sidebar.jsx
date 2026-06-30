import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

function Sidebar({ activePage, onNavigate, collapsed, onToggle }) {
  const { user, logout } = useAuth();

  const allNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "safety",
      label: "Safety metrics",
      icon: "🛡️",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "costs",
      label: "Dept. costs",
      icon: "🧾",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: "✅",
      roles: ["ehss_officer", "it_admin", "qa"],
    },
    {
      id: "calendar",
      label: "EHSS Training calendar",
      icon: "📅",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "equipment",
      label: "Lifting equipment",
      icon: "🏗️",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "ppe",
      label: "PPE Management",
      icon: "🦺",
      roles: [
        "ehss_officer",
        "it_admin",
        "storekeeper",
        "supervisor",
        "production_manager",
      ],
    },
    {
      id: "sustainability",
      label: "Sustainability",
      icon: "🌿",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "action-tracker",
      label: "Action Tracker",
      icon: "📌",
      roles: [
        "ehss_officer",
        "it_admin",
        "qa",
        "storekeeper",
        "supervisor",
        "production_manager",
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📊",
      roles: ["ehss_officer", "it_admin"],
    },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(user?.role_name),
  );

  // Get initials from full name
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  // Friendly role label
  const roleLabel =
    {
      ehss_officer: "EHSS Officer",
      it_admin: "IT Admin",
      qa: "QA",
      storekeeper: "Storekeeper",
      supervisor: "Supervisor",
      production_manager: "Production Manager",
    }[user?.role_name] || user?.role_name;

  return (
    <div className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-logo">
        {!collapsed && (
          <img
            src="/src/assets/Capwell logo.png"
            alt="Capwell"
            className="sidebar-logo-img"
          />
        )}
        {collapsed && (
          <img
            src="/src/assets/capwell-logo.png"
            alt="Capwell"
            className="sidebar-logo-img-sm"
          />
        )}
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">EHSS</div>
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
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.full_name || "User"}
              </div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
          </div>
        )}
        {!collapsed && (
          <button className="sidebar-logout" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
