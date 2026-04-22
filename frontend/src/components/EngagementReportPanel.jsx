import { useMemo, useState } from "react";
import api from "../api";

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function EngagementReportPanel() {
  const today = useMemo(() => new Date(), []);
  const initialStart = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() - 6);
    return value;
  }, []);

  const [startDate, setStartDate] = useState(formatDateInput(initialStart));
  const [endDate, setEndDate] = useState(formatDateInput(today));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.likes += toNumber(row.like_count);
        acc.comments += toNumber(row.comment_count);
        return acc;
      },
      { likes: 0, comments: 0 }
    );
  }, [rows]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/analytics/engagement-report", {
        params: { start: startDate, end: endDate },
      });
      setRows(response.data || []);
    } catch (err) {
      setError("Failed to load engagement report.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (rows.length === 0) {
      return;
    }
    const header = ["date", "post_id", "content", "likes", "comments", "total"];
    const lines = rows.map((row) => {
      const total = toNumber(row.like_count) + toNumber(row.comment_count);
      const safeContent = String(row.content || "").replace(/"/g, '""');
      return [
        row.activity_date,
        row.post_id,
        `"${safeContent}"`,
        row.like_count,
        row.comment_count,
        total,
      ].join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `engagement_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-panel">
      <div className="section-head">
        <div>
          <h2>Engagement Report</h2>
          <p className="muted">
            Date-wise breakdown of likes and comments per post.
          </p>
        </div>
        <div className="summary-chip">
          <span>{totals.likes + totals.comments} interactions</span>
        </div>
      </div>

      <div className="report-filters">
        <label className="field">
          <span>Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label className="field">
          <span>End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <button className="primary" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>
        <button className="ghost" onClick={handleExport} disabled={!rows.length}>
          Export CSV
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {rows.length === 0 && !loading ? (
        <p className="muted">No engagement data for this range.</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Post</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.post_id}-${row.activity_date}`}>
                  <td>{row.activity_date}</td>
                  <td>
                    <div className="table-title">#{row.post_id}</div>
                    <span className="muted">{row.content}</span>
                  </td>
                  <td>{row.like_count}</td>
                  <td>{row.comment_count}</td>
                  <td>{toNumber(row.like_count) + toNumber(row.comment_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default EngagementReportPanel;
