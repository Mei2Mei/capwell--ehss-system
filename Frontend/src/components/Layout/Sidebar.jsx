import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import ChangePasswordModal from "./ChangePasswordModal";
import logo from "../../assets/Logo.png";

function Sidebar({ activePage, onNavigate, collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  const allNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "safety",
      label: "Safety Metrics",
      icon: "🛡️",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "costs",
      label: "Departmental Costs",
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
      label: "EHSS Calendar",
      icon: "📅",
      roles: ["ehss_officer", "it_admin"],
    },
    {
      id: "equipment",
      label: "Lifting Equipment",
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
        "qa",
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
    { id: "users", label: "User Management", icon: "👥", roles: ["it_admin"] },
    { id: "audit-logs", label: "Audit Logs", icon: "📋", roles: ["it_admin"] },
  ];

  const navItems = allNavItems.filter((item) =>
    item.roles.includes(user?.role_name),
  );

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const roleLabel =
    {
      ehss_officer: "EHSS Officer",
      it_admin: "IT Admin",
      qa: "QA",
      storekeeper: "Storekeeper",
      supervisor: "Supervisor",
      production_manager: "Production Manager",
    }[user?.role_name] || user?.role_name;

  const handleNavigate = (id) => {
    onNavigate(id);
    setMobileOpen(false); // close on mobile after clicking
  };

  return (
    <>
      {/* Hamburger — mobile only */}
      <button className="sidebar-hamburger" onClick={() => setMobileOpen(true)}>
        ☰
      </button>

      {/* Overlay — mobile only */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-logo">
          {!collapsed && (
            <img src={logo} alt="EHSS" className="sidebar-logo-img" />
          )}
          {collapsed && (
            <img src={logo} alt="EHSS" className="sidebar-logo-img-sm" />
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
              onClick={() => handleNavigate(item.id)}
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
            <button
              className="sidebar-logout"
              onClick={() => setShowChangePw(true)}
              style={{ marginBottom: 6, background: "rgba(255,255,255,0.05)" }}
            >
              🔑 Change Password
            </button>
          )}

          {!collapsed && (
            <button className="sidebar-logout" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
      {showChangePw && (
        <ChangePasswordModal onClose={() => setShowChangePw(false)} />
      )}
    </>
  );
}

export default Sidebar;
