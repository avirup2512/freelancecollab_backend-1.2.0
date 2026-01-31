const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

const CardModel = {
  create: (payload, conn = null) => {
    const sql = `INSERT INTO cards (user_id, list_id, name, description, due_date, priority_id, position)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [payload.user_id || null, payload.listId, payload.name, payload.description || null, payload.due_date || null, payload.priority_id || null, payload.position || null];

    // No transaction connection provided: use query helper and then add card_user mapping
    if (!conn) {
      return query(sql, params).then(res => {
        const cardId = res.insertId;
        // insert into card_user with nullable role_id to avoid FK failures if roles not seeded
        const addSql = `INSERT INTO card_user (user_id, card_id, role_id) VALUES (?, ?, NULL)`;
        return query(addSql, [payload.user_id || null, cardId]).then(() => res);
      });
    }

    // With explicit connection (transaction): run both queries on conn
    return new Promise((res, rej) => {
      conn.query(sql, params, (err, r) => {
        if (err) return rej(err);
        const cardId = r.insertId;
        const addSql = `INSERT INTO card_user (user_id, card_id, role_id) VALUES (?, ?, NULL)`;
        conn.query(addSql, [payload.user_id || null, cardId], (e) => {
          if (e) return rej(e);
          res(r);
        });
      });
    });
  },

  update: (cardId, payload) => {
    const sql = `UPDATE cards SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        is_complete = COALESCE(?, is_complete),
        due_date = COALESCE(?, due_date),
        reminder_date = COALESCE(?, reminder_date),
        priority_id = COALESCE(?, priority_id),
        position = COALESCE(?, position),
        is_active = COALESCE(?, is_active),
        is_deleted = COALESCE(?, is_deleted),
        updated_at = NOW()
      WHERE id = ?`;
    const params = [
      payload.name || null,
      payload.description || null,
      payload.is_complete == null ? null : (payload.is_complete ? 1 : 0),
      payload.due_date || null,
      payload.reminder_date || null,
      payload.priority_id || null,
      payload.position == null ? null : payload.position,
      payload.is_active == null ? null : (payload.is_active ? 1 : 0),
      payload.is_deleted == null ? null : (payload.is_deleted ? 1 : 0),
      cardId
    ];
    return query(sql, params);
  },

  findById: (id) => query(`SELECT * FROM cards WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  softDelete: (id) => query(`UPDATE cards SET is_deleted = 1, deleted_at = NOW() WHERE id = ?`, [id]),

  move: (cardId, newListId, newPosition) => query(`UPDATE cards SET list_id = ?, position = ? WHERE id = ?`, [newListId, newPosition, cardId]),

  assignUser: (cardId, userId) => query(`UPDATE cards SET user_id = ? WHERE id = ?`, [userId, cardId]),

  listByListId: (listId, includeArchived = false, limit = 100, offset = 0) => {
    let sql = `SELECT * FROM cards WHERE list_id = ? AND is_deleted = 0`;
    const params = [listId];
    if (!includeArchived) {
      sql += ` AND is_active = 1`;
    }
    sql += ` ORDER BY position ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10) || 100, parseInt(offset, 10) || 0);
    return query(sql, params);
  }
};

module.exports = CardModel;