const UserTaskEntryService = require('../Services/userTaskEntry.service');

class UserTaskEntryController {
  static async create(req, res) {
    try {
      const creator = req.user.id;
      const payload = req.body;
      payload.creator = creator;
      const r = await UserTaskEntryService.createUserTaskEntry(payload);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error creating user task entry' });
    }
  }

  static async update(req, res) {
    try {
      const entryId = req.params.entryId;
      const r = await UserTaskEntryService.updateUserTaskEntry(entryId, req.body);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating user task entry' });
    }
  }

  static async delete(req, res) {
    try {
      const entryId = req.params.entryId;
      const r = await UserTaskEntryService.deleteUserTaskEntry(entryId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error deleting user task entry' });
    }
  }

  static async getById(req, res) {
    try {
      const entryId = req.params.entryId;
      const e = await UserTaskEntryService.getUserTaskEntryById(entryId);
      res.json({ success: true, entry: e });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entry' });
    }
  }

  static async getByTask(req, res) {
    try {
      const taskId = req.params.taskId;
      const r = await UserTaskEntryService.getUserTaskEntriesByTask(taskId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entries' });
    }
  }

  static async getByUser(req, res) {
    try {
      const userId = req.params.userId;
      const r = await UserTaskEntryService.getUserTaskEntriesByUser(userId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entries' });
    }
  }

  static async getByTaskAndUser(req, res) {
    try {
      const taskId = req.params.taskId;
      const userId = req.params.userId;
      const r = await UserTaskEntryService.getUserTaskEntriesByTaskAndUser(taskId, userId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entries' });
    }
  }

  static async getAll(req, res) {
    try {
      const limit = req.query.limit || 100;
      const offset = req.query.offset || 0;
      const r = await UserTaskEntryService.getAllUserTaskEntries(limit, offset);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching user task entries' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const entryId = req.params.entryId;
      const { entry } = req.body;
      const r = await UserTaskEntryService.updateUserTaskEntryStatus(entryId, entry);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating entry status' });
    }
  }

  static async updateDate(req, res) {
    try {
      const entryId = req.params.entryId;
      const { date } = req.body;
      const r = await UserTaskEntryService.updateUserTaskEntryDate(entryId, date);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating entry date' });
    }
  }

  static async getByDate(req, res) {
    try {
      const taskId = req.params.taskId;
      const userId = req.params.userId;
      const { date } = req.query;
      const r = await UserTaskEntryService.getUserTaskEntriesByDate(taskId, userId, date);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching entries by date' });
    }
  }

  static async getByDateRange(req, res) {
    try {
      const taskId = req.params.taskId;
      const userId = req.params.userId;
      const { start_date, end_date } = req.query;
      const r = await UserTaskEntryService.getUserTaskEntriesByDateRange(taskId, userId, start_date, end_date);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching entries by date range' });
    }
  }
}

module.exports = UserTaskEntryController;
