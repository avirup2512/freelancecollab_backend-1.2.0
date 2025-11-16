const db = require("../DB/db");

module.exports = {
    createTemplate: async (userId, name) => {
        const [result] = await db.query(`
            INSERT INTO list_template (user_id, name)
            VALUES (?, ?)
        `, [userId, name]);

        return result.insertId;
    },

    addTemplateCard: async (templateId, title, position) => {
        await db.query(`
            INSERT INTO template_card (template_id, title, position)
            VALUES (?, ?, ?)
        `, [templateId, title, position]);
    },

    getCardsOfList: async (listId) => {
        const [rows] = await db.query(`
            SELECT id, title, position 
            FROM card 
            WHERE list_id = ? AND deleted_at IS NULL
            ORDER BY position ASC
        `, [listId]);

        return rows;
    },

    getTemplateCards: async (templateId) => {
        const [rows] = await db.query(`
            SELECT title, position 
            FROM template_card
            WHERE template_id = ?
        `, [templateId]);

        return rows;
    }
};
