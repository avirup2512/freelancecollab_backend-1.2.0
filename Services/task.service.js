const TaskModel = require('../Models/task.model');
const TaskGridModel = require('../Models/taskGrid.model');

const TaskService = {
  createTask: async (payload) => {
    console.log(payload);
    
    if (!payload.creator || !payload.name || !payload.description || !payload.frequency) 
      throw { status: 400, message: 'creator, name, description, and frequency are required' };
    const res = await TaskModel.create(payload);
    const taskId = res.insertId;
    // Create task grid for the new task
    const gridPayload = {
      task: taskId,
      start_date: new Date(payload.startDate)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ") || null,
      end_date: new Date(payload.endDate)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ") || null
    };
    await TaskGridModel.create(gridPayload);
    return { lastInsertTaskId: taskId, status: 200 };
  },

  updateTask: async (taskId, payload) => {
    const task = await TaskModel.findById(taskId);
    if (!task) throw { status: 404, message: 'Task not found' };
    await TaskModel.update(taskId, payload);
    return { taskId, status: 200 };
  },

  deleteTask: async (taskId) => {
    const task = await TaskModel.findById(taskId);
    if (!task) throw { status: 404, message: 'Task not found' };
    await TaskModel.delete(taskId);
    return { taskId, deleted: true };
  },

  getTaskById: async (taskId) => {
    const task = await TaskModel.findById(taskId);
    if (!task) throw { status: 404, message: 'Task not found' };
    return task;
  },

  getTasksByCreator: async (creatorId) => {
    const tasks = await TaskModel.getByCreator(creatorId);
    return { success: true, tasks, count: tasks.length };
  },

  getTasksByFrequency: async (frequencyId) => {
    const tasks = await TaskModel.getByFrequency(frequencyId);
    return { success: true, tasks, count: tasks.length };
  },

  getAllTasks: async (limit = 100, offset = 0) => {
    try {
      const tasks = await TaskModel.getAllTaskWithGrid(limit, offset);
      console.log(tasks);
      return { success: true, tasks, count: tasks.length };
    } catch (error) {
      console.log(error);
    }
  },

  updateTaskName: async (taskId, name) => {
    const task = await TaskModel.findById(taskId);
    if (!task) throw { status: 404, message: 'Task not found' };
    await TaskModel.updateName(taskId, name);
    return { taskId, name };
  },

  updateTaskDescription: async (taskId, description) => {
    const task = await TaskModel.findById(taskId);
    if (!task) throw { status: 404, message: 'Task not found' };
    await TaskModel.updateDescription(taskId, description);
    return { taskId, description };
  },

  updateTaskFrequency: async (taskId, frequencyId) => {
    const task = await TaskModel.findById(taskId);
    if (!task) throw { status: 404, message: 'Task not found' };
    await TaskModel.updateFrequency(taskId, frequencyId);
    return { taskId, frequencyId };
  }
};

module.exports = TaskService;
