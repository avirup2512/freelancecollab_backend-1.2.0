const TemplateModel = require("../models/listTemplate.model");

module.exports = {
    saveListAsTemplate: async (userId, listId, name) => {
        const templateId = await TemplateModel.createTemplate(userId, name);

        const cards = await TemplateModel.getCardsOfList(listId);

        for (const card of cards) {
            await TemplateModel.addTemplateCard(templateId, card.title, card.position);
        }

        return templateId;
    },

    applyTemplateToBoard: async (boardId, templateId) => {
        const db = require("../db/connection");

        const [listInsert] = await db.query(`
            INSERT INTO list (board_id, name, position)
            VALUES (?, 'List From Template', 999)
        `, [boardId]);

        const listId = listInsert.insertId;

        const cards = await TemplateModel.getTemplateCards(templateId);

        for (const card of cards) {
            await db.query(`
                INSERT INTO card (list_id, title, position)
                VALUES (?, ?, ?)
            `, [listId, card.title, card.position]);
        }

        return listId;
    }
};
