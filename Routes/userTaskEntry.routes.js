const router = require('express').Router();
const UserTaskEntryController = require('../Controllers/userTaskEntry.controller');
const auth = require('../MiddleWare/auth');

router.post('/', auth, UserTaskEntryController.create);
router.put('/:entryId', auth, UserTaskEntryController.update);
router.delete('/:entryId', auth, UserTaskEntryController.delete);
router.get('/:entryId', auth, UserTaskEntryController.getById);
router.get('/task/:taskId', auth, UserTaskEntryController.getByTask);
router.get('/user/:userId', auth, UserTaskEntryController.getByUser);
router.get('/task/:taskId/user/:userId', auth, UserTaskEntryController.getByTaskAndUser);
router.get('/', auth, UserTaskEntryController.getAll);
router.put('/:entryId/status', auth, UserTaskEntryController.updateStatus);
router.put('/:entryId/date', auth, UserTaskEntryController.updateDate);
router.get('/task/:taskId/user/:userId/date', auth, UserTaskEntryController.getByDate);
router.get('/task/:taskId/user/:userId/date-range', auth, UserTaskEntryController.getByDateRange);

module.exports = router;
