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

import { useState } from "react";
import Layout from "./components/Layout/Layout";

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
  const [activePage, setActivePage] = useState("dashboard");

  // Returns the correct page component based on activePage
  function renderPage() {
    switch (activePage) {
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
        return <DashboardPage />;
    }
  }

  return (
    // Layout wraps everything — sidebar + content
    // activePage tells the sidebar which item to highlight
    // setActivePage is called when user clicks a nav item
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
