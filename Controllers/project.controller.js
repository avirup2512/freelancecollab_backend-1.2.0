// controllers/project.controller.js
const ProjectService = require('../Services/project.service');

const ProjectController = {
  createProject: async (req, res) => {
    try {
      const payload = req.body;
      payload.user_id = req.user.id; // creator
      const r = await ProjectService.createProject(payload);
      res.json({ success: true, data: r, status:200 });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  editProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const r = await ProjectService.editProject(projectId, req.body);
      res.json({ success: true, data: r ,status:200});
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  archiveProject: async (req, res) => {
    try {
      const { projectId, projectIds, archive } = req.body || {};
      const target = Array.isArray(projectIds) ? projectIds : (projectId !== undefined ? parseInt(projectId, 10) : null);
      if (!target || (Array.isArray(target) && !target.length)) throw { status: 400, message: 'projectId or projectIds required' };
      const r = await ProjectService.archiveProject(target, archive);
      res.json({ success: true, data: r,status:200 });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  deleteProject: async (req, res) => {
    try {
      console.log(req.body);
      
      let projectId = req.body.projectId;
      // Handle both single ID and array of IDs
      if (Array.isArray(projectId)) {
        projectId = projectId.map(id => parseInt(id, 10));
      } else {
        projectId = parseInt(projectId, 10);
      }
      console.log(projectId);
      
      const r = await ProjectService.deleteProject(projectId);
      res.json({ success: true, data: r, status: 200 });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  addUserToProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { userId, roleId } = req.body;
      const r = await ProjectService.addUserToProject(projectId, userId, roleId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  addUsersToProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { userIds, roleId } = req.body;
      const r = await ProjectService.addUsersToProject(projectId, userIds, roleId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  changeUserRole: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { userId, roleId } = req.body;
      const r = await ProjectService.changeUserRoleInProject(projectId, userId, roleId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  addBoardToProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const boardData = req.body.boardId || req.body; // either boardId number or board object
      const r = await ProjectService.addBoardToProject(projectId, boardData);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  assignTeamToProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { teamId } = req.body;
      const r = await ProjectService.assignTeamToProject(projectId, teamId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  assignUserToProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { userId, roleId } = req.body;
      const r = await ProjectService.assignUserToProject(projectId, userId, roleId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  removeTeamFromProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { teamId } = req.body;
      const r = await ProjectService.removeTeamFromProject(projectId, teamId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  removeUserFromProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { userId } = req.body;
      const r = await ProjectService.removeUserFromProject(projectId, userId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  changeRoleInProjectTeam: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { userId, roleId } = req.body;
      const r = await ProjectService.changeRoleForUserInProjectTeam(projectId, userId, roleId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  addClientToProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { clientId } = req.body;
      const r = await ProjectService.addClientToProject(projectId, clientId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  removeClientFromProject: async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const { clientId } = req.body;
      const r = await ProjectService.removeClientFromProject(projectId, clientId);
      res.json({ success: true, data: r });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  getArchivedProjects: async (req, res) => {
    try {
      const offset = parseInt(req.query.offset || '0', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const r = await ProjectService.getArchivedProjectsPaginated(offset, limit);
      res.json({ success: true, data: r, status:200 });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  getActiveProjects: async (req, res) => {
    try {
      const offset = parseInt(req.query.offset || '0', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const r = await ProjectService.getActiveProjectsPaginated(offset, limit);
      res.json({ success: true, data: r, status:200 });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },
};

module.exports = ProjectController;
