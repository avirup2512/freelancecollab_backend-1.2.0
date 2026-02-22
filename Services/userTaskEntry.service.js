const UserTaskEntryModel = require('../Models/userTaskEntry.model');
const UserTaskEntryMetadataService = require("../Services/userTaskEntryMetadata.service");
const UserTaskEntryService = {
  createUserTaskEntry: async (payload) => {
    payload.date = new Date(payload.date)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    if (!payload.taskId || !payload.creator) throw { status: 400, message: 'task and user are required' };
    const res = await UserTaskEntryModel.create(payload);
    const metadata = await UserTaskEntryMetadataService.createUserTaskEntryMetadata({user_task_entry:res.insertId, metadata:payload.type});
    const metadata2 = await UserTaskEntryMetadataService.createUserTaskEntryMetadata({user_task_entry:res.insertId, metadata:payload.description, parent:metadata.lastInsertId});
    return { lastInsertId: res.insertId, status: 200 };
  },

  updateUserTaskEntry: async (entryId, payload) => {
    const entry = await UserTaskEntryModel.findById(entryId);
    if (!entry) throw { status: 404, message: 'User task entry not found' };
    await UserTaskEntryModel.update(entryId, payload);
    return { entryId, status: 200 };
  },

  deleteUserTaskEntry: async (entryId) => {
    const entry = await UserTaskEntryModel.findById(entryId);
    if (!entry) throw { status: 404, message: 'User task entry not found' };
    await UserTaskEntryModel.delete(entryId);
    return { entryId, deleted: true };
  },

  getUserTaskEntryById: async (entryId) => {
    const entry = await UserTaskEntryModel.findById(entryId);
    if (!entry) throw { status: 404, message: 'User task entry not found' };
    return entry;
  },

  getUserTaskEntriesByTask: async (taskId) => {
    const entries = await UserTaskEntryModel.getByTask(taskId);
    return { success: true, entries, count: entries.length };
  },

  getUserTaskEntriesByUser: async (userId) => {
    const entries = await UserTaskEntryModel.getByUser(userId);
    return { success: true, entries, count: entries.length };
  },

  getUserTaskEntriesByTaskAndUser: async (taskId, userId) => {
    const entries = await UserTaskEntryModel.getByTaskAndUser(taskId, userId);
    return { success: true, entries, count: entries.length };
  },

  getAllUserTaskEntries: async (limit = 100, offset = 0) => {
    const entries = await UserTaskEntryModel.getAll(limit, offset);
    return { success: true, entries, count: entries.length };
  },

  updateUserTaskEntryStatus: async (entryId, entry) => {
    const userTaskEntry = await UserTaskEntryModel.findById(entryId);
    if (!userTaskEntry) throw { status: 404, message: 'User task entry not found' };
    await UserTaskEntryModel.updateEntry(entryId, entry);
    return { entryId, entry };
  },

  updateUserTaskEntryDate: async (entryId, date) => {
    const userTaskEntry = await UserTaskEntryModel.findById(entryId);
    if (!userTaskEntry) throw { status: 404, message: 'User task entry not found' };
    await UserTaskEntryModel.updateDate(entryId, date);
    return { entryId, date };
  },

  getUserTaskEntriesByDate: async (taskId, userId, date) => {
    const entries = await UserTaskEntryModel.getByDate(taskId, userId, date);
    return { success: true, entries, count: entries.length };
  },

  getUserTaskEntriesByDateRange: async (taskId, userId, startDate, endDate) => {
    const entries = await UserTaskEntryModel.getByDateRange(taskId, userId, startDate, endDate);
    return { success: true, entries, count: entries.length };
  }
};

module.exports = UserTaskEntryService;
