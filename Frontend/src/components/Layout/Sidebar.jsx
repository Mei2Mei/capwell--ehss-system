// ─────────────────────────────────────────────────────────────
// Sidebar.jsx
// The left navigation menu that appears on every page.
// It shows all the modules the user can navigate to.
// The active page is highlighted in navy blue.
// ─────────────────────────────────────────────────────────────

import "./Sidebar.css";

// Each nav item has:
// - id: unique identifier
// - label: what the user sees
// - icon: an emoji used as a simple icon
function Sidebar({ activePage, onNavigate }) {
  // This is the full list of navigation items.
  // Later when we add more pages we just add them here.
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
    <div className="sidebar">
      {/* System logo / name at the top of sidebar */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        <div className="sidebar-logo-text">
          <div
            className="sidebar-logo-title"
            title="Environment, Health, Safety and Sustainability"
          >
            EHSS
          </div>
          <div className="sidebar-logo-sub">Management System</div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            // Add "active" class to the currently selected page
            className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User info at the bottom of sidebar */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">LN</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Linda</div>
            <div className="sidebar-user-role">EHSS Officer</div>
          </div>
        </div>
        <button className="sidebar-logout">Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;
