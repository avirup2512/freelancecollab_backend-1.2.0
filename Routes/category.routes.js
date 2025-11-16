// routes/category.routes.js
const express = require("express");
const router = express.Router();

const CategoryController = require("../Controllers/category.controller");
const authMiddleware = require("../Middleware/auth");

// protected routes
router.post("/", authMiddleware, CategoryController.addCategory);
router.put("/:id", authMiddleware, CategoryController.editCategory);
router.delete("/:id", authMiddleware, CategoryController.deleteCategory);

router.get("/", authMiddleware, CategoryController.getAllCategories);
router.get("/:id", authMiddleware, CategoryController.getCategoryById);

module.exports = router;
