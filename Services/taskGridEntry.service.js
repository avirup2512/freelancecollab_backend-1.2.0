const TaskGridEntryModel = require('../Models/taskGridEntry.model');

const TaskGridEntryService = {
  createTaskGridEntry: async (payload) => {
    if (!payload.task_grid) throw { status: 400, message: 'task_grid is required' };
    const res = await TaskGridEntryModel.create(payload);
    return { lastInsertId: res.insertId, status: 200 };
  },

  updateTaskGridEntry: async (entryId, payload) => {
    const entry = await TaskGridEntryModel.findById(entryId);
    if (!entry) throw { status: 404, message: 'Task grid entry not found' };
    await TaskGridEntryModel.update(entryId, payload);
    return { entryId, status: 200 };
  },

  deleteTaskGridEntry: async (entryId) => {
    const entry = await TaskGridEntryModel.findById(entryId);
    if (!entry) throw { status: 404, message: 'Task grid entry not found' };
    await TaskGridEntryModel.delete(entryId);
    return { entryId, deleted: true };
  },

  getTaskGridEntryById: async (entryId) => {
    const entry = await TaskGridEntryModel.findById(entryId);
    if (!entry) throw { status: 404, message: 'Task grid entry not found' };
    return entry;
  },

  getTaskGridEntriesByTaskGrid: async (taskGridId) => {
    const entries = await TaskGridEntryModel.getByTaskGrid(taskGridId);
    return { success: true, entries, count: entries.length };
  },

  getAllTaskGridEntries: async (limit = 100, offset = 0) => {
    const entries = await TaskGridEntryModel.getAll(limit, offset);
    return { success: true, entries, count: entries.length };
  },

  updateTaskGridEntryStatus: async (entryId, entry) => {
    const taskGridEntry = await TaskGridEntryModel.findById(entryId);
    if (!taskGridEntry) throw { status: 404, message: 'Task grid entry not found' };
    await TaskGridEntryModel.updateEntry(entryId, entry);
    return { entryId, entry };
  },

  updateTaskGridEntryDate: async (entryId, date) => {
    const taskGridEntry = await TaskGridEntryModel.findById(entryId);
    if (!taskGridEntry) throw { status: 404, message: 'Task grid entry not found' };
    await TaskGridEntryModel.updateDate(entryId, date);
    return { entryId, date };
  },

  getTaskGridEntriesByDate: async (taskGridId, date) => {
    const entries = await TaskGridEntryModel.getByDate(taskGridId, date);
    return { success: true, entries, count: entries.length };
  }
};

module.exports = TaskGridEntryService;
