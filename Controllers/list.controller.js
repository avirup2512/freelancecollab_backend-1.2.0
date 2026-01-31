// controllers/list.controller.js
const ListService = require('../Services/list.service');

const ListController = {
  create: async (req, res) => {
    try {
      const payload = { ...req.body, created_by: req.user.id };
      const r = await ListService.createList(payload);
      res.json({ success: true, data: r, status:200 });
    } catch (err) { console.error(err); res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' }); }
  },

  edit: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.editList(listId, req.body);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' }); }
  },

  archive: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.archiveList(listId, req.body.archived);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' }); }
  },

  delete: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.deleteList(listId);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' }); }
  },

  activateBacklog: async (req, res) => {
    try {
      const r = await ListService.activateBacklogListsNow();
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  updatePosition: async (req, res) => {
    try {
      const boardId = parseInt(req.params.boardId, 10);
      const { listId, newPosition } = req.body;
      const r = await ListService.updatePosition(boardId, listId, newPosition);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  lock: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { lock } = req.body;
      const r = await ListService.lockList(listId, lock);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  collapse: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { collapsed } = req.body;
      const r = await ListService.toggleCollapse(listId, collapsed);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  setWip: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { wipLimit } = req.body;
      const r = await ListService.setWipLimit(listId, wipLimit);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  getActiveByBoard: async (req, res) => {
    try {
      const boardId = parseInt(req.params.boardId, 10);
      const r = await ListService.getActiveListsByBoard(boardId);
      res.json({ success: true, data: r, status:200 });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  getArchivedByBoard: async (req, res) => {
    try {
      const boardId = parseInt(req.params.boardId, 10);
      const r = await ListService.getArchivedListsByBoard(boardId);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  changeColor: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { color } = req.body;
      const r = await ListService.changeListColor(listId, color);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  duplicateList: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { destBoardIds } = req.body;
      const r = await ListService.duplicateListToBoards(listId, destBoardIds, req.user.id);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(err.status||500).json({ success:false, message: err.message }) }
  },

  sortCards: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { sortBy, order } = req.body;
      const r = await ListService.sortCardsInList(listId, sortBy, order);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  filterCards: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { filter } = req.query;
      const r = await ListService.filterCardsInList(listId, filter);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  duplicateCards: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const { targetListIds } = req.body;
      const r = await ListService.duplicateCardsToLists(listId, targetListIds, req.user.id);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(err.status||500).json({ success:false, message: err.message }) }
  },

  markAllCompleted: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.markAllCardsCompleted(listId);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  deleteAllCards: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.deleteAllCardsInList(listId);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  archiveAllCards: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.archiveAllCardsInList(listId);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  listReport: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.getListReport(listId);
      res.json({ success: true, data: r });
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  },

  exportCSV: async (req, res) => {
    try {
      const listId = parseInt(req.params.listId, 10);
      const r = await ListService.exportListAsCSV(listId);
      res.header('Content-Type', 'text/csv');
      res.attachment(r.filename);
      res.send(r.csv);
    } catch (err) { console.error(err); res.status(500).json({ success:false, message: err.message }) }
  }
};

module.exports = ListController;
