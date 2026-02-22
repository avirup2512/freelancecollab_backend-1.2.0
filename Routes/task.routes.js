const router = require('express').Router();
const TaskController = require('../Controllers/task.controller');
const authMiddleware = require('../MiddleWare/auth');
const auth = require('../MiddleWare/auth');

router.post('/', auth, authMiddleware,TaskController.create);
router.put('/:taskId', auth, TaskController.update);
router.delete('/:taskId', auth, TaskController.delete);
router.get('/:taskId', auth, TaskController.getById);
router.get('/creator/:creatorId', auth, TaskController.getByCreator);
router.get('/frequency/:frequencyId', auth, TaskController.getByFrequency);
router.get('/', auth, TaskController.getAll);
router.put('/:taskId/name', auth, TaskController.updateName);
router.put('/:taskId/description', auth, TaskController.updateDescription);
router.put('/:taskId/frequency', auth, TaskController.updateFrequency);

module.exports = router;
