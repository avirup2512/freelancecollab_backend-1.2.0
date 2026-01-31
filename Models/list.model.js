const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}


function withTransaction(work) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.beginTransaction(async (txErr) => {
        if (txErr) { conn.release(); return reject(txErr); }
        try {
          const r = await work(conn);
          conn.commit((cErr) => {
            if (cErr) { conn.rollback(() => conn.release()); return reject(cErr); }
            conn.release();
            resolve(r);
          });
        } catch (e) {
          conn.rollback(() => conn.release());
          reject(e);
        }
      });
    });
  });
}

const ListModel = {
  create: (payload, conn = null) => {
    console.log(payload);
    
    const sql = `INSERT INTO \`list\` (board_id, name, position, is_backlog, backlog_activate_at, is_active, is_locked, is_collapsed, wip_limit, color, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      payload.boardId, payload.name, payload.position || 0,
      payload.is_backlog ? 1 : 0,
      payload.backlog_activate_at || null,
      payload.is_active == null ? 1 : (payload.is_active ? 1 : 0),
      payload.is_locked ? 1 : 0,
      payload.is_collapsed ? 1 : 0,
      payload.wip_limit || null, payload.color || null, payload.created_by || null
    ];
    if (!conn) return query(sql, params);
    return new Promise((res, rej) => conn.query(sql, params, (err, r) => (err ? rej(err) : res(r))));
  },

  update: (listId, payload) => {
    const sql = `UPDATE \`list\` SET
        name = COALESCE(?, name),
        position = COALESCE(?, position),
        is_backlog = COALESCE(?, is_backlog),
        backlog_activate_at = COALESCE(?, backlog_activate_at),
        is_active = COALESCE(?, is_active),
        is_archived = COALESCE(?, is_archived),
        is_deleted = COALESCE(?, is_deleted),
        is_locked = COALESCE(?, is_locked),
        is_collapsed = COALESCE(?, is_collapsed),
        wip_limit = COALESCE(?, wip_limit),
        color = COALESCE(?, color),
        updated_date = NOW()
      WHERE id = ?`;
    const params = [
      payload.name, payload.position, payload.is_backlog ? 1 : (payload.is_backlog == null ? null : 0),
      payload.backlog_activate_at || null,
      payload.is_active == null ? null : (payload.is_active ? 1 : 0),
      payload.is_archived == null ? null : (payload.is_archived ? 1 : 0),
      payload.is_deleted == null ? null : (payload.is_deleted ? 1 : 0),
      payload.is_locked == null ? null : (payload.is_locked ? 1 : 0),
      payload.is_collapsed == null ? null : (payload.is_collapsed ? 1 : 0),
      payload.wip_limit || null, payload.color || null, listId
    ];
    return query(sql, params);
  },

  findById: (id) => query(`SELECT * FROM \`list\` WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  delete: (id) => query(`DELETE FROM \`list\` WHERE id = ?`, [id]),

  markArchived: (id, flag = 1) => query(`UPDATE \`list\` SET is_archived = ? WHERE id = ?`, [flag ? 1 : 0, id]),

  getActiveByBoard: (boardId) => {
    // join cards and other related data (cards, card_user, card_label etc)
    const sql = `
      SELECT l.*, 
        COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
          'id', c.id, 'name', c.name, 'description', c.description, 'is_complete', c.is_complete,
          'due_date', DATE_FORMAT(c.due_date, '%Y-%m-%d %H:%i:%s'),
          'priority_id', c.priority_id, 'assigned_user_id', c.user_id
        )) FILTER (WHERE c.id IS NOT NULL), JSON_ARRAY()) AS cards
      FROM \`list\` l
      LEFT JOIN cards c ON c.list_id = l.id AND c.is_deleted = 0
      WHERE l.board_id = ? AND l.is_archived = 0 AND l.is_deleted = 0 AND l.is_active = 1
      GROUP BY l.id
      ORDER BY l.position ASC`;
    // Note: MySQL < 8 lacks FILTER; simpler approach below
    const fallback = `
      SELECT l.*, 
        (
          SELECT IFNULL(JSON_ARRAYAGG(JSON_OBJECT(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'is_complete', c.is_complete,
            'due_date', DATE_FORMAT(c.due_date, '%Y-%m-%d %H:%i:%s'),
            'priority_id', c.priority_id,
            'assigned_user_id', c.user_id,
            'users', IFNULL((SELECT JSON_ARRAYAGG(JSON_OBJECT('user_id', cu.user_id, 'role_id', cu.role_id, 'first_name', u.first_name, 'email', u.email))
            FROM card_user cu LEFT JOIN users u ON u.id = cu.user_id WHERE cu.card_id = c.id), JSON_ARRAY()),
            'tags', IFNULL((SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ct.id, 'board_tag_id', ct.board_tag_id, 'name', bt.name, 'color', bt.color))
            FROM card_tag ct LEFT JOIN board_tag bt ON bt.id = ct.board_tag_id WHERE ct.card_id = c.id), JSON_ARRAY())
          )), JSON_ARRAY())
          FROM cards c WHERE c.list_id = l.id AND c.is_deleted = 0
        ) AS cards
      FROM \`list\` l
      WHERE l.board_id = ? AND l.is_archived = 0 AND l.is_deleted = 0 AND l.is_active = 1
      ORDER BY l.position ASC`;
    return query(fallback, [boardId]);
  },

  getArchivedByBoard: (boardId) => {
    const sql = `
      SELECT l.*, 
        (
          SELECT IFNULL(JSON_ARRAYAGG(JSON_OBJECT(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'is_complete', c.is_complete,
            'due_date', DATE_FORMAT(c.due_date, '%Y-%m-%d %H:%i:%s'),
            'priority_id', c.priority_id,
            'assigned_user_id', c.user_id,
            'users', IFNULL((SELECT JSON_ARRAYAGG(JSON_OBJECT('user_id', cu.user_id, 'role_id', cu.role_id, 'first_name', u.first_name, 'email', u.email))
            FROM card_user cu LEFT JOIN users u ON u.id = cu.user_id WHERE cu.card_id = c.id), JSON_ARRAY()),
            'tags', IFNULL((SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ct.id, 'board_tag_id', ct.board_tag_id, 'name', bt.name, 'color', bt.color))
            FROM card_tag ct LEFT JOIN board_tag bt ON bt.id = ct.board_tag_id WHERE ct.card_id = c.id), JSON_ARRAY())
          )), JSON_ARRAY())
          FROM cards c WHERE c.list_id = l.id
        ) AS cards
      FROM \`list\` l
      WHERE l.board_id = ? AND l.is_archived = 1 AND l.is_deleted = 0
      ORDER BY l.position ASC`;
    return query(sql, [boardId]);
  },

  getMaxPositionForBoard: (boardId) => query(`SELECT COALESCE(MAX(position), 0) as maxPos FROM \`list\` WHERE board_id = ?`, [boardId]).then(r => r[0] ? r[0].maxPos : 0),

  // Helpers to shift positions when reordering
  shiftPositions: (boardId, fromPos, toPos, conn) => {
    // caller should provide conn for atomicity
    // Implementation in service uses transactions and concrete updates
    throw new Error('Use service function for precise position shifts');
  },

  duplicateListIntoBoard: async (conn, sourceListId, destBoardId, createdBy) => {
    // implemented in service (needs transaction); model helper can be minimal
    throw new Error('Use service for duplication');
  },

  activateBacklogListsBeforeNow: () => {
    return query(`UPDATE \`list\` SET is_active = 1 WHERE is_backlog = 1 AND is_active = 0 AND backlog_activate_at <= NOW() AND is_deleted = 0`);
  },

  // bulk operations on cards in a list (delegated to Card model usually)
};

module.exports = { query, withTransaction, ListModel };
