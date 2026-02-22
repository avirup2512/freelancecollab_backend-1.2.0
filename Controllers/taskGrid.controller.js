const TaskGridService = require('../Services/taskGrid.service');

class TaskGridController {
  static async create(req, res) {
    try {
      const payload = req.body;
      const r = await TaskGridService.createTaskGrid(payload);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error creating task grid' });
    }
  }

  static async update(req, res) {
    try {
      const gridId = req.params.gridId;
      const r = await TaskGridService.updateTaskGrid(gridId, req.body);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating task grid' });
    }
  }

  static async delete(req, res) {
    try {
      const gridId = req.params.gridId;
      const r = await TaskGridService.deleteTaskGrid(gridId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error deleting task grid' });
    }
  }

  static async getById(req, res) {
    try {
      const gridId = req.params.gridId;
      const g = await TaskGridService.getTaskGridById(gridId);
      res.json({ success: true, taskGrid: g });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching task grid' });
    }
  }

  static async getByTask(req, res) {
    try {
      const taskId = req.params.taskId;
      const r = await TaskGridService.getTaskGridsByTask(taskId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching task grids' });
    }
  }

  static async getAll(req, res) {
    try {
      const limit = req.query.limit || 100;
      const offset = req.query.offset || 0;
      const r = await TaskGridService.getAllTaskGrids(limit, offset);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching task grids' });
    }
  }

  static async updateTask(req, res) {
    try {
      const gridId = req.params.gridId;
      const { task } = req.body;
      const r = await TaskGridService.updateTaskGridTask(gridId, task);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating task' });
    }
  }

  static async updateStartDate(req, res) {
    try {
      const gridId = req.params.gridId;
      const { start_date } = req.body;
      const r = await TaskGridService.updateTaskGridStartDate(gridId, start_date);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating start date' });
    }
  }

  static async updateEndDate(req, res) {
    try {
      const gridId = req.params.gridId;
      const { end_date } = req.body;
      const r = await TaskGridService.updateTaskGridEndDate(gridId, end_date);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating end date' });
    }
  }
}

module.exports = TaskGridController;
