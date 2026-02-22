const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

const TaskModel = {
  create: (payload, conn = null) => {
    const sql = `INSERT INTO task (creator, name, description, frequency)
                 VALUES (?, ?, ?, ?)`;
    const params = [
      payload.creator,
      payload.name,
      payload.description,
      payload.frequency
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

  update: (taskId, payload) => {
    const sql = `UPDATE task SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        frequency = COALESCE(?, frequency),
        creator = COALESCE(?, creator)
      WHERE id = ?`;
    const params = [
      payload.name || null,
      payload.description || null,
      payload.frequency || null,
      payload.creator || null,
      taskId
    ];
    return query(sql, params);
  },

  findById: (id) => query(`SELECT * FROM task WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  getByCreator: (creatorId) => {
    const sql = `SELECT * FROM task WHERE creator = ? ORDER BY id DESC`;
    return query(sql, [creatorId]);
  },

  getByFrequency: (frequencyId) => {
    const sql = `SELECT * FROM task WHERE frequency = ? ORDER BY id DESC`;
    return query(sql, [frequencyId]);
  },

  getAll: (limit = 100, offset = 0) => {
    const sql = `SELECT * FROM task ORDER BY id DESC LIMIT ? OFFSET ?`;
    return query(sql, [parseInt(limit, 10) || 100, parseInt(offset, 10) || 0]);
  },

  getAllTaskWithGrid: (limit = 100, offset = 0) => {
    const sql = `SELECT t.* , tg.id as task_grid_id, tg.start_date, tg.end_date FROM task t LEFT JOIN task_grid tg ON t.id = tg.task ORDER BY t.id DESC LIMIT ? OFFSET ?`;
    return query(sql, [parseInt(limit, 10) || 100, parseInt(offset, 10) || 0]);
  },

  delete: (id) => query(`DELETE FROM task WHERE id = ?`, [id]),

  updateName: (taskId, name) => query(`UPDATE task SET name = ? WHERE id = ?`, [name, taskId]),

  updateDescription: (taskId, description) => query(`UPDATE task SET description = ? WHERE id = ?`, [description, taskId]),

  updateFrequency: (taskId, frequencyId) => query(`UPDATE task SET frequency = ? WHERE id = ?`, [frequencyId, taskId]),

  updateCreator: (taskId, creatorId) => query(`UPDATE task SET creator = ? WHERE id = ?`, [creatorId, taskId])
};

module.exports = TaskModel;
