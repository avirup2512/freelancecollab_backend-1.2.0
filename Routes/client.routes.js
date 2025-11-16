const express = require("express");
const router = express.Router();
const ClientController = require("../Controllers/client.controller");
const authMiddleware = require("../MiddleWare/auth"); // JWT auth middleware

router.post("/", authMiddleware, ClientController.create);
router.put("/:id", authMiddleware, ClientController.update);
router.delete("/:id", authMiddleware, ClientController.delete);
router.put("/:id/role", authMiddleware, ClientController.changeRole);
router.get("/:id", authMiddleware, ClientController.getById);
router.get("/:id/projects", authMiddleware, ClientController.getProjects);

module.exports = router;
