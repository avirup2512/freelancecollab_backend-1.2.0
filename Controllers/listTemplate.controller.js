const service = require("../services/listTemplate.service");

module.exports = {
    createTemplate: async (req, res) => {
        const { listId } = req.params;
        const { name } = req.body;
        const userId = req.user.id;

        const templateId = await service.saveListAsTemplate(userId, listId, name);

        res.json({
            message: "Template saved",
            templateId
        });
    },

    applyTemplate: async (req, res) => {
        const { boardId, templateId } = req.params;

        const listId = await service.applyTemplateToBoard(boardId, templateId);

        res.json({
            message: "Template applied",
            listId
        });
    }
};
