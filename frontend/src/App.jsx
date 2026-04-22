import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import SimulationPanel from "./components/SimulationPanel.jsx";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSimulated = () => {
    setRefreshKey((value) => value + 1);
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
      <main className="app-grid">
        <section className="panel">
          <Dashboard refreshKey={refreshKey} />
        </section>
        <section className="panel">
          <SimulationPanel onSimulated={handleSimulated} />
        </section>
      </main>
    </div>
  );
}

export default App;
