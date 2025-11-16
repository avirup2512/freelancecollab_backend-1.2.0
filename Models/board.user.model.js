const db = require("../DB/db");

class BoardUserModel {

    static assignUser(boardId, userId, roleId) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO board_users (board_id, user_id, role_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
            `;
            db.query(sql, [boardId, userId, roleId], (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    static getMappedBoardRole(teamRoleId) {
        return new Promise((resolve, reject) => {
            const sql =
                "SELECT board_role_id FROM board_team_role_map WHERE team_role_id=?";
            db.query(sql, [teamRoleId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.length ? rows[0].board_role_id : null);
            });
        });
    }

    static removeUser(boardId, userId) {
        return new Promise((resolve, reject) => {
            db.query(
                "DELETE FROM board_users WHERE board_id=? AND user_id=?",
                [boardId, userId],
                (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                }
            );
        });
    }
}

module.exports = BoardUserModel;
