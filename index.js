require('dotenv-flow').config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const initTables = require("./DB/initTable");
// MySQL DB connection initializer
// require("../src/db/connection");

const app = express();

// -------------------------
// MIDDLEWARES
// -------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Rate Limiters
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many login attempts. Try again later."
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: "Too many reset attempts. Try again later."
});

// -------------------------
// ROUTES IMPORT
// -------------------------

// AUTH / USER MODULE
const authRoutes = require("./Routes/user.routes");
const userRoutes = require("./Routes/user.routes");

// TEAM MODULE
const teamRoutes = require("./Routes/team.routes");
const teamInviteRoutes = require("./Routes/team.routes");
const teamRoleRoutes = require("./Routes/team.routes");

// CLIENT MODULE
const clientRoutes = require("./Routes/client.routes");

// PROJECT MODULE
const projectRoutes = require("./Routes/project.routes");

// BOARD MODULE
const boardRoutes = require("./Routes/board.routes");

// LIST MODULE
const listRoutes = require("./Routes/list.routes");
const listTemplateRoutes = require("./Routes/listTemplate.routes");
const listStateRoutes = require("./Routes/list.routes");

// CATEGORY MODULE
const categoryRoutes = require("./Routes/category.routes");
// CARD MODULE (if required)
// const cardRoutes = require("./Routes/card.routes");

// -------------------------
// ROUTER MOUNTING
// -------------------------

// Auth
// app.use("/auth", loginLimiter, authRoutes);
app.use("/auth", authRoutes);
app.use("/auth", forgotPasswordLimiter, authRoutes);

// User
app.use("/users", userRoutes);

// Team
app.use("/teams", teamRoutes);
app.use("/team-invite", teamInviteRoutes);
app.use("/team-role", teamRoleRoutes);

// Client
app.use("/client", clientRoutes);

// Project
app.use("/project", projectRoutes);

// Board
app.use("/board", boardRoutes);

// List
app.use("/list", listRoutes);

// List Templates
app.use("/template", listTemplateRoutes);

// Per-user list collapsed state
app.use("/list-state", listStateRoutes);

// Category
app.use("/category", categoryRoutes);
// Cards
// app.use("/card", cardRoutes);

// -------------------------
// STATIC FILES IF NEEDED
// -------------------------
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// -------------------------
// GLOBAL 404 HANDLER
// -------------------------
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: "Route not found"
    });
});

// -------------------------
// GLOBAL ERROR HANDLER
// -------------------------
app.use((err, req, res, next) => {
    console.error("🔥 GLOBAL ERROR:", err);

    res.status(500).json({
        status: false,
        error: err.message || "Internal Server Error"
    });
});

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 4200;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Initialize tables only once on startup (optional - tables already exist with IF NOT EXISTS)
if (process.env.INIT_TABLES) {
    initTables().catch(err => {
        console.error("Failed to initialize tables:", err);
        process.exit(1);
    });
}

module.exports = app;
