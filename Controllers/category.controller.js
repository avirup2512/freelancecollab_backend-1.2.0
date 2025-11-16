// controllers/category.controller.js
const Category = require("../Models/category.model");

const CategoryController = {

    addCategory: async (req, res) => {
        try {
            const { name } = req.body;
            const userId = req.user.id; // from JWT

            if (!name) {
                return res.status(400).json({ message: "Category name is required" });
            }

            await Category.create(name, userId);

            return res.json({ message: "Category created successfully" });
        } catch (error) {
            console.error("Add Category Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    editCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const [category] = await Category.findById(id);
            if (category.length === 0) {
                return res.status(404).json({ message: "Category not found" });
            }

            await Category.update(id, name);

            return res.json({ message: "Category updated successfully" });

        } catch (error) {
            console.error("Edit Category Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const [category] = await Category.findById(id);
            if (category.length === 0) {
                return res.status(404).json({ message: "Category not found" });
            }

            await Category.delete(id);

            return res.json({ message: "Category deleted successfully" });
        } catch (error) {
            console.error("Delete Category Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const { id } = req.params;

            const [category] = await Category.findById(id);
            if (category.length === 0) {
                return res.status(404).json({ message: "Category not found" });
            }

            return res.json(category[0]);
        } catch (error) {
            console.error("Get Category Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    getAllCategories: async (req, res) => {
        console.log("JI");
        
        try {
            const categories = await Category.findAll();
            console.log(categories);
            
            return res.json(categories);
        } catch (error) {
            console.error("Get Categories Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = CategoryController;
