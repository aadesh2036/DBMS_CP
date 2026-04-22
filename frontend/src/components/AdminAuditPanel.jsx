import { useEffect, useState } from "react";
import api from "../api";

function formatDate(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleString();
}

function AdminAuditPanel({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      return;
    }

    let active = true;
    const loadLogs = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/audit-log", {
          params: { limit: 60 },
        });
        if (active) {
          setLogs(response.data || []);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load audit log.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      active = false;
    };
  }, [currentUser]);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div>
        <h2>Admin Audit Log</h2>
        <p className="muted">Admin access required to view trigger logs.</p>
      </div>
    );
  }

  return (
    <div className="audit-panel">
      <div className="section-head">
        <div>
          <h2>Admin Audit Log</h2>
          <p className="muted">Verify trigger activity across the system.</p>
        </div>
        <span className="pill">{logs.length} events</span>
      </div>

      {loading ? <p className="muted">Loading audit log...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {logs.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Entity</th>
                <th>Actor</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.log_id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td>{log.event_type}</td>
                  <td>
                    {log.entity_type} #{log.entity_id}
                  </td>
                  <td>{log.username || "System"}</td>
                  <td>{log.details || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default AdminAuditPanel;
