// models/teamInvite.model.js
const pool = require('../DB/db');

function query(q, params = []) {
  return new Promise((res, rej) => {
    pool.query(q, params, (err, results) => (err ? rej(err) : res(results)));
  });
}

const TeamInviteModel = {
  insertInvite: (invite) =>
    query(
      `INSERT INTO team_invites (team_id, inviter_id, invitee_email, role, tokenHash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invite.team_id, invite.inviter_id, invite.invitee_email.toLowerCase(), invite.role, invite.tokenHash, invite.expires_at]
    ),

  findById: (id) => query(`SELECT * FROM team_invites WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  findByTeamAndEmailActive: (teamId, email) =>
    query(
      `SELECT * FROM team_invites WHERE team_id = ? AND invitee_email = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
      [teamId, email.toLowerCase()]
    ).then(r => r[0] || null),

  markUsed: (id) => query(`UPDATE team_invites SET used = 1 WHERE id = ?`, [id]),

  revokeInvite: (id) => query(`UPDATE team_invites SET used = 1 WHERE id = ?`, [id]),

  listByTeam: (teamId) => query(`SELECT * FROM team_invites WHERE team_id = ? ORDER BY created_at DESC`, [teamId]),

  findByTokenUnexpired: (id, token) =>
    // We will fetch by id then compare hash in service; this keeps SQL simple
    query(`SELECT * FROM team_invites WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),
};

module.exports = TeamInviteModel;
