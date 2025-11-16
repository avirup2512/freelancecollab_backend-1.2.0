const teamService = require('../services/team.service');
const response = require('../Class/response');
const error = require('../Class/error');

exports.createTeam = async (req, res) => {
  try {
    const data = await teamService.createTeam(req.body, req.user.id);
    response.success(res, data, "Team created successfully");
  } catch (err) {
    error.handler(res, err);
  }
};

exports.editTeam = async (req, res) => {
  try {
    const data = await teamService.editTeam(req.params.id, req.body, req.user.id);
    response.success(res, data, "Team updated");
  } catch (err) {
    error.handler(res, err);
  }
};

exports.manageTeamMembers = async (req, res) => {
  try {
    const data = await teamService.manageTeamMembers(req.params.id, req.body);
    response.success(res, data, "Team members updated");
  } catch (err) {
    error.handler(res, err);
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const data = await teamService.updateUserRole(req.params.id, req.body.userId, req.body.role);
    response.success(res, data, "User role updated");
  } catch (err) {
    error.handler(res, err);
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    await teamService.deleteTeam(req.params.id);
    response.success(res, null, "Team deleted");
  } catch (err) {
    error.handler(res, err);
  }
};

exports.toggleTeamActive = async (req, res) => {
  try {
    const data = await teamService.toggleTeamActive(req.params.id);
    response.success(res, data, "Team status changed");
  } catch (err) {
    error.handler(res, err);
  }
};

exports.getTeamsByCreator = async (req, res) => {
  try {
    const data = await teamService.getTeamsByCreator(req.user.id);
    response.success(res, data);
  } catch (err) {
    error.handler(res, err);
  }
};

exports.getTeamsByProject = async (req, res) => {
  try {
    const data = await teamService.getTeamsByProject(req.params.projectId);
    response.success(res, data);
  } catch (err) {
    error.handler(res, err);
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const data = await teamService.getTeamById(req.params.id);
    response.success(res, data);
  } catch (err) {
    error.handler(res, err);
  }
};
exports.sendInvite = async (req, res) => {
  try {
    const inviterId = req.user.id;
    const teamId = parseInt(req.params.teamId, 10);
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success:false, message: 'invitee email required' });

    const result = await TeamInviteService.sendInvite(teamId, inviterId, email, role || 'member');
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success:false, message: err.message || 'Server error' });
  }
};

exports.listInvites = async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    const requesterId = req.user.id;
    const invites = await TeamInviteService.listInvitesForTeam(teamId, requesterId);
    return res.json({ success: true, invites });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success:false, message: err.message || 'Server error' });
  }
};

exports.revokeInvite = async (req, res) => {
  try {
    const inviteId = parseInt(req.params.inviteId, 10);
    const requesterId = req.user.id;
    const result = await TeamInviteService.revokeInvite(inviteId, requesterId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success:false, message: err.message || 'Server error' });
  }
};

// Accept invite - must be authenticated user with same email as invite
exports.acceptInvite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId, token } = req.body;
    if (!inviteId || !token) return res.status(400).json({ success:false, message: 'inviteId and token required' });
    const result = await TeamInviteService.acceptInvite(inviteId, token, userId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success:false, message: err.message || 'Server error' });
  }
};

exports.declineInvite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId } = req.body;
    if (!inviteId) return res.status(400).json({ success:false, message: 'inviteId required' });
    const result = await TeamInviteService.declineInvite(inviteId, userId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ success:false, message: err.message || 'Server error' });
  }
};