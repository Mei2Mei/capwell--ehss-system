// ─────────────────────────────────────────────────────────────
// Layout.jsx
// This component wraps every page with the sidebar on the left
// and the page content on the right.
//
// Think of it like a picture frame — the frame (Layout) stays
// the same, only the picture inside (the page) changes.
// ─────────────────────────────────────────────────────────────

import Sidebar from "./Sidebar";
import "./Layout.css";
import React from "react";

function Layout({ activePage, onNavigate, children }) {
  return (
    <div className="layout">

      {/* Sidebar — always visible on the left */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Main content area — the actual page goes here */}
      {/* "children" means whatever page is passed between
          the Layout tags in App.jsx */}
      <main className="layout-content">
        {React.cloneElement(children, { onNavigate })}
      </main>

    </div>
  );
}

export default Layout;
