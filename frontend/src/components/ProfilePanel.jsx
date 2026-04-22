import { useEffect, useMemo, useState } from "react";
import api from "../api";

function ProfilePanel({ currentUser, refreshKey }) {
  const [stats, setStats] = useState({ follower_count: 0, following_count: 0 });
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsRes, usersRes, followingRes] = await Promise.all([
          api.get(`/users/${currentUser.user_id}/follow-stats`),
          api.get("/users"),
          api.get(`/users/${currentUser.user_id}/following`),
        ]);

        if (!active) {
          return;
        }

        setStats(statsRes.data || { follower_count: 0, following_count: 0 });
        setUsers(usersRes.data || []);
        setFollowingIds(
          new Set((followingRes.data || []).map((row) => row.user_id))
        );
      } catch (err) {
        if (!active) {
          return;
        }
        setError("Unable to load profile stats.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [currentUser, refreshKey]);

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.filter((user) => {
      if (!term) {
        return true;
      }
      return (
        String(user.username || "").toLowerCase().includes(term) ||
        String(user.full_name || "").toLowerCase().includes(term)
      );
    });
  }, [users, query]);

  const handleToggleFollow = async (targetId) => {
    if (!currentUser || busyUserId) {
      return;
    }
    if (Number(currentUser.user_id) === Number(targetId)) {
      setError("You cannot follow yourself.");
      return;
    }

    setBusyUserId(targetId);
    setError("");
    try {
      const response = await api.post("/follow-toggle", {
        follower_user_id: currentUser.user_id,
        followed_user_id: targetId,
      });

      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (response.data.following) {
          next.add(targetId);
        } else {
          next.delete(targetId);
        }
        return next;
      });

      if (response.data.following_stats) {
        setStats(response.data.following_stats);
      }
    } catch (err) {
      setError("Unable to update follow status.");
    } finally {
      setBusyUserId(null);
    }
  };

  if (!currentUser) {
    return (
      <div>
        <h2>Profile</h2>
        <p className="muted">Sign in to manage your followers.</p>
      </div>
    );
  }

  return (
    <div className="profile-panel">
      <div className="section-head">
        <div>
          <h2>Profile & Connections</h2>
          <p className="muted">Follower and following stats from DB view.</p>
        </div>
        <span className="pill">Role: {currentUser.role || "user"}</span>
      </div>

      <div className="stat-strip">
        <div>
          <p className="stat-label">Followers</p>
          <p className="stat-number">{stats.follower_count}</p>
        </div>
        <div>
          <p className="stat-label">Following</p>
          <p className="stat-number">{stats.following_count}</p>
        </div>
      </div>

      {loading ? <p className="muted">Loading profile...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="profile-actions">
        <label className="field">
          <span>Search people</span>
          <input
            type="text"
            placeholder="Search by name or username"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="people-grid">
        {visibleUsers.map((user) => {
          const isCurrent = Number(user.user_id) === Number(currentUser.user_id);
          const isFollowing = followingIds.has(user.user_id);
          return (
            <article key={user.user_id} className="people-card">
              <div>
                <p className="people-name">
                  {user.full_name || user.username}
                </p>
                <p className="muted">@{user.username}</p>
              </div>
              <button
                className={isFollowing ? "ghost active" : "ghost"}
                onClick={() => handleToggleFollow(user.user_id)}
                disabled={busyUserId === user.user_id || isCurrent}
              >
                {isCurrent
                  ? "You"
                  : isFollowing
                  ? "Unfollow"
                  : "Follow"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default ProfilePanel;
