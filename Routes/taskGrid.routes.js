const router = require('express').Router();
const TaskGridController = require('../Controllers/taskGrid.controller');
const auth = require('../MiddleWare/auth');

router.post('/', auth, TaskGridController.create);
router.put('/:gridId', auth, TaskGridController.update);
router.delete('/:gridId', auth, TaskGridController.delete);
router.get('/:gridId', auth, TaskGridController.getById);
router.get('/task/:taskId', auth, TaskGridController.getByTask);
router.get('/', auth, TaskGridController.getAll);
router.put('/:gridId/task', auth, TaskGridController.updateTask);
router.put('/:gridId/start-date', auth, TaskGridController.updateStartDate);
router.put('/:gridId/end-date', auth, TaskGridController.updateEndDate);

module.exports = router;
