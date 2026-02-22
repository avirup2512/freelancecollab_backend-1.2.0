const router = require('express').Router();
const TaskGridEntryController = require('../Controllers/taskGridEntry.controller');
const auth = require('../MiddleWare/auth');

router.post('/', auth, TaskGridEntryController.create);
router.put('/:entryId', auth, TaskGridEntryController.update);
router.delete('/:entryId', auth, TaskGridEntryController.delete);
router.get('/:entryId', auth, TaskGridEntryController.getById);
router.get('/grid/:gridId', auth, TaskGridEntryController.getByTaskGrid);
router.get('/', auth, TaskGridEntryController.getAll);
router.put('/:entryId/status', auth, TaskGridEntryController.updateStatus);
router.put('/:entryId/date', auth, TaskGridEntryController.updateDate);
router.get('/grid/:gridId/date', auth, TaskGridEntryController.getByDate);

module.exports = router;
