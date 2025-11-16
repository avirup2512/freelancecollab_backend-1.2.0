const db = require("../DB/db");

class BoardModel {

    static createBoard({ project_id, name, description, created_by }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO boards (project_id, board_name, description, created_by)
                VALUES (?, ?, ?, ?)
            `;
            db.query(sql, [project_id, name, description, created_by], (err, res) => {
                if (err) return reject(err);
                resolve({ boardId: res.insertId });
            });
        });
    }

    static updateBoard(boardId, data) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE boards SET board_name = ?, description = ?
                WHERE id = ?
            `;
            db.query(sql, [data.name, data.description, boardId], (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    static archiveBoard(boardId, archiveStatus) {
        return new Promise((resolve, reject) => {
            db.query(
                "UPDATE boards SET is_archived=? WHERE id=?",
                [archiveStatus, boardId],
                (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                }
            );
        });
    }

    static deleteBoard(boardId) {
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM boards WHERE id=?", [boardId], (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    static getBoardWithLists(boardId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    b.id AS board_id,
                    b.board_name,
                    b.description,
                    b.is_archived,
                    l.id AS list_id,
                    l.list_name,
                    l.position
                FROM boards b
                LEFT JOIN lists l ON b.id = l.board_id
                WHERE b.id = ?
                ORDER BY l.position ASC
            `;

            db.query(sql, [boardId], (err, rows) => {
                if (err) return reject(err);

                const board = {
                    board_id: rows[0]?.board_id,
                    board_name: rows[0]?.board_name,
                    description: rows[0]?.description,
                    is_archived: rows[0]?.is_archived,
                    lists: []
                };

                rows.forEach(r => {
                    if (r.list_id) {
                        board.lists.push({
                            list_id: r.list_id,
                            list_name: r.list_name,
                            position: r.position
                        });
                    }
                });

                resolve(board);
            });
        });
    }

    static getBoardsByArchive(projectId, isArchived, limit, offset) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM boards 
                WHERE project_id=? AND is_archived=?
                LIMIT ? OFFSET ?
            `;
            db.query(sql, [projectId, isArchived, limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = BoardModel;
