import { useEffect, useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import SimulationPanel from "./components/SimulationPanel.jsx";
import AuthPanel from "./components/AuthPanel.jsx";
import FeedPanel from "./components/FeedPanel.jsx";
import EngagementReportPanel from "./components/EngagementReportPanel.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import AdminAuditPanel from "./components/AdminAuditPanel.jsx";

const NAV_ITEMS = [
  { key: "overview", label: "Overview" },
  { key: "feed", label: "Feed" },
  { key: "report", label: "Engagement" },
  { key: "profile", label: "Profile" },
  { key: "admin", label: "Admin", role: "admin" },
];

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("pulse_user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("pulse_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("pulse_user");
    }
  }, [currentUser]);

  const navItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.role || item.role === currentUser?.role),
    [currentUser]
  );

  const handleSimulated = () => {
    setRefreshKey((value) => value + 1);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveView("overview");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView("overview");
  };

  const renderMain = () => {
    switch (activeView) {
      case "feed":
        return <FeedPanel currentUser={currentUser} refreshKey={refreshKey} />;
      case "report":
        return <EngagementReportPanel />;
      case "profile":
        return <ProfilePanel currentUser={currentUser} refreshKey={refreshKey} />;
      case "admin":
        return <AdminAuditPanel currentUser={currentUser} />;
      case "overview":
      default:
        return <Dashboard refreshKey={refreshKey} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="hero-copy">
          <p className="eyebrow">Social Media User Behavior Analysis</p>
          <h1>PulseScope Dashboard</h1>
          <p className="subtitle">
            Multi-visual analytics for user growth, engagement quality, and activity distribution.
          </p>
        </div>
        <div className="hero-chip">Live data story</div>
      </header>

      <nav className="nav-bar">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={
              activeView === item.key ? "nav-button active" : "nav-button"
            }
            onClick={() => setActiveView(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="app-grid">
        <section className="panel main-panel">{renderMain()}</section>
        <aside className="panel side-panel">
          <AuthPanel
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
          />
          {activeView === "overview" ? (
            <SimulationPanel onSimulated={handleSimulated} />
          ) : (
            <div className="side-note">
              <h4>Quick Tip</h4>
              <p className="muted">
                Refresh analytics by running a new simulation from the Overview.
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
