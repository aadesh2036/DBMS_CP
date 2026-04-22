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
  const [userActivity, setUserActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [reportLimit, setReportLimit] = useState(12);
  const [reportQuery, setReportQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      try {
        const [usersRes, postsRes, engagementRes, activityRes, allUsersRes] = await Promise.all([
          api.get("/analytics/top-users"),
          api.get("/analytics/top-posts"),
          api.get("/analytics/engagement"),
          api.get("/analytics/user-activity"),
          api.get("/users"),
        ]);

        if (!active) {
          return;
        }

        setTopUsers(usersRes.data);
        setTopPosts(postsRes.data);
        setEngagement(engagementRes.data);
        setUserActivity(activityRes.data);
        setUsers(allUsersRes.data);
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

  const totalUsers = users.length;
  const totalPosts = userActivity.reduce(
    (sum, user) => sum + (Number(user.post_count) || 0),
    0
  );
  const totalLikes = engagement.reduce(
    (sum, item) => sum + (Number(item.like_count) || 0),
    0
  );
  const totalComments = engagement.reduce(
    (sum, item) => sum + (Number(item.comment_count) || 0),
    0
  );
  const avgEngagement = totalPosts
    ? ((totalLikes + totalComments) / totalPosts).toFixed(1)
    : "0.0";

  const likeRatio = totalLikes + totalComments
    ? Math.round((totalLikes / (totalLikes + totalComments)) * 100)
    : 0;

  const followerMap = new Map(
    topUsers.map((entry) => [Number(entry.user_id), Number(entry.follower_count) || 0])
  );
  const activityMap = new Map(
    userActivity.map((entry) => [Number(entry.user_id), Number(entry.post_count) || 0])
  );

  const reportUsers = users
    .map((user) => {
      const postCount = activityMap.get(Number(user.user_id)) || 0;
      const followerCount = followerMap.get(Number(user.user_id)) || 0;
      return {
        ...user,
        post_count: postCount,
        follower_count: followerCount,
      };
    })
    .filter((user) => {
      const query = reportQuery.trim().toLowerCase();
      if (!query) {
        return true;
      }
      return (
        String(user.username || "").toLowerCase().includes(query) ||
        String(user.full_name || "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (b.post_count !== a.post_count) {
        return b.post_count - a.post_count;
      }
      return String(a.username).localeCompare(String(b.username));
    });

  const visibleReports = reportUsers.slice(0, reportLimit);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {loading ? <p className="muted">Loading analytics...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error ? (
        <div className="dashboard-grid">
          <div className="kpi-row">
            <StatCard title="Total Users" value={totalUsers} subtitle="Registered accounts" />
            <StatCard title="Total Posts" value={totalPosts} subtitle="Across all users" />
            <StatCard title="Total Interactions" value={totalLikes + totalComments} subtitle="Likes + comments" />
            <StatCard title="Avg Engagement" value={avgEngagement} subtitle="Per post" />
          </div>

          <div className="visual-grid">
            <div className="panel-card ratio-card">
              <h3>Interaction Mix</h3>
              <div
                className="donut"
                style={{
                  background: `conic-gradient(var(--brand-2) ${likeRatio}%, var(--brand-3) ${likeRatio}% 100%)`,
                }}
              >
                <span>{likeRatio}%</span>
              </div>
              <p className="muted">Like share of all interactions</p>
              <div className="ratio-legend">
                <span>Likes: {totalLikes}</span>
                <span>Comments: {totalComments}</span>
              </div>
            </div>

            <BarList
              title="Top Users by Followers"
              items={topUsers}
              labelKey="username"
              valueKey="follower_count"
              emptyText="No follower data yet."
            />

            <div className="panel-card highlight-grid-card">
              <h3>Engagement Highlights</h3>
              {engagement.length === 0 ? (
                <p className="muted">No engagement data yet.</p>
              ) : (
                <div className="highlight-grid">
                  {engagement.slice(0, 8).map((item) => (
                    <article key={item.post_id} className="highlight-item">
                      <p className="highlight-title">{truncateText(item.content, 52)}</p>
                      <div className="highlight-meta">
                        <span>{item.engagement} total</span>
                        <span>{item.like_count}L / {item.comment_count}C</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <BarList
              title="Top Posts by Likes"
              items={topPosts}
              labelKey="content"
              valueKey="like_count"
              emptyText="No post data yet."
            />
          </div>

          <BarList
            title="Posts Per User"
            items={userActivity.slice(0, 8)}
            labelKey="username"
            valueKey="post_count"
            emptyText="No activity data yet."
          />

          <div className="panel-card report-panel">
            <div className="report-head">
              <h3>User Reports (Card View)</h3>
              <input
                type="text"
                placeholder="Search username or name"
                value={reportQuery}
                onChange={(event) => setReportQuery(event.target.value)}
              />
            </div>
            {visibleReports.length === 0 ? (
              <p className="muted">No users match your search.</p>
            ) : (
              <div className="report-grid">
                {visibleReports.map((user) => (
                  <article key={user.user_id} className="report-card">
                    <div className="report-top">
                      <div>
                        <p className="report-name">{user.full_name || user.username}</p>
                        <p className="report-handle">@{user.username}</p>
                      </div>
                      <span className="report-pill">{user.post_count} posts</span>
                    </div>
                    <p className="report-bio">
                      {truncateText(user.bio || "No bio available.", 98)}
                    </p>
                    <div className="report-metrics">
                      <span>Followers: {user.follower_count}</span>
                      <span>Last login: {user.last_login ? "Active" : "Unknown"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {reportUsers.length > reportLimit ? (
              <button
                className="primary"
                onClick={() => setReportLimit((value) => value + 12)}
              >
                Load More Reports
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Dashboard;
