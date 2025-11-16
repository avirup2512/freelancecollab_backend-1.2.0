// models/team.member.model.js
const pool = require('../DB/db');

/**
 * Simple promise wrapper for pool.query
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });
}

const TeamMemberModel = {
  /**
   * Get all members of a team with basic user info
   * returns array of { user_id, role, first_name, last_name, email, added_at }
   */
  getTeamMembers: (teamId) =>
    query(
      `SELECT tm.user_id, tm.role, tm.added_at, u.first_name, u.last_name, u.email
       FROM team_members tm
       LEFT JOIN user u ON u.id = tm.user_id
       WHERE tm.team_id = ?`,
      [teamId]
    ),

  /**
   * Get role string of a user in a team (owner|admin|member|viewer) or null if not member
   */
  getMemberRole: async (teamId, userId) => {
    const rows = await query(`SELECT role FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1`, [teamId, userId]);
    return rows.length ? rows[0].role : null;
  },

  /**
   * Add member to team. If already exists, updates role (upsert).
   * role: string (owner|admin|member|viewer)
   */
  addMember: (teamId, userId, role = 'member') =>
    query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role = VALUES(role), added_at = VALUES(added_at)`,
      [teamId, userId, role]
    ),

  /**
   * Remove member from team
   */
  removeMember: (teamId, userId) =>
    query(`DELETE FROM team_members WHERE team_id = ? AND user_id = ?`, [teamId, userId]),

  /**
   * Change role of a member (returns result)
   */
  changeMemberRole: (teamId, userId, role) =>
    query(`UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?`, [role, teamId, userId]),

  /**
   * Quick existence check
   */
  isMember: async (teamId, userId) => {
    const rows = await query(`SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1`, [teamId, userId]);
    return rows.length > 0;
  },

  /**
   * List teams where a user is a member (optional role filter)
   * returns array of { team_id, role, team_name (if teams table exists) }
   */
  listTeamsForUser: (userId, role = null) => {
    const params = [userId];
    let sql = `SELECT tm.team_id, tm.role, t.name as team_name
               FROM team_members tm
               LEFT JOIN teams t ON t.id = tm.team_id
               WHERE tm.user_id = ?`;
    if (role) {
      sql += ` AND tm.role = ?`;
      params.push(role);
    }
    return query(sql, params);
  },

  /**
   * Utility: remove all members of a team (used when deleting a team)
   */
  removeAllMembersOfTeam: (teamId) =>
    query(`DELETE FROM team_members WHERE team_id = ?`, [teamId]),
};

module.exports = TeamMemberModel;
