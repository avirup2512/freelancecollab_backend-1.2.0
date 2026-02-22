const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}

const UserTaskEntryModel = {
  create: (payload, conn = null) => {
    const sql = `INSERT INTO user_task_entry (task, user, date, entry)
    VALUES (?, ?, ?, ?)`;
    const params = [
      payload.taskId,
      payload.creator,
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

  update: (userTaskEntryId, payload) => {
    const sql = `UPDATE user_task_entry SET
        task = COALESCE(?, task),
        user = COALESCE(?, user),
        date = COALESCE(?, date),
        entry = COALESCE(?, entry)
      WHERE id = ?`;
    const params = [
      payload.task || null,
      payload.user || null,
      payload.date || null,
      payload.entry == null ? null : (payload.entry ? 1 : 0),
      userTaskEntryId
    ];
    return query(sql, params);
  },

  findById: (id) => query(`SELECT * FROM user_task_entry WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  getByTask: (taskId) => {
    const sql = `SELECT * FROM user_task_entry WHERE task = ? ORDER BY date DESC`;
    return query(sql, [taskId]);
  },

  getByUser: (userId) => {
    const sql = `SELECT * FROM user_task_entry WHERE user = ? ORDER BY date DESC`;
    return query(sql, [userId]);
  },

  getByTaskAndUser: (taskId, userId) => {
    const sql = `SELECT * FROM user_task_entry WHERE task = ? AND user = ? ORDER BY date DESC`;
    return query(sql, [taskId, userId]);
  },

  getAll: (limit = 100, offset = 0) => {
    const sql = `SELECT * FROM user_task_entry ORDER BY date DESC LIMIT ? OFFSET ?`;
    return query(sql, [parseInt(limit, 10) || 100, parseInt(offset, 10) || 0]);
  },

  delete: (id) => query(`DELETE FROM user_task_entry WHERE id = ?`, [id]),

  updateEntry: (userTaskEntryId, entry) => query(`UPDATE user_task_entry SET entry = ? WHERE id = ?`, [entry ? 1 : 0, userTaskEntryId]),

  updateDate: (userTaskEntryId, date) => query(`UPDATE user_task_entry SET date = ? WHERE id = ?`, [date, userTaskEntryId]),

  getByDate: (taskId, userId, date) => {
    const sql = `SELECT * FROM user_task_entry WHERE task = ? AND user = ? AND DATE(date) = DATE(?)`;
    return query(sql, [taskId, userId, date]);
  },

  getByDateRange: (taskId, userId, startDate, endDate) => {
    const sql = `SELECT * FROM user_task_entry WHERE task = ? AND user = ? AND date BETWEEN ? AND ? ORDER BY date ASC`;
    return query(sql, [taskId, userId, startDate, endDate]);
  }
};

module.exports = UserTaskEntryModel;
