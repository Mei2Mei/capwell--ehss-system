import Sidebar from "./Sidebar";
import "./Layout.css";
import React from "react";

function Layout({
  activePage,
  onNavigate,
  children,
  sidebarCollapsed,
  onSidebarToggle,
}) {
  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={sidebarCollapsed}
        onToggle={onSidebarToggle}
      />
      <main
        className={`layout-content ${sidebarCollapsed ? "layout-content-collapsed" : ""}`}
      >
        {React.cloneElement(children, { onNavigate })}
      </main>
    </div>
  );
}

export default Layout;
