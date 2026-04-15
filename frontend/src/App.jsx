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
        <div>
          <p className="eyebrow">Social Media User Behavior Analysis</p>
          <h1>Insights Dashboard</h1>
          <p className="subtitle">
            Track followers, likes, and engagement in one place.
          </p>
        </div>
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
