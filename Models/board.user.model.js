const connection = require("../DB/db");
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

class BoardUserModel {

    static assignUser(boardId, userId, roleId) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO board_users (board_id, user_id, role_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
            `;
            query(sql, [boardId, userId, roleId]).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

    static getMappedBoardRole(teamRoleId) {
        return new Promise((resolve, reject) => {
            const sql =
                "SELECT board_role_id FROM board_team_role_map WHERE team_role_id=?";
            query(sql, [teamRoleId]).then(rows => {
                resolve(rows.length ? rows[0].board_role_id : null);
            }).catch(err => {
                reject(err);
            });
        });
    }

    static removeUser(boardId, userId) {
        return new Promise((resolve, reject) => {
            query(
                "DELETE FROM board_users WHERE board_id=? AND user_id=?",
                [boardId, userId]
            ).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }
}

module.exports = BoardUserModel;
