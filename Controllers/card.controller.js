const CardService = require('../Services/card.service');

class CardController {
  static async create(req, res) {
    try {
      const payload = req.body;
      payload.user_id = req.user.id;
      const r = await CardService.createCard(payload);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error creating card' });
    }
  }

  static async update(req, res) {
    try {
      const cardId = req.params.cardId;
      const r = await CardService.updateCard(cardId, req.body);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating card' });
    }
  }

  static async delete(req, res) {
    try {
      const cardId = req.params.cardId;
      const r = await CardService.deleteCard(cardId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error deleting card' });
    }
  }

  static async getById(req, res) {
    try {
      const cardId = req.params.cardId;
      const c = await CardService.getCardById(cardId);
      res.json({ success: true, card: c });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching card' });
    }
  }

  static async move(req, res) {
    try {
      const cardId = req.params.cardId;
      const { list_id, position } = req.body;
      const r = await CardService.moveCard(cardId, list_id, position);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error moving card' });
    }
  }

  static async assignUser(req, res) {
    try {
      const cardId = req.params.cardId;
      const { user_id } = req.body;
      const r = await CardService.assignUserToCard(cardId, user_id);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error assigning user' });
    }
  }

  static async listByList(req, res) {
    try {
      const listId = req.params.listId;
      const includeArchived = req.query.includeArchived === '1' || req.query.includeArchived === 'true';
      const limit = req.query.limit || 100;
      const offset = req.query.offset || 0;
      const r = await CardService.listCardsByList(listId, includeArchived, limit, offset);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error listing cards' });
    }
  }
}

module.exports = CardController;