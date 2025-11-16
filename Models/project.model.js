// models/project.model.js
const pool = require('../DB/db');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });
}

// Helper to run transactional work using a connection
function withTransaction(work) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.beginTransaction(async (txErr) => {
        if (txErr) {
          conn.release();
          return reject(txErr);
        }
        try {
          const result = await work(conn);
          conn.commit((cErr) => {
            if (cErr) {
              conn.rollback(() => conn.release());
              return reject(cErr);
            }
            conn.release();
            resolve(result);
          });
        } catch (workErr) {
          conn.rollback(() => conn.release());
          reject(workErr);
        }
      });
    });
  });
}

const ProjectModel = {
  // CRUD on project
  createProject: (project) =>
    query(`INSERT INTO project (name, description, user_id, is_public) VALUES (?, ?, ?, ?)`, [
      project.name,
      project.description || null,
      project.user_id,
      project.is_public ? 1 : 0,
    ]),

  updateProject: (projectId, data) =>
    query(
      `UPDATE project SET name = COALESCE(?, name), description = COALESCE(?, description), is_public = COALESCE(?, is_public) WHERE id = ?`,
      [data.name, data.description, typeof data.is_public === 'boolean' ? (data.is_public ? 1 : 0) : null, projectId]
    ),

  setArchiveFlag: (projectId, flag = 1) => query(`UPDATE project SET is_archived = ? WHERE id = ?`, [flag ? 1 : 0, projectId]),

  deleteProject: (projectId) => query(`DELETE FROM project WHERE id = ?`, [projectId]),

  getProjectById: (projectId) =>
    query(`SELECT * FROM project WHERE id = ? LIMIT 1`, [projectId]).then((r) => r[0] || null),

  // project_user operations
  addUserToProject: (projectId, userId, roleId = null, isDefault = 0, conn = null) => {
    const sql = `INSERT INTO project_user (user_id, project_id, role_id, is_default) VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`;
    if (!conn) return query(sql, [userId, projectId, roleId, isDefault]);
    return new Promise((res, rej) => {
      conn.query(sql, [userId, projectId, roleId, isDefault], (err, r) => (err ? rej(err) : res(r)));
    });
  },

  addUsersToProjectBulk: (projectId, userIds = [], roleId = null, conn = null) => {
    if (!userIds || !userIds.length) return Promise.resolve();
    const values = userIds.map((uid) => [uid, projectId, roleId, 0]);
    const sql = `INSERT INTO project_user (user_id, project_id, role_id, is_default) VALUES ? 
                 ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`;
    if (!conn) return query(sql, [values]);
    return new Promise((res, rej) => {
      conn.query(sql, [values], (err, r) => (err ? rej(err) : res(r)));
    });
  },

  changeUserRoleInProject: (projectId, userId, roleId) =>
    query(`UPDATE project_user SET role_id = ? WHERE project_id = ? AND user_id = ?`, [roleId, projectId, userId]),

  removeUserFromProject: (projectId, userId) =>
    query(`DELETE FROM project_user WHERE project_id = ? AND user_id = ?`, [projectId, userId]),

  // project_board linking
  addBoardToProject: (projectId, boardId, conn = null) => {
    const sql = `INSERT INTO project_board (project_id, board_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE board_id = VALUES(board_id)`;
    if (!conn) return query(sql, [projectId, boardId]);
    return new Promise((res, rej) => {
      conn.query(sql, [projectId, boardId], (err, r) => (err ? rej(err) : res(r)));
    });
  },

  removeBoardFromProject: (projectId, boardId) =>
    query(`DELETE FROM project_board WHERE project_id = ? AND board_id = ?`, [projectId, boardId]),

  // project_team linking
  assignTeamToProject: (projectId, teamId, conn = null) => {
    const sql = `INSERT INTO project_team (project_id, team_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE team_id = VALUES(team_id)`;
    if (!conn) return query(sql, [projectId, teamId]);
    return new Promise((res, rej) => {
      conn.query(sql, [projectId, teamId], (err, r) => (err ? rej(err) : res(r)));
    });
  },

  removeTeamFromProject: (projectId, teamId) =>
    query(`DELETE FROM project_team WHERE project_id = ? AND team_id = ?`, [projectId, teamId]),

  // client assignment
  addClientToProject: (projectId, clientId) =>
    query(`INSERT INTO client_projects (client_id, project_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE client_id = VALUES(client_id)`, [
      clientId,
      projectId,
    ]),

  removeClientFromProject: (projectId, clientId) => query(`DELETE FROM client_projects WHERE project_id = ? AND client_id = ?`, [projectId, clientId]),

  // pagination: active/archived projects with boards joined
  getProjectsWithBoardsPaginated: (isArchived = 0, offset = 0, limit = 20) =>
    query(
      `SELECT p.*, 
              (SELECT COUNT(*) FROM project_board pb WHERE pb.project_id = p.id) AS board_count,
              (SELECT JSON_ARRAYAGG(JSON_OBJECT('board_id', b.id, 'board_name', b.name)) FROM project_board pb JOIN board b ON b.id = pb.board_id WHERE pb.project_id = p.id) AS boards
       FROM project p
       WHERE p.is_archived = ? AND p.is_deleted = 0
       ORDER BY p.created_date DESC
       LIMIT ? OFFSET ?`,
      [isArchived ? 1 : 0, parseInt(limit, 10), parseInt(offset, 10)]
    ),

  // helper to get team members of a team (used in service)
  getTeamMembers: (teamId) =>
    query(
      `SELECT tm.user_id, tm.role as team_role, u.first_name, u.last_name, u.email
       FROM team_members tm
       JOIN user u ON u.id = tm.user_id
       WHERE tm.team_id = ?`,
      [teamId]
    ),

  // helper to add multiple project_users from team members (bulk)
  addProjectUsersBulkUsingConn: (projectId, membersArray = [], conn) => {
    // membersArray = [{user_id, role_id (nullable)}]
    if (!membersArray.length) return Promise.resolve();
    const values = membersArray.map((m) => [m.user_id, projectId, m.role_id || null, 0]);
    const sql = `INSERT INTO project_user (user_id, project_id, role_id, is_default) VALUES ? ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`;
    return new Promise((res, rej) => {
      conn.query(sql, [values], (err, r) => (err ? rej(err) : res(r)));
    });
  },

  withTransaction,
};

module.exports = ProjectModel;
