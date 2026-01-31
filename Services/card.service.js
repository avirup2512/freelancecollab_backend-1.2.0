const CardModel = require('../Models/card.model');

const CardService = {
  createCard: async (payload) => {
    if (!payload.listId || !payload.name) throw { status: 400, message: 'list_id and name required' };
    const res = await CardModel.create(payload);
    return { lastInsertCardId: res.insertId, status: 200 };
  },

  updateCard: async (cardId, payload) => {
    await CardModel.update(cardId, payload);
    return { cardId, status: 200 };
  },

  deleteCard: async (cardId) => {
    await CardModel.softDelete(cardId);
    return { cardId, deleted: true };
  },

  getCardById: async (cardId) => {
    const c = await CardModel.findById(cardId);
    if (!c) throw { status: 404, message: 'Card not found' };
    return c;
  },

  moveCard: async (cardId, newListId, newPosition) => {
    await CardModel.move(cardId, newListId, newPosition);
    return { cardId, listId: newListId, position: newPosition };
  },

  assignUserToCard: async (cardId, userId) => {
    await CardModel.assignUser(cardId, userId);
    return { cardId, userId };
  },

  listCardsByList: async (listId, includeArchived = false, limit = 100, offset = 0) => {
    const cards = await CardModel.listByListId(listId, includeArchived, limit, offset);
    return { success: true, cards, count: cards.length };
  }
};

module.exports = CardService;