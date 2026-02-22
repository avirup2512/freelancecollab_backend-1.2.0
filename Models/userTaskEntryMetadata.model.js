const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

const UserTaskEntryMetadataModel = {
  create: (payload, conn = null) => {
    const sql = `INSERT INTO user_task_entry_metadata (user_task_entry, metadata, parent)
                 VALUES (?, ?, ?)`;
    const params = [
      payload.user_task_entry,
      payload.metadata,
      payload.parent || 0
    ];

    if (!conn) {
      return query(sql, params);
    }

    return new Promise((res, rej) => {
      conn.query(sql, params, (err, result) => {
        if (err) return rej(err);
        res(result);
      });
    });
  },

  update: (metadataId, payload) => {
    const sql = `UPDATE user_task_entry_metadata SET
        user_task_entry = COALESCE(?, user_task_entry),
        metadata = COALESCE(?, metadata)
      WHERE id = ?`;
    const params = [
      payload.user_task_entry || null,
      payload.metadata || null,
      metadataId
    ];
    return query(sql, params);
  },

  findById: (id) => query(`SELECT * FROM user_task_entry_metadata WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  getByUserTaskEntry: (userTaskEntryId) => {
    const sql = `SELECT * FROM user_task_entry_metadata WHERE user_task_entry = ? ORDER BY id DESC`;
    return query(sql, [userTaskEntryId]);
  },

  getAll: (limit = 100, offset = 0) => {
    const sql = `SELECT * FROM user_task_entry_metadata ORDER BY id DESC LIMIT ? OFFSET ?`;
    return query(sql, [parseInt(limit, 10) || 100, parseInt(offset, 10) || 0]);
  },

  delete: (id) => query(`DELETE FROM user_task_entry_metadata WHERE id = ?`, [id]),

  updateMetadata: (metadataId, metadata) => query(`UPDATE user_task_entry_metadata SET metadata = ? WHERE id = ?`, [metadata, metadataId])
};

module.exports = UserTaskEntryMetadataModel;
