import { useState } from "react";
import api from "../api";

function SimulationPanel({ onSimulated }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setStatus("");

    try {
      const response = await api.post("/simulate-data");
      const inserted = response.data.inserted || {};
      setStatus(
        `Success: ${inserted.users || 0} users, ${inserted.posts || 0} posts, ${
          inserted.comments || 0
        } comments, ${inserted.likes || 0} likes, ${
          inserted.followers || 0
        } followers.`
      );
      if (onSimulated) {
        onSimulated();
      }
    } catch (error) {
      setStatus("Simulation failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Data Simulation</h2>
      <p className="muted">
        Generate realistic sample activity and refresh analytics.
      </p>
      <button className="primary" onClick={handleSimulate} disabled={loading}>
        {loading ? "Simulating..." : "Simulate Data"}
      </button>
      {status ? <p className="status">{status}</p> : null}
      <div className="hint">
        <h4>What happens</h4>
        <p className="muted">
          The server creates random users, posts, comments, likes, and followers
          with timestamps, then updates the dashboard.
        </p>
      </div>
    </div>
  );
}

export default SimulationPanel;
