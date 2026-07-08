import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/Login/LoginPage";

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
import UserManagementPage from "./pages/UserManagement/UserManagementPage";
import PublicActionPortalPage from "./pages/PublicActionPortal/PublicActionPortalPage";
import PublicPPEMatrix from "./pages/PublicPPEMatrix/PublicPPEMatrix";
import AuditLogsPage from "./pages/AuditLogs/AuditLogsPage";

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
    "public-actions",
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
    "users",
    "audit-logs",
    "public-actions",
  ],
  qa: ["compliance", "ppe", "action-tracker"],
  storekeeper: ["ppe", "action-tracker"],
  supervisor: ["ppe", "action-tracker"],
  production_manager: ["ppe", "action-tracker"],
};

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

function MainApp() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (user) setActivePage(getDefaultPage(user.role_name));
  }, [user?.role_name]);

  if (loading) return <div style={{ padding: "28px" }}>Loading...</div>;
  if (!user) return <LoginPage />;

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
      case "users":
        return <UserManagementPage />;
      case "audit-logs":
        return <AuditLogsPage />;
      case "public-actions":
        return <PublicActionPortalPage />;
      default:
        return <PPEPage />;
    }
  }

  return (
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

function App() {
  return (
    <Routes>
      <Route path="/public/actions" element={<PublicActionPortalPage />} />
      <Route path="/public/ppe-matrix" element={<PublicPPEMatrix />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

export default App;
