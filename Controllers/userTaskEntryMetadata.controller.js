const UserTaskEntryMetadataService = require('../Services/userTaskEntryMetadata.service');

class UserTaskEntryMetadataController {
  static async create(req, res) {
    try {
      const payload = req.body;
      const r = await UserTaskEntryMetadataService.createUserTaskEntryMetadata(payload);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error creating user task entry metadata' });
    }
  }

  static async update(req, res) {
    try {
      const metadataId = req.params.metadataId;
      const r = await UserTaskEntryMetadataService.updateUserTaskEntryMetadata(metadataId, req.body);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating user task entry metadata' });
    }
  }

  static async delete(req, res) {
    try {
      const metadataId = req.params.metadataId;
      const r = await UserTaskEntryMetadataService.deleteUserTaskEntryMetadata(metadataId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error deleting user task entry metadata' });
    }
  }

  static async getById(req, res) {
    try {
      const metadataId = req.params.metadataId;
      const m = await UserTaskEntryMetadataService.getUserTaskEntryMetadataById(metadataId);
      res.json({ success: true, metadata: m });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entry metadata' });
    }
  }

  static async getByUserTaskEntry(req, res) {
    try {
      const entryId = req.params.entryId;
      const r = await UserTaskEntryMetadataService.getUserTaskEntryMetadataByUserTaskEntry(entryId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entry metadata' });
    }
  }

  static async getAll(req, res) {
    try {
      const limit = req.query.limit || 100;
      const offset = req.query.offset || 0;
      const r = await UserTaskEntryMetadataService.getAllUserTaskEntryMetadata(limit, offset);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entry metadata' });
    }
  }

  static async updateMetadata(req, res) {
    try {
      const metadataId = req.params.metadataId;
      const { metadata } = req.body;
      const r = await UserTaskEntryMetadataService.updateUserTaskEntryMetadataValue(metadataId, metadata);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating metadata' });
    }
  }
}

module.exports = UserTaskEntryMetadataController;
