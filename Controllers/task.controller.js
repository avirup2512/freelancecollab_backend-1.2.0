const TaskService = require('../Services/task.service');

class TaskController {
  static async create(req, res) {
    try {
      const creator = req.user.id;
      const payload = req.body;
      payload.creator = creator;
      const r = await TaskService.createTask(payload);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error creating task' });
    }
  }

  static async update(req, res) {
    try {
      const taskId = req.params.taskId;
      const r = await TaskService.updateTask(taskId, req.body);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating task' });
    }
  }

  static async delete(req, res) {
    try {
      const taskId = req.params.taskId;
      const r = await TaskService.deleteTask(taskId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error deleting task' });
    }
  }

  static async getById(req, res) {
    try {
      const taskId = req.params.taskId;
      const t = await TaskService.getTaskById(taskId);
      res.json({ success: true, task: t });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching task' });
    }
  }

  static async getByCreator(req, res) {
    try {
      const creatorId = req.params.creatorId;
      const r = await TaskService.getTasksByCreator(creatorId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching tasks' });
    }
  }

  static async getByFrequency(req, res) {
    try {
      const frequencyId = req.params.frequencyId;
      const r = await TaskService.getTasksByFrequency(frequencyId);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching tasks' });
    }
  }

  static async getAll(req, res) {
    try {
      const limit = req.query.limit || 100;
      const offset = req.query.offset || 0;
      const r = await TaskService.getAllTasks(limit, offset);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error fetching tasks' });
    }
  }

  static async updateName(req, res) {
    try {
      const taskId = req.params.taskId;
      const { name } = req.body;
      const r = await TaskService.updateTaskName(taskId, name);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating task name' });
    }
  }

  static async updateDescription(req, res) {
    try {
      const taskId = req.params.taskId;
      const { description } = req.body;
      const r = await TaskService.updateTaskDescription(taskId, description);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating task description' });
    }
  }

  static async updateFrequency(req, res) {
    try {
      const taskId = req.params.taskId;
      const { frequency } = req.body;
      const r = await TaskService.updateTaskFrequency(taskId, frequency);
      res.json(r);
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error updating task frequency' });
    }
  }
}

module.exports = TaskController;
