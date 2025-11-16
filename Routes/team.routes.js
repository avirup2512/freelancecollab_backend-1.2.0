const express = require('express');
const router = express.Router();
const authMiddleware = require('../MiddleWare/auth');
const teamController = require('../Controllers/team.controller');
const { requireAuth } = require("../MiddleWare/auth");
const { requireRole } = require("../MiddleWare/teamRoleMiddleware");


router.post('/create-team', authMiddleware, teamController.createTeam);
router.put('/:id', authMiddleware, teamController.editTeam);
//router.post('/:id/members', auth, teamController.manageTeamMembers);
router.put('/:id/role', authMiddleware, teamController.updateUserRole);
//router.delete('/:id', auth, teamController.deleteTeam);
router.put('/:id/toggle', authMiddleware, teamController.toggleTeamActive);
router.get('/creator', authMiddleware, teamController.getTeamsByCreator);
router.get('/project/:projectId', authMiddleware, teamController.getTeamsByProject);
//router.get('/:id', auth, teamController.getTeamById);

// send invite (owner/admin only)
router.post('/:teamId/invite', authMiddleware, teamController.sendInvite);

// list invites for team (owner/admin)
router.get('/:teamId/invites', authMiddleware, teamController.listInvites);

// revoke invite
router.delete('/invite/:inviteId', authMiddleware, teamController.revokeInvite);

// accept invite (logged-in user)
router.post('/invite/accept', authMiddleware, teamController.acceptInvite);

// decline invite
router.post('/invite/decline', authMiddleware, teamController.declineInvite);


router.post("/:teamId/addUser", authMiddleware, requireRole("admin"), teamController.manageTeamMembers);

// Only owner can delete team
router.delete("/:teamId", authMiddleware, requireRole("owner"), teamController.deleteTeam);

// Members or higher can view team data
router.get("/:teamId", authMiddleware, requireRole("member"), teamController.getTeamById);

module.exports = router;
