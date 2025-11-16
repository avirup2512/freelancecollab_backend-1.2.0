// utils/teamPermissionHelper.js
const db = require("../DB/db");

/**
 * Get a user's role in a team.
 */
async function getUserRoleInTeam(userId, teamId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT role FROM team_users WHERE user_id = ? AND team_id = ?";
    db.query(query, [userId, teamId], (err, results) => {
      if (err) return reject(err);
      if (!results.length) return resolve(null);
      resolve(results[0].role);
    });
  });
}

/**
 * Compare two roles by hierarchy.
 */
function hasHigherOrEqualRole(roleA, roleB) {
  const hierarchy = { viewer: 1, member: 2, admin: 3, owner: 4 };
  return hierarchy[roleA] >= hierarchy[roleB];
}

/**
 * Check if a user can perform an action requiring a minimum role.
 */
async function canPerformAction(userId, teamId, minRole) {
  const userRole = await getUserRoleInTeam(userId, teamId);
  if (!userRole) return false;
  return hasHigherOrEqualRole(userRole, minRole);
}

module.exports = {
  getUserRoleInTeam,
  hasHigherOrEqualRole,
  canPerformAction
};
