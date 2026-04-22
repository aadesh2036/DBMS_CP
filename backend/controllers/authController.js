const crypto = require("crypto");
const authModel = require("../models/authModel");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "identifier and password are required" });
    }

    const user = await authModel.findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const hashed = hashPassword(password);
    if (hashed !== user.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await authModel.updateLastLogin(user.user_id);

    return res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
}

async function register(req, res) {
  try {
    const { username, email, password, full_name } = req.body || {};
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email, and password are required" });
    }

    const password_hash = hashPassword(password);
    const user = await authModel.createUser({
      username,
      email,
      password_hash,
      full_name,
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }
    return res.status(500).json({ error: "Registration failed" });
  }
}

module.exports = { login, register };
