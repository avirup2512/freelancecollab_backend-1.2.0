// services/teamInvite.service.js
const TeamInviteModel = require('../models/teamInvite.model');
const TeamModel = require('../models/team.model'); // assumes file exists with getTeamById, getMemberRole, addMember methods
const UserModel = require('../models/user.model');
const { randomTokenHex, hashString, compareHash, sendEmail } = require('../utils/utils');
require('dotenv').config();

const HOURS = parseInt(process.env.TEAM_INVITE_EXPIRE_HOURS || '72', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const RoleHierarchy = { owner: 3, admin: 2, member: 1 };

function canInvite(inviterRole) {
  // only owner or admin can invite, admins can invite up to 'member' (not admin/owner)
  return inviterRole === 'owner' || inviterRole === 'admin';
}

async function checkInviterPermission(teamId, inviterId) {
  // Ensure inviter is owner or admin on team
  const role = await TeamModel.getMemberRole(teamId, inviterId); // should return role or null
  if (!role) throw { status: 403, message: 'Not a member of the team' };
  if (!canInvite(role)) throw { status: 403, message: 'Insufficient permission to invite' };
  return role;
}

const TeamInviteService = {
  sendInvite: async (teamId, inviterId, inviteeEmail, role = 'member') => {
    // 1) permission check
    const inviterRole = await checkInviterPermission(teamId, inviterId);

    // admin cannot invite admin/owner
    if (inviterRole === 'admin' && RoleHierarchy[role] >= RoleHierarchy['admin']) {
      throw { status: 403, message: 'Admins can only invite members' };
    }

    // 2) generate raw token + hashed token
    const rawToken = randomTokenHex(24);
    const tokenHash = await hashString(rawToken);

    // expires_at
    const expires_at = new Date(Date.now() + HOURS * 60 * 60 * 1000);

    // 3) insert invite
    await TeamInviteModel.insertInvite({
      team_id: teamId,
      inviter_id: inviterId,
      invitee_email: inviteeEmail,
      role,
      tokenHash,
      expires_at,
    });

    // 4) email invite
    const acceptUrl = `${FRONTEND_URL}/team-invite/accept?inviteId=%ID%&token=${rawToken}`; 
    // We don't know insertId until fetch; fetch by team+email to get latest invite id:
    const invRecord = await TeamInviteModel.findByTeamAndEmailActive(teamId, inviteeEmail);
    const inviteId = invRecord ? invRecord.id : null;
    const finalAcceptUrl = inviteId ? acceptUrl.replace('%ID%', inviteId) : `${FRONTEND_URL}/team-invite`;

    const team = await TeamModel.getTeamById(teamId); // minimal info
    const subject = `${team.name} - Team invitation`;
    const html = `
      <p>You have been invited to join the team "<strong>${team.name}</strong>" as <strong>${role}</strong>.</p>
      <p>Click here to accept: <a href="${finalAcceptUrl}">Accept invite</a></p>
      <p>If you don't have an account, please register with this email, then accept the invite after login.</p>
      <p>If you did not expect this email, ignore it.</p>
    `;

    try {
      await sendEmail({ to: inviteeEmail, subject, html, text: `Accept: ${finalAcceptUrl}` });
    } catch (err) {
      // log but do not fail the flow
      console.error('Failed to send team invite email', err);
    }

    return { message: 'Invite created', inviteId };
  },

  listInvitesForTeam: async (teamId, requesterId) => {
    // only owner/admin can list
    const role = await TeamModel.getMemberRole(teamId, requesterId);
    if (!role || (role !== 'owner' && role !== 'admin')) throw { status: 403, message: 'Not authorized' };
    const invites = await TeamInviteModel.listByTeam(teamId);
    return invites;
  },

  revokeInvite: async (inviteId, requesterId) => {
    const inv = await TeamInviteModel.findById(inviteId);
    if (!inv) throw { status: 404, message: 'Invite not found' };

    // permission: requester must be owner/admin of that team
    const role = await TeamModel.getMemberRole(inv.team_id, requesterId);
    if (!role || (role !== 'owner' && role !== 'admin')) throw { status: 403, message: 'Not authorized' };

    // admins cannot revoke owner invites, but since owner invites are only created by owner, it's fine
    await TeamInviteModel.revokeInvite(inviteId);
    return { message: 'Invite revoked' };
  },

  acceptInvite: async (inviteId, rawToken, userId) => {
    // 1) fetch invite
    const inv = await TeamInviteModel.findById(inviteId);
    if (!inv) throw { status: 404, message: 'Invite not found' };
    if (inv.used) throw { status: 400, message: 'Invite already used' };
    if (new Date(inv.expires_at) < new Date()) throw { status: 400, message: 'Invite expired' };

    // 2) ensure logged-in user email matches invite email
    const user = await UserModel.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };
    if ((user.email || '').toLowerCase() !== (inv.invitee_email || '').toLowerCase()) {
      throw { status: 403, message: 'Invite email does not match your account email. Register or login with the invited email.' };
    }

    // 3) compare token
    const ok = await compareHash(rawToken, inv.tokenHash);
    if (!ok) throw { status: 400, message: 'Invalid invite token' };

    // 4) add member to team (if not already)
    const existingRole = await TeamModel.getMemberRole(inv.team_id, userId);
    if (existingRole) {
      // already member: just mark invite used
      await TeamInviteModel.markUsed(inviteId);
      return { message: 'You are already a team member' };
    }

    // add member using TeamModel (assumed to have addMember(teamId, userId, role) function)
    await TeamModel.addMember(inv.team_id, userId, inv.role);

    // mark invite used
    await TeamInviteModel.markUsed(inviteId);

    return { message: 'Invite accepted', teamId: inv.team_id };
  },

  declineInvite: async (inviteId, userId) => {
    const inv = await TeamInviteModel.findById(inviteId);
    if (!inv) throw { status: 404, message: 'Invite not found' };
    if (inv.used) throw { status: 400, message: 'Invite already used' };

    const user = await UserModel.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };
    if ((user.email || '').toLowerCase() !== (inv.invitee_email || '').toLowerCase()) {
      throw { status: 403, message: 'Invite email does not match your account email' };
    }

    await TeamInviteModel.revokeInvite(inviteId);
    return { message: 'Invite declined' };
  },
};

module.exports = TeamInviteService;
