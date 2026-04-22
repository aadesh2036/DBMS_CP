import { useEffect, useState } from "react";
import api from "../api";

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return date.toLocaleString();
}

function FeedPanel({ currentUser, refreshKey }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyPostId, setBusyPostId] = useState(null);

  useEffect(() => {
    setItems([]);
    setPage(1);
  }, [currentUser, refreshKey]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let active = true;
    const loadFeed = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/feed", {
          params: {
            user_id: currentUser.user_id,
            page,
            limit: 6,
          },
        });
        if (!active) {
          return;
        }
        setItems((prev) =>
          page === 1 ? response.data.items : prev.concat(response.data.items)
        );
        setHasMore(Boolean(response.data.hasMore));
      } catch (err) {
        if (!active) {
          return;
        }
        setError("Unable to load the feed. Check backend connection.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      active = false;
    };
  }, [currentUser, page, refreshKey]);

  const handleToggleLike = async (postId) => {
    if (!currentUser || busyPostId) {
      return;
    }
    setBusyPostId(postId);
    try {
      const response = await api.post("/like-toggle", {
        user_id: currentUser.user_id,
        post_id: postId,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.post_id === postId
            ? {
                ...item,
                like_count: response.data.like_count,
                liked_by_me: response.data.liked,
              }
            : item
        )
      );
    } catch (err) {
      setError("Unable to update likes right now.");
    } finally {
      setBusyPostId(null);
    }
  };

  if (!currentUser) {
    return (
      <div>
        <h2>Post Feed</h2>
        <p className="muted">Sign in to see posts from people you follow.</p>
      </div>
    );
  }

  return (
    <div className="feed-panel">
      <div className="section-head">
        <div>
          <h2>Post Feed</h2>
          <p className="muted">Latest posts from your network.</p>
        </div>
        <span className="pill">User #{currentUser.user_id}</span>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {items.length === 0 && !loading ? (
        <p className="muted">No posts available yet.</p>
      ) : null}
      <div className="feed-grid">
        {items.map((post) => (
          <article key={post.post_id} className="feed-card">
            <div className="feed-meta">
              <div>
                <p className="feed-author">@{post.username}</p>
                <p className="feed-date">{formatDate(post.created_at)}</p>
              </div>
              <span className="badge">Post #{post.post_id}</span>
            </div>
            <p className="feed-content">{post.content}</p>
            <div className="feed-actions">
              <button
                className={post.liked_by_me ? "ghost active" : "ghost"}
                onClick={() => handleToggleLike(post.post_id)}
                disabled={busyPostId === post.post_id}
              >
                {post.liked_by_me ? "Unlike" : "Like"} ({post.like_count})
              </button>
              <span className="muted">Comments: {post.comment_count}</span>
            </div>
          </article>
        ))}
      </div>
      {loading ? <p className="muted">Loading feed...</p> : null}
      {hasMore && !loading ? (
        <button className="primary" onClick={() => setPage((p) => p + 1)}>
          Load more
        </button>
      ) : null}
    </div>
  );
}

export default FeedPanel;
