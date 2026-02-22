const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

const TaskGridModel = {
  create: (payload, conn = null) => {
    const sql = `INSERT INTO task_grid (task, start_date, end_date)
    VALUES (?, ?, ?)`;
    const params = [
      payload.task,
      payload.start_date || null,
      payload.end_date || null
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

  update: (taskGridId, payload) => {
    const sql = `UPDATE task_grid SET
        task = COALESCE(?, task),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date)
      WHERE id = ?`;
    const params = [
      payload.task || null,
      payload.start_date || null,
      payload.end_date || null,
      taskGridId
    ];
    return query(sql, params);
  },

  findById: (id) => query(`SELECT * FROM task_grid WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  getByTask: (taskId) => {
    const sql = `SELECT tg.*, ute.date, ute.entry, ute.task as taskID,utem.id as utemId, utem.metadata, utem.parent FROM task_grid tg LEFT JOIN user_task_entry ute ON tg.task = ute.task LEFT JOIN user_task_entry_metadata utem ON ute.id = utem.user_task_entry WHERE tg.task = ? ORDER BY id DESC`;
    return query(sql, [taskId]);
  },

  getAll: (limit = 100, offset = 0) => {
    const sql = `SELECT * FROM task_grid ORDER BY id DESC LIMIT ? OFFSET ?`;
    return query(sql, [parseInt(limit, 10) || 100, parseInt(offset, 10) || 0]);
  },

  delete: (id) => query(`DELETE FROM task_grid WHERE id = ?`, [id]),

  updateTask: (taskGridId, taskId) => query(`UPDATE task_grid SET task = ? WHERE id = ?`, [taskId, taskGridId]),

  updateStartDate: (taskGridId, startDate) => query(`UPDATE task_grid SET start_date = ? WHERE id = ?`, [startDate, taskGridId]),

  updateEndDate: (taskGridId, endDate) => query(`UPDATE task_grid SET end_date = ? WHERE id = ?`, [endDate, taskGridId])
};

module.exports = TaskGridModel;
