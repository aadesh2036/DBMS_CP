import { useEffect, useState } from "react";
import api from "../api";
import BarList from "../components/BarList.jsx";
import StatCard from "../components/StatCard.jsx";

function truncateText(text, maxLength) {
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}...`;
}

function Dashboard({ refreshKey }) {
  const [topUsers, setTopUsers] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [engagement, setEngagement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const [usersRes, postsRes, engagementRes] = await Promise.all([
          api.get("/analytics/top-users"),
          api.get("/analytics/top-posts"),
          api.get("/analytics/engagement"),
        ]);

        if (!active) {
          return;
        }

        setTopUsers(usersRes.data);
        setTopPosts(postsRes.data);
        setEngagement(engagementRes.data);
      } catch (err) {
        if (!active) {
          return;
        }
        setError("Failed to load analytics. Check backend connection.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {loading ? <p className="muted">Loading analytics...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error ? (
        <div className="dashboard-grid">
          <BarList
            title="Top Users by Followers"
            items={topUsers}
            labelKey="username"
            valueKey="follower_count"
            emptyText="No follower data yet."
          />
          <BarList
            title="Top Posts by Likes"
            items={topPosts}
            labelKey="content"
            valueKey="like_count"
            emptyText="No post data yet."
          />
          <div className="panel-card">
            <h3>Engagement Highlights</h3>
            {engagement.length === 0 ? (
              <p className="muted">No engagement data yet.</p>
            ) : (
              <div className="card-stack">
                {engagement.slice(0, 5).map((item) => (
                  <StatCard
                    key={item.post_id}
                    title={truncateText(item.content, 46)}
                    value={item.engagement}
                    subtitle={`${item.like_count} likes - ${item.comment_count} comments`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Dashboard;
