// ─────────────────────────────────────────────────────────────
// App.jsx
// The root of the EHSS application.
// Controls which page is shown based on what the user clicks
// in the sidebar navigation.
//
// How navigation works:
// - "activePage" stores which page is currently showing
// - When the user clicks a sidebar item, setActivePage updates
// - The renderPage function returns the correct page component
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/Login/LoginPage";

// Import all pages
import DashboardPage from "./pages/Dashboard/DashboardPage";
import SafetyPage from "./pages/Safety/SafetyPage";
import CostsPage from "./pages/Costs/CostsPage";
import CompliancePage from "./pages/Compliance/CompliancePage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import EquipmentPage from "./pages/Equipment/EquipmentPage";
import PPEPage from "./pages/PPE/PPEPage";
import SustainabilityPage from "./pages/Sustainability/SustainabilityPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import ActionTrackerPage from "./pages/ActionTracker/ActionTrackerPage";

function App() {
  // Track which page is active — starts on dashboard
  const { user, loading } = useAuth();
  // Set default page based on role
  const getDefaultPage = (role) => {
    switch (role) {
      case "storekeeper":
      case "supervisor":
      case "production_manager":
        return "ppe";
      case "qa":
        return "compliance";
      default:
        return "dashboard";
    }
  };

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (user) {
      setActivePage(getDefaultPage(user.role_name));
    }
  }, [user?.role_name]);

  if (loading) return <div style={{ padding: "28px" }}>Loading...</div>;

  if (!user) return <LoginPage />;

  // Returns the correct page component based on activePage
  const allowedPages = {
    ehss_officer: [
      "dashboard",
      "safety",
      "costs",
      "compliance",
      "calendar",
      "equipment",
      "ppe",
      "sustainability",
      "action-tracker",
      "reports",
    ],
    it_admin: [
      "dashboard",
      "safety",
      "costs",
      "compliance",
      "calendar",
      "equipment",
      "ppe",
      "sustainability",
      "action-tracker",
      "reports",
    ],
    qa: ["compliance", "action-tracker"],
    storekeeper: ["ppe", "action-tracker"],
    supervisor: ["ppe", "action-tracker"],
    production_manager: ["ppe", "action-tracker"],
  };

  function renderPage() {
    const allowed = allowedPages[user?.role_name] || ["dashboard"];
    const page = allowed.includes(activePage) ? activePage : allowed[0];

    switch (page) {
      case "dashboard":
        return <DashboardPage />;
      case "safety":
        return <SafetyPage />;
      case "costs":
        return <CostsPage />;
      case "compliance":
        return <CompliancePage />;
      case "calendar":
        return <CalendarPage />;
      case "equipment":
        return <EquipmentPage />;
      case "ppe":
        return <PPEPage />;
      case "sustainability":
        return <SustainabilityPage />;
      case "reports":
        return <ReportsPage />;
      case "action-tracker":
        return <ActionTrackerPage />;
      default:
        return <PPEPage />;
    }
  }

  return (
    // Layout wraps everything — sidebar + content
    // activePage tells the sidebar which item to highlight
    // setActivePage is called when user clicks a nav item
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
