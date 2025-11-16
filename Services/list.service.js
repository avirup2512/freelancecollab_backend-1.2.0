// services/list.service.js
const { ListModel, query, withTransaction } = require('../Models/list.model');
const pool = require('../DB/db');
// const CardModel = require('./../Models/card.model'); // assume exists
//const fs = require('fs');
//const stringify = require('csv-stringify/lib/sync'); // If not in dependencies, we'll implement CSV manually
//const { exec } = require('child_process');

const ListService = {
  createList: async (payload) => {
    // if position not provided, append to end
    const maxPos = await ListModel.getMaxPositionForBoard(payload.board_id);
    payload.position = payload.position != null ? payload.position : (maxPos + 1);
    const res = await ListModel.create(payload);
    return res;
  },

  editList: async (listId, payload) => {
    await ListModel.update(listId, payload);
    return await ListModel.findById(listId);
  },

  archiveList: async (listId, flag = true) => {
    await ListModel.markArchived(listId, flag ? 1 : 0);
    return { listId, archived: flag };
  },

  deleteList: async (listId) => {
    // Soft-delete recommended: set is_deleted = 1
    await ListModel.update(listId, { is_deleted: 1 });
    // Optionally shift positions of siblings
    return { listId, deleted: true };
  },

  activateBacklogListsNow: async () => {
    // Activate any backlog lists whose activation date has met
    const res = await ListModel.activateBacklogListsBeforeNow();
    return { activated: true };
  },

  // Position update: move listId to newPosition; shift other lists accordingly
  updatePosition: async (boardId, listId, newPosition) => {
    // transactional update
    return withTransaction(async (conn) => {
      // get current position
      const [row] = await new Promise((res, rej) =>
        conn.query('SELECT position FROM `list` WHERE id = ? AND board_id = ? FOR UPDATE', [listId, boardId], (e, r) => e ? rej(e) : res(r))
      );
      if (!row) throw { status: 404, message: 'List not found' };
      const curPos = row.position;
      if (curPos === newPosition) return { listId, position: curPos };

      // if moving down (curPos < newPos) decrement intermediate positions
      if (curPos < newPosition) {
        await new Promise((res, rej) =>
          conn.query('UPDATE `list` SET position = position - 1 WHERE board_id = ? AND position > ? AND position <= ?', [boardId, curPos, newPosition], (e) => e ? rej(e) : res())
        );
      } else {
        // moving up: increment
        await new Promise((res, rej) =>
          conn.query('UPDATE `list` SET position = position + 1 WHERE board_id = ? AND position >= ? AND position < ?', [boardId, newPosition, curPos], (e) => e ? rej(e) : res())
        );
      }

      // finally set list to newPosition
      await new Promise((res, rej) =>
        conn.query('UPDATE `list` SET position = ? WHERE id = ?', [newPosition, listId], (e) => e ? rej(e) : res())
      );

      return { listId, position: newPosition };
    });
  },

  lockList: async (listId, lock) => {
    await ListModel.update(listId, { is_locked: lock ? 1 : 0 });
    return { listId, locked: !!lock };
  },

  toggleCollapse: async (listId, collapsed) => {
    await ListModel.update(listId, { is_collapsed: collapsed ? 1 : 0 });
    return { listId, collapsed: !!collapsed };
  },

  setWipLimit: async (listId, wipLimit) => {
    await ListModel.update(listId, { wip_limit: wipLimit });
    return { listId, wip_limit: wipLimit };
  },

  getActiveListsByBoard: async (boardId) => {
    const lists = await ListModel.getActiveByBoard(boardId);
    // if JSON aggregation not supported, get cards separately per list
    return lists;
  },

  getArchivedListsByBoard: async (boardId) => {
    const lists = await ListModel.getArchivedByBoard(boardId);
    return lists;
  },

  changeListColor: async (listId, color) => {
    await ListModel.update(listId, { color });
    return { listId, color };
  },

  // ---- Advanced features ----

  // Duplicate all list data (cards, card users, attachments etc.) to other boards
  duplicateListToBoards: async (sourceListId, destBoardIds = [], createdBy) => {
    if (!Array.isArray(destBoardIds) || destBoardIds.length === 0) throw { status:400, message: 'destBoardIds required' };

    return withTransaction(async (conn) => {
      // fetch source list metadata
      const [lst] = await new Promise((res, rej) => conn.query('SELECT * FROM `list` WHERE id = ?', [sourceListId], (e, r) => e?rej(e):res(r)));
      if (!lst) throw { status:404, message: 'Source list not found' };

      // fetch cards in source list
      const cards = await new Promise((res, rej) =>
        conn.query('SELECT * FROM card WHERE list_id = ? AND is_deleted = 0 ORDER BY position ASC', [sourceListId], (e, r) => e?rej(e):res(r))
      );

      const created = [];
      for (const boardId of destBoardIds) {
        // create a copy of list in dest board with new position = max+1
        const [maxr] = await new Promise((res, rej) => conn.query('SELECT COALESCE(MAX(position),0) as maxPos FROM `list` WHERE board_id = ?', [boardId], (e,r)=>e?rej(e):res(r)));
        const newPos = (maxr && maxr.maxPos) ? maxr.maxPos + 1 : 1;
        const insertListSql = 'INSERT INTO `list` (board_id, name, position, is_backlog, is_active, created_by, color, wip_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [lres] = await new Promise((res, rej) => conn.query(insertListSql, [boardId, lst.name, newPos, lst.is_backlog, lst.is_active, createdBy, lst.color, lst.wip_limit], (e, r) => e?rej(e):res(r)));
        const newListId = lres.insertId;

        // duplicate each card
        for (const c of cards) {
          // copy card; note: adapt columns to your card schema
          const cardInsertSql = `INSERT INTO card (user_id, list_id, name, description, create_date, is_active, is_complete, due_date, reminder_date, progress, priority_id, position, is_deleted)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          const cardParams = [
            c.user_id, newListId, c.name, c.description, c.create_date, c.is_active, c.is_complete,
            c.due_date, c.reminder_date, c.progress, c.priority_id, c.position, c.is_deleted
          ];
          const [cres] = await new Promise((res, rej) => conn.query(cardInsertSql, cardParams, (e, r) => e?rej(e):res(r)));
          const newCardId = cres.insertId;

          // duplicate card_user mapping
          const cardUsers = await new Promise((res, rej) => conn.query('SELECT user_id, role_id FROM card_user WHERE card_id = ?', [c.id], (e,r)=>e?rej(e):res(r)));
          if (cardUsers && cardUsers.length) {
            const vals = cardUsers.map(u => [u.user_id, newCardId, u.role_id]);
            await new Promise((res, rej) => conn.query('INSERT INTO card_user (user_id, card_id, role_id) VALUES ?', [vals], (e) => e?rej(e):res()));
          }

          // duplicate checklist items, labels, comments, attachments as needed (implement similarly)
          const checklists = await new Promise((res, rej) => conn.query('SELECT name, is_checked, position FROM checklist_item WHERE card_id = ?', [c.id], (e,r)=>e?rej(e):res(r)));
          if (checklists && checklists.length) {
            const vals = checklists.map(ch => [newCardId, ch.name, ch.is_checked, ch.position, 0]);
            await new Promise((res, rej) => conn.query('INSERT INTO checklist_item (card_id, name, is_checked, position, is_deleted) VALUES ?', [vals], (e)=>e?rej(e):res()));
          }

          // attachments, comments, labels — copy accordingly if needed
        }

        created.push({ boardId, newListId });
      } // end for boards
      return { created };
    });
  },

  // Sort cards within list by key (due_date, create_date, alphabetical, priority)
  sortCardsInList: async (listId, sortBy = 'position', order = 'ASC') => {
    // Retrieve cards sorted and then update position sequentially
    const allowed = ['due_date', 'create_date', 'name', 'priority_id', 'position'];
    if (!allowed.includes(sortBy)) throw { status:400, message: 'Invalid sort key' };
    const rows = await query(`SELECT id FROM card WHERE list_id = ? AND is_deleted = 0 ORDER BY ${sortBy} ${order}`, [listId]);
    // update position sequentially
    let pos = 1;
    for (const r of rows) {
      await query('UPDATE card SET position = ? WHERE id = ?', [pos++, r.id]);
    }
    return { listId, sortedBy: sortBy, order };
  },

  // Filters: produce card lists by criteria in a list or across lists
  filterCardsInList: async (listId, filter) => {
    // filter: overdue, unassigned, completed, high_priority
    let where = 'AND c.list_id = ? AND c.is_deleted = 0';
    const params = [listId];
    if (filter === 'overdue') {
      where += ' AND c.due_date IS NOT NULL AND c.due_date < NOW() AND c.is_complete = 0';
    } else if (filter === 'unassigned') {
      where += ' AND (c.user_id IS NULL OR c.user_id = 0)';
    } else if (filter === 'completed') {
      where += ' AND c.is_complete = 1';
    } else if (filter === 'high_priority') {
      // assume priority table: high = id mapping; using priority_id = 1 as highest (adjust as needed)
      where += ' AND c.priority_id = 1';
    }
    const sql = `SELECT c.* FROM card c WHERE 1=1 ${where} ORDER BY c.position ASC`;
    return await query(sql, params);
  },

  duplicateCardsToLists: async (sourceListId, targetListIds = [], createdBy) => {
    return withTransaction(async (conn) => {
      const cards = await new Promise((res, rej) => conn.query('SELECT * FROM card WHERE list_id = ? AND is_deleted = 0 ORDER BY position ASC', [sourceListId], (e,r)=>e?rej(e):res(r)));
      if (!cards || !cards.length) return { duplicated: 0 };
      let total = 0;
      for (const lid of targetListIds) {
        for (const c of cards) {
          const params = [c.user_id, lid, c.name, c.description, c.create_date, c.is_active, c.is_complete, c.due_date, c.reminder_date, c.progress, c.priority_id, c.position, c.is_deleted];
          const [cres] = await new Promise((res, rej) => conn.query('INSERT INTO card (user_id, list_id, name, description, create_date, is_active, is_complete, due_date, reminder_date, progress, priority_id, position, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params, (e,r)=>e?rej(e):res(r)));
          const newCardId = cres.insertId;
          // copy checklist, users etc - similar to duplicateListToBoards
        }
        total += cards.length;
      }
      return { duplicated: total };
    });
  },

  // Bulk operations
  markAllCardsCompleted: async (listId) => query('UPDATE card SET is_complete = 1 WHERE list_id = ? AND is_deleted = 0', [listId]).then(r => ({ listId, updated: r.affectedRows })),
  deleteAllCardsInList: async (listId) => query('UPDATE card SET is_deleted = 1 WHERE list_id = ?', [listId]).then(r => ({ listId, deleted: r.affectedRows })),
  archiveAllCardsInList: async (listId) => query('UPDATE card SET is_active = 0 WHERE list_id = ? AND is_deleted = 0', [listId]).then(r => ({ listId, archived: r.affectedRows })),

  // Report: summary for list (counts)
  getListReport: async (listId) => {
    const total = await query('SELECT COUNT(*) as cnt FROM card WHERE list_id = ? AND is_deleted = 0', [listId]).then(r => r[0].cnt);
    const completed = await query('SELECT COUNT(*) as cnt FROM card WHERE list_id = ? AND is_deleted = 0 AND is_complete = 1', [listId]).then(r => r[0].cnt);
    const overdue = await query('SELECT COUNT(*) as cnt FROM card WHERE list_id = ? AND is_deleted = 0 AND is_complete = 0 AND due_date IS NOT NULL AND due_date < NOW()', [listId]).then(r => r[0].cnt);
    const unassigned = await query('SELECT COUNT(*) as cnt FROM card WHERE list_id = ? AND is_deleted = 0 AND (user_id IS NULL OR user_id = 0)', [listId]).then(r => r[0].cnt);
    return { listId, total, completed, overdue, unassigned };
  },

  // Export list data as CSV (cards + basic fields)
  exportListAsCSV: async (listId) => {
    const cards = await query('SELECT id, name, description, is_complete, DATE_FORMAT(due_date, "%Y-%m-%d %H:%i:%s") as due_date, priority_id, user_id FROM card WHERE list_id = ? AND is_deleted = 0 ORDER BY position ASC', [listId]);
    // create CSV string
    const headers = ['id','name','description','is_complete','due_date','priority_id','user_id'];
    const rows = cards.map(c => [c.id, c.name, c.description || '', c.is_complete ? '1' : '0', c.due_date || '', c.priority_id || '', c.user_id || '']);
    const csv = [headers.join(',')].concat(rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n');
    return { csv, filename: `list-${listId}.csv` };
  },

  // Export to Excel/PDF: recommend using libraries (xlsx, pdfkit)
};

module.exports = ListService;
