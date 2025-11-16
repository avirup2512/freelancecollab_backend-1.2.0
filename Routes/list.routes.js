// routes/list.routes.js
const express = require('express');
const router = express.Router();
const ListController = require('../Controllers/list.controller');
const authMiddleware = require('../Middleware/auth');
//const { requireRole } = require('../middleware/teamRoleMiddleware'); // if you want role checks

// Basic:
router.post('/', authMiddleware, ListController.create);
router.put('/:listId', authMiddleware, ListController.edit);
router.put('/:listId/archive', authMiddleware, ListController.archive);
router.delete('/:listId', authMiddleware, ListController.delete);

// Backlog activation endpoint (run via cron or call manually)
router.post('/activate-backlog', authMiddleware, ListController.activateBacklog);

// Positioning (drag-drop)
router.post('/board/:boardId/position', authMiddleware, ListController.updatePosition);

// Lock / collapse / wip / color
router.put('/:listId/lock', authMiddleware, ListController.lock);
router.put('/:listId/collapse', authMiddleware, ListController.collapse);
router.put('/:listId/wip', authMiddleware, ListController.setWip);
router.put('/:listId/color', authMiddleware, ListController.changeColor);

// Get lists joined with cards
router.get('/board/:boardId/active', authMiddleware, ListController.getActiveByBoard);
router.get('/board/:boardId/archived', authMiddleware, ListController.getArchivedByBoard);

// Advanced
router.post('/:listId/duplicate', authMiddleware, ListController.duplicateList);
router.post('/:listId/sort-cards', authMiddleware, ListController.sortCards);
router.get('/:listId/filter', authMiddleware, ListController.filterCards);
router.post('/:listId/duplicate-cards', authMiddleware, ListController.duplicateCards);
router.post('/:listId/mark-all-complete', authMiddleware, ListController.markAllCompleted);
router.post('/:listId/delete-all-cards', authMiddleware, ListController.deleteAllCards);
router.post('/:listId/archive-all-cards', authMiddleware, ListController.archiveAllCards);
router.get('/:listId/report', authMiddleware, ListController.listReport);
router.get('/:listId/export/csv', authMiddleware, ListController.exportCSV);

module.exports = router;
