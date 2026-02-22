const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

const TaskGridEntryModel = {
  create: (payload, conn = null) => {
    const sql = `INSERT INTO task_grid_entry (task_grid, date, entry)
                 VALUES (?, ?, ?)`;
    const params = [
      payload.task_grid,
      payload.date || null,
      payload.entry || false
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

  update: (taskGridEntryId, payload) => {
    const sql = `UPDATE task_grid_entry SET
        task_grid = COALESCE(?, task_grid),
        date = COALESCE(?, date),
        entry = COALESCE(?, entry)
      WHERE id = ?`;
    const params = [
      payload.task_grid || null,
      payload.date || null,
      payload.entry == null ? null : (payload.entry ? 1 : 0),
      taskGridEntryId
    ];
    return query(sql, params);
  },

  findById: (id) => query(`SELECT * FROM task_grid_entry WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  getByTaskGrid: (taskGridId) => {
    const sql = `SELECT * FROM task_grid_entry WHERE task_grid = ? ORDER BY date ASC`;
    return query(sql, [taskGridId]);
  },

  getAll: (limit = 100, offset = 0) => {
    const sql = `SELECT * FROM task_grid_entry ORDER BY date DESC LIMIT ? OFFSET ?`;
    return query(sql, [parseInt(limit, 10) || 100, parseInt(offset, 10) || 0]);
  },

  delete: (id) => query(`DELETE FROM task_grid_entry WHERE id = ?`, [id]),

  updateEntry: (taskGridEntryId, entry) => query(`UPDATE task_grid_entry SET entry = ? WHERE id = ?`, [entry ? 1 : 0, taskGridEntryId]),

  updateDate: (taskGridEntryId, date) => query(`UPDATE task_grid_entry SET date = ? WHERE id = ?`, [date, taskGridEntryId]),

  getByDate: (taskGridId, date) => {
    const sql = `SELECT * FROM task_grid_entry WHERE task_grid = ? AND DATE(date) = DATE(?)`;
    return query(sql, [taskGridId, date]);
  }
};

module.exports = TaskGridEntryModel;
