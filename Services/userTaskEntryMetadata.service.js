const UserTaskEntryMetadataModel = require('../Models/userTaskEntryMetadata.model');

const UserTaskEntryMetadataService = {
  createUserTaskEntryMetadata: async (payload) => {
    if (!payload.user_task_entry || !payload.metadata) throw { status: 400, message: 'user_task_entry and metadata are required' };
    const res = await UserTaskEntryMetadataModel.create(payload);
    return { lastInsertId: res.insertId, status: 200 };
  },

  updateUserTaskEntryMetadata: async (metadataId, payload) => {
    const metadata = await UserTaskEntryMetadataModel.findById(metadataId);
    if (!metadata) throw { status: 404, message: 'User task entry metadata not found' };
    await UserTaskEntryMetadataModel.update(metadataId, payload);
    return { metadataId, status: 200 };
  },

  deleteUserTaskEntryMetadata: async (metadataId) => {
    const metadata = await UserTaskEntryMetadataModel.findById(metadataId);
    if (!metadata) throw { status: 404, message: 'User task entry metadata not found' };
    await UserTaskEntryMetadataModel.delete(metadataId);
    return { metadataId, deleted: true };
  },

  getUserTaskEntryMetadataById: async (metadataId) => {
    const metadata = await UserTaskEntryMetadataModel.findById(metadataId);
    if (!metadata) throw { status: 404, message: 'User task entry metadata not found' };
    return metadata;
  },

  getUserTaskEntryMetadataByUserTaskEntry: async (userTaskEntryId) => {
    const metadata = await UserTaskEntryMetadataModel.getByUserTaskEntry(userTaskEntryId);
    return { success: true, metadata, count: metadata.length };
  },

  getAllUserTaskEntryMetadata: async (limit = 100, offset = 0) => {
    const metadata = await UserTaskEntryMetadataModel.getAll(limit, offset);
    return { success: true, metadata, count: metadata.length };
  },

  updateUserTaskEntryMetadataValue: async (metadataId, metadataValue) => {
    const metadata = await UserTaskEntryMetadataModel.findById(metadataId);
    if (!metadata) throw { status: 404, message: 'User task entry metadata not found' };
    await UserTaskEntryMetadataModel.updateMetadata(metadataId, metadataValue);
    return { metadataId, metadata: metadataValue };
  }
};

module.exports = UserTaskEntryMetadataService;
