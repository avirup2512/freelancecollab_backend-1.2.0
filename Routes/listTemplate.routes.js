const router = require("express").Router();
const controller = require("../Controllers/listTemplate.controller");
const auth = require("../Middleware/auth");

router.post("/list/:listId/template", auth, controller.createTemplate);
router.post("/board/:boardId/template/:templateId", auth, controller.applyTemplate);

module.exports = router;
