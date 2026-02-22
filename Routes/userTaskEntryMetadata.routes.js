const router = require('express').Router();
const UserTaskEntryMetadataController = require('../Controllers/userTaskEntryMetadata.controller');
const auth = require('../MiddleWare/auth');

router.post('/', auth, UserTaskEntryMetadataController.create);
router.put('/:metadataId', auth, UserTaskEntryMetadataController.update);
router.delete('/:metadataId', auth, UserTaskEntryMetadataController.delete);
router.get('/:metadataId', auth, UserTaskEntryMetadataController.getById);
router.get('/entry/:entryId', auth, UserTaskEntryMetadataController.getByUserTaskEntry);
router.get('/', auth, UserTaskEntryMetadataController.getAll);
router.put('/:metadataId/value', auth, UserTaskEntryMetadataController.updateMetadata);

module.exports = router;
