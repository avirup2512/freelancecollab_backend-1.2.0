const projectPermission = require("../MiddleWare/project.middleware");

// routes/project.routes.js
const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/project.controller');
const authMiddleware = require('../MiddleWare/auth');
// optional role middleware: const { requireRole } = require('../middleware/teamRoleMiddleware');

router.post('/', authMiddleware, ProjectController.createProject); // create
router.put('/:projectId',projectPermission(["owner", "admin"]), authMiddleware, ProjectController.editProject); // edit
router.put('/:projectId/archive', authMiddleware, ProjectController.archiveProject); // archive
router.delete('/:projectId', authMiddleware, ProjectController.deleteProject); // delete

router.post('/:projectId/users/add', authMiddleware, ProjectController.addUserToProject); // single add
router.post('/:projectId/users/add-multiple', authMiddleware, ProjectController.addUsersToProject); // multiple
router.put('/:projectId/users/role', authMiddleware, ProjectController.changeUserRole); // change role
router.post('/:projectId/boards', authMiddleware, ProjectController.addBoardToProject); // add board

router.post('/:projectId/team', authMiddleware, ProjectController.assignTeamToProject); // assign team
router.delete('/:projectId/team',projectPermission(["owner", "admin"]), authMiddleware, ProjectController.removeTeamFromProject); // remove team

router.post('/:projectId/assign-user', authMiddleware, ProjectController.assignUserToProject); // assign user
router.delete('/:projectId/users/remove', authMiddleware, ProjectController.removeUserFromProject); // remove user
router.put('/:projectId/users/change-role', authMiddleware, ProjectController.changeRoleInProjectTeam); // change role in project

router.post('/:projectId/client', authMiddleware, ProjectController.addClientToProject); // add client
router.delete('/:projectId/client', authMiddleware, ProjectController.removeClientFromProject); // remove client

router.get('/archived', authMiddleware,projectPermission(["any"]), ProjectController.getArchivedProjects); // ?offset=0&limit=20
router.get('/active', authMiddleware,projectPermission(["any"]), ProjectController.getActiveProjects); // ?offset=0&limit=20

module.exports = router;
