// services/project.service.js
const ProjectModel = require('../Models/project.model');

const ProjectService = {
  // 1) Create Project
  createProject: async ({ name, description, user_id, is_public = 1, initialBoards = [] }) => {
    const res = await ProjectModel.createProject({ name, description, user_id, is_public });
    const projectId = res.insertId;

    // if initialBoards supplied (array of {name, user_id}) create board rows then link
    if (initialBoards && initialBoards.length) {
      await ProjectModel.withTransaction(async (conn) => {
        for (const b of initialBoards) {
          // create board
          const [boardRes] = await new Promise((resq, rej) =>
            conn.query(`INSERT INTO board (user_id, name, is_public, project_id) VALUES (?, ?, ?, ?)`, [b.user_id || user_id, b.name, 1, projectId], (e, r) => (e ? rej(e) : resq([r])))
          );
          const boardId = boardRes.insertId;
          // link board to project
          await ProjectModel.addBoardToProject(projectId, boardId, conn);
        }
      });
    }

    return { projectId };
  },

  // 2) Edit Project
  editProject: async (projectId, payload) => {
    await ProjectModel.updateProject(projectId, payload);
    return await ProjectModel.getProjectById(projectId);
  },

  // 3) Archive Project
  archiveProject: async (projectId) => {
    await ProjectModel.setArchiveFlag(projectId, 1);
    return { projectId, archived: true };
  },

  // 4) Delete Project
  deleteProject: async (projectId) => {
    // hard delete — alternative: set is_deleted flag
    await ProjectModel.deleteProject(projectId);
    return { projectId, deleted: true };
  },

  // 5) Add User to project (one)
  addUserToProject: async (projectId, userId, roleId = null) => {
    await ProjectModel.addUserToProject(projectId, userId, roleId);
    return { projectId, userId };
  },

  // 6) Add Users to project (multiple)
  addUsersToProject: async (projectId, userIds = [], roleId = null) => {
    if (!Array.isArray(userIds) || !userIds.length) throw { status: 400, message: 'userIds required' };
    await ProjectModel.addUsersToProjectBulk(projectId, userIds, roleId);
    return { projectId, added: userIds.length };
  },

  // 7) Change Role of a user in a project
  changeUserRoleInProject: async (projectId, userId, roleId) => {
    await ProjectModel.changeUserRoleInProject(projectId, userId, roleId);
    return { projectId, userId, roleId };
  },

  // 8) Add Board to a project
  addBoardToProject: async (projectId, boardData) => {
    // boardData can be an existing boardId or {name, user_id,...}
    if (typeof boardData === 'number') {
      // existing board id
      await ProjectModel.addBoardToProject(projectId, boardData);
      return { projectId, boardId: boardData };
    } else {
      // create board and link in a transaction
      return await ProjectModel.withTransaction(async (conn) => {
        const [boardRes] = await new Promise((res, rej) =>
          conn.query(
            `INSERT INTO board (user_id, name, create_date, is_public, project_id) VALUES (?, ?, NOW(), ?, ?)`,
            [boardData.user_id || null, boardData.name, boardData.is_public ? 1 : 0, projectId],
            (err, r) => (err ? rej(err) : res([r]))
          )
        );
        const boardId = boardRes.insertId;
        await ProjectModel.addBoardToProject(projectId, boardId, conn);
        return { projectId, boardId };
      });
    }
  },

  // 9) Assign a Team to a project (Group of Users)
  assignTeamToProject: async (projectId, teamId) => {
    // fetch team members then add them as project users
    return await ProjectModel.withTransaction(async (conn) => {
      // add entry in project_team
      await ProjectModel.assignTeamToProject(projectId, teamId, conn);

      // fetch team members and add them to project_user
      const members = await new Promise((res, rej) => {
        conn.query(
          `SELECT user_id FROM team_members WHERE team_id = ?`,
          [teamId],
          (err, rows) => (err ? rej(err) : res(rows))
        );
      });
      const memberIds = (members || []).map((m) => m.user_id);
      if (memberIds.length) {
        const memberObjs = memberIds.map((uid) => ({ user_id: uid, role_id: null }));
        await ProjectModel.addProjectUsersBulkUsingConn(
          projectId,
          memberObjs.map((m) => ({ user_id: m.user_id, role_id: m.role_id })),
          conn
        );
      }
      return { projectId, teamId, addedUsers: memberIds.length };
    });
  },

  // 10) Assign a User to a Project (alias of addUser)
  assignUserToProject: async (projectId, userId, roleId = null) => {
    await ProjectModel.addUserToProject(projectId, userId, roleId);
    return { projectId, userId };
  },

  // 11) Remove a Team from a project
  removeTeamFromProject: async (projectId, teamId) => {
    // remove project_team row, and optionally remove project_user links for those team members
    return await ProjectModel.withTransaction(async (conn) => {
      await ProjectModel.removeTeamFromProject(projectId, teamId, conn);

      // Optionally remove project users that came only from that team.
      // Simpler approach: do not remove users automatically (avoids removing users assigned individually).
      return { projectId, teamId, removed: true };
    });
  },

  // 12) Remove a User from a project
  removeUserFromProject: async (projectId, userId) => {
    await ProjectModel.removeUserFromProject(projectId, userId);
    return { projectId, userId, removed: true };
  },

  // 13) Change the role of a user in Project team (same as changeUserRoleInProject)
  changeRoleForUserInProjectTeam: async (projectId, userId, roleId) => {
    await ProjectModel.changeUserRoleInProject(projectId, userId, roleId);
    return { projectId, userId, roleId };
  },

  // 14) Add Client to a project
  addClientToProject: async (projectId, clientId) => {
    await ProjectModel.addClientToProject(projectId, clientId);
    return { projectId, clientId };
  },

  // 15) Remove Client from a project
  removeClientFromProject: async (projectId, clientId) => {
    await ProjectModel.removeClientFromProject(projectId, clientId);
    return { projectId, clientId };
  },

  // 16) Get Archive Project List With Joined Board Data By Offset and Limit (Archive Project Pagination)
  getArchivedProjectsPaginated: async (offset = 0, limit = 20) => {
    return await ProjectModel.getProjectsWithBoardsPaginated(1, offset, limit);
  },

  // 17) Get Active Project List With Joined Board Data By Offset and Limit (Active Project Pagination)
  getActiveProjectsPaginated: async (offset = 0, limit = 20) => {
    return await ProjectModel.getProjectsWithBoardsPaginated(0, offset, limit);
  },
};

module.exports = ProjectService;
