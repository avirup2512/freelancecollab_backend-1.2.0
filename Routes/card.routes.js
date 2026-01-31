const router = require('express').Router();
const CardController = require('../Controllers/card.controller');
const auth = require('../MiddleWare/auth');

router.post('/', auth, CardController.create);
router.put('/:cardId', auth, CardController.update);
router.delete('/:cardId', auth, CardController.delete);
router.get('/:cardId', auth, CardController.getById);
router.post('/:cardId/move', auth, CardController.move);
router.post('/:cardId/assign', auth, CardController.assignUser);
router.get('/list/:listId', auth, CardController.listByList);

module.exports = router;