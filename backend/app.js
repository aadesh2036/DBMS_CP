const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const interactionsRoutes = require("./routes/interactions");
const analyticsRoutes = require("./routes/analytics");
const simulateRoutes = require("./routes/simulate");
const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feed");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Social Media User Behavior Analysis API" });
});

app.use("/users", usersRoutes);
app.use("/posts", postsRoutes);
app.use("/", interactionsRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/", simulateRoutes);
app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);
app.use("/admin", adminRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
