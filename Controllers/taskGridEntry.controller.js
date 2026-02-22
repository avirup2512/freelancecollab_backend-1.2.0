const TaskGridEntryService = require('../Services/taskGridEntry.service');

class TaskGridEntryController {
  static async create(req, res) {
    try {
      const payload = req.body;
      const r = await TaskGridEntryService.createTaskGridEntry(payload);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error creating task grid entry' });
    }
  }

  static async update(req, res) {
    try {
      const entryId = req.params.entryId;
      const r = await TaskGridEntryService.updateTaskGridEntry(entryId, req.body);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating task grid entry' });
    }
  }

  static async delete(req, res) {
    try {
      const entryId = req.params.entryId;
      const r = await TaskGridEntryService.deleteTaskGridEntry(entryId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error deleting task grid entry' });
    }
  }

  static async getById(req, res) {
    try {
      const entryId = req.params.entryId;
      const e = await TaskGridEntryService.getTaskGridEntryById(entryId);
      res.json({ success: true, entry: e });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching task grid entry' });
    }
  }

  static async getByTaskGrid(req, res) {
    try {
      const gridId = req.params.gridId;
      const r = await TaskGridEntryService.getTaskGridEntriesByTaskGrid(gridId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching task grid entries' });
    }
  }

  static async getAll(req, res) {
    try {
      const limit = req.query.limit || 100;
      const offset = req.query.offset || 0;
      const r = await TaskGridEntryService.getAllTaskGridEntries(limit, offset);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching task grid entries' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const entryId = req.params.entryId;
      const { entry } = req.body;
      const r = await TaskGridEntryService.updateTaskGridEntryStatus(entryId, entry);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating entry status' });
    }
  }

  static async updateDate(req, res) {
    try {
      const entryId = req.params.entryId;
      const { date } = req.body;
      const r = await TaskGridEntryService.updateTaskGridEntryDate(entryId, date);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating entry date' });
    }
  }

  static async getByDate(req, res) {
    try {
      const gridId = req.params.gridId;
      const { date } = req.query;
      const r = await TaskGridEntryService.getTaskGridEntriesByDate(gridId, date);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching entries by date' });
    }
  }
}

module.exports = TaskGridEntryController;
