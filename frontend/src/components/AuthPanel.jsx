import { useMemo, useState } from "react";
import api from "../api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordChecks(password) {
  return [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter", ok: /[a-z]/.test(password) },
    { label: "One number", ok: /\d/.test(password) },
    { label: "One special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

function AuthPanel({ currentUser, onAuthSuccess, onLogout }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    identifier: "",
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirm: "",
  });
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(
    () => getPasswordChecks(form.password),
    [form.password]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetStatus = () => {
    setStatus("");
    setErrors([]);
  };

  const validateLogin = () => {
    const nextErrors = [];
    if (!form.identifier.trim()) {
      nextErrors.push("Email or username is required.");
    }
    if (!form.password.trim()) {
      nextErrors.push("Password is required.");
    }
    return nextErrors;
  };

  const validateRegister = () => {
    const nextErrors = [];
    if (!form.username.trim()) {
      nextErrors.push("Username is required.");
    }
    if (!form.email.trim() || !emailPattern.test(form.email)) {
      nextErrors.push("Enter a valid email address.");
    }
    if (!form.password.trim()) {
      nextErrors.push("Password is required.");
    } else if (passwordChecks.some((check) => !check.ok)) {
      nextErrors.push("Password does not meet all requirements.");
    }
    if (form.password !== form.confirm) {
      nextErrors.push("Passwords do not match.");
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();

    const nextErrors =
      mode === "login" ? validateLogin() : validateRegister();
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const response = await api.post("/auth/login", {
          identifier: form.identifier.trim(),
          password: form.password,
        });
        onAuthSuccess(response.data);
        setStatus("Welcome back!");
      } else {
        const response = await api.post("/auth/register", {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          full_name: form.fullName.trim() || null,
        });
        onAuthSuccess(response.data);
        setStatus("Account created. You are now signed in.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        (mode === "login" ? "Login failed." : "Registration failed.");
      setErrors([message]);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="auth-panel">
        <div className="auth-summary">
          <div>
            <p className="auth-label">Signed in as</p>
            <p className="auth-name">{currentUser.full_name || currentUser.username}</p>
            <p className="auth-meta">@{currentUser.username}</p>
          </div>
          <span className="role-chip">{currentUser.role || "user"}</span>
        </div>
        <button className="ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-tabs">
        <button
          className={mode === "login" ? "tab active" : "tab"}
          onClick={() => {
            setMode("login");
            resetStatus();
          }}
          type="button"
        >
          Login
        </button>
        <button
          className={mode === "register" ? "tab active" : "tab"}
          onClick={() => {
            setMode("register");
            resetStatus();
          }}
          type="button"
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "login" ? (
          <>
            <label className="field">
              <span>Email or Username</span>
              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
              />
            </label>
          </>
        ) : (
          <>
            <label className="field">
              <span>Full Name</span>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Optional"
              />
            </label>
            <label className="field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="username"
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
            </label>
            <label className="field">
              <span>Confirm Password</span>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat password"
              />
            </label>
            <div className="password-hints">
              {passwordChecks.map((check) => (
                <span
                  key={check.label}
                  className={check.ok ? "hint ok" : "hint"}
                >
                  {check.label}
                </span>
              ))}
            </div>
          </>
        )}

        {errors.length > 0 ? (
          <div className="form-errors">
            {errors.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        ) : null}
        {status ? <p className="status">{status}</p> : null}

        <button className="primary" type="submit" disabled={loading}>
          {loading
            ? mode === "login"
              ? "Signing in..."
              : "Creating account..."
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>
      </form>
      <div className="auth-hint">
        <p className="muted">Admin demo: admin@example.com / Admin@123</p>
      </div>
    </div>
  );
}

export default AuthPanel;
