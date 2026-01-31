const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

class BoardModel {

    static createBoard({ projectId, name, created_by }) {
        const project_id = parseInt(projectId, 10);
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO boards (project_id, name, created_by)
                VALUES (?, ?, ?)
            `;
            query(sql, [project_id, name, created_by]).then(res => {
                const boardId = res.insertId;
                
                // Get the owner role from board_roles table
                const getRoleSql = `
                    SELECT id FROM board_roles WHERE role_name = 'owner' LIMIT 1
                `;
                
                query(getRoleSql, []).then(roleRows => {
                    if (!roleRows || roleRows.length === 0) {
                        console.error('Owner role not found in board_roles');
                        resolve({ boardId, status: 200, warning: 'Board created but owner role not found' });
                        return;
                    }
                    
                    const roleId = roleRows[0].id;
                    
                    // Add creator to board_users table with owner role
                    const addUserSql = `
                        INSERT INTO board_users (board_id, user_id, role_id)
                        VALUES (?, ?, ?)
                    `;
                    
                    query(addUserSql, [boardId, created_by, roleId]).then(() => {
                        resolve({ boardId, status: 200 });
                    }).catch(err => {
                        console.error('Error adding user to board_users:', err);
                        resolve({ boardId, status: 200, warning: 'Board created but user assignment failed' });
                    });
                }).catch(err => {
                    console.error('Error fetching owner role:', err);
                    resolve({ boardId, status: 200, warning: 'Board created but role fetch failed' });
                });
            }).catch(err => {
                reject(err);
            });
        });
    }

    static updateBoard(boardId, data) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE boards SET board_name = ?, description = ?
                WHERE id = ?
            `;
            query(sql, [data.name, data.description, boardId]).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
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
            query("DELETE FROM boards WHERE id=?", [boardId]).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            });
        });
    }

    static getBoardWithLists(boardId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    b.id AS board_id,
                    b.name AS board_name,
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

            query(sql, [boardId]).then(rows => {
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
        console.log("IS ARCHIVED");
        console.log(isArchived);
        
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM boards 
                WHERE project_id=? AND is_archived=?
                LIMIT ? OFFSET ?
            `;
            query(sql, [projectId, isArchived, limit, offset]).then(rows => {
                resolve(rows);
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    static getAllBoardsByProjectId(projectId, userId, isArchived = null, limit = 20, offset = 0) {
        return new Promise((resolve, reject) => {
            // Check if user is part of the project
            const checkUserSql = `
                SELECT pu.id
                FROM project_user pu
                WHERE pu.project_id = ? AND pu.user_id = ?
                LIMIT 1
            `;
            query(checkUserSql, [projectId, userId]).then(userRows => {
                if (!userRows || userRows.length === 0) {
                    return reject(new Error("User is not part of this project"));
                }
                // User is authorized, get boards for the project with optional archive filter and board_users
                let sql = `
                    SELECT 
                        b.id,
                        b.project_id,
                        b.name,
                        b.is_archived,
                        b.created_by,
                        b.create_date,
                        IFNULL((
                            SELECT JSON_ARRAYAGG(JSON_OBJECT(
                                'user_id', bu.user_id,
                                'role_id', bu.role_id,
                                'first_name', u.first_name,
                                'last_name', u.last_name,
                                'email', u.email
                            ))
                            FROM board_users bu
                            LEFT JOIN users u ON u.id = bu.user_id
                            WHERE bu.board_id = b.id
                        ), JSON_ARRAY()) AS users,
                        IFNULL((
                            SELECT JSON_ARRAYAGG(JSON_OBJECT(
                                'id', bt.id,
                                'name', bt.name,
                                'color', bt.color,
                                'attach_in_board', bt.attach_in_board
                            ))
                            FROM board_tag bt
                            WHERE bt.board_id = b.id
                        ), JSON_ARRAY()) AS tags
                    FROM boards b
                    WHERE b.project_id = ?
                `;
                const params = [projectId];
                // Add archive filter if specified
                if (isArchived !== null) {
                    sql += ` AND b.is_archived = ?`;
                    params.push(isArchived ? 1 : 0);
                }
                sql += ` ORDER BY b.create_date DESC LIMIT ? OFFSET ?`;
                params.push(parseInt(limit, 10), parseInt(offset, 10));
                query(sql, params).then(boards => {
                    resolve(boards || []);
                }).catch(err => {                    
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }
}

module.exports = BoardModel;
