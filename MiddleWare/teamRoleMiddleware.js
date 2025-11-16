// middleware/teamRoleMiddleware.js
const { canPerformAction } = require("../utils/teamPermissionHelper");

/**
 * Middleware to enforce role-based access.
 * Usage: requireRole('admin') means the user must be admin or higher.
 */
function requireRole(minRole) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // from JWT middleware
      const teamId = req.params.teamId || req.body.teamId;

      if (!teamId)
        return res.status(400).json({ success: false, message: "teamId required" });

      const allowed = await canPerformAction(userId, teamId, minRole);

      if (!allowed)
        return res.status(403).json({ success: false, message: "Access denied: insufficient team role" });

      next();
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
}

module.exports = { requireRole };
