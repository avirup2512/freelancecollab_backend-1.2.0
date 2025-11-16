const db = require("../config/db");

class ProjectUserModel {

    static async assignUser(projectId, userId, roleId) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO project_users (project_id, user_id, role_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
            `;
            db.query(sql, [projectId, userId, roleId], (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    static async getMappedProjectRole(teamRoleId) {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT project_role_id FROM project_team_role_map WHERE team_role_id=?",
                [teamRoleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows.length ? rows[0].project_role_id : null);
                }
            );
        });
    }
}

module.exports = ProjectUserModel;
