// services/user.service.js
const UserModel = require('../models/user.model');
const { hashString, compareHash, signJwt, randomTokenHex, sendEmail, verifyGoogleIdToken, verifyGithubAccessToken } = require('../utils/utils');

const RESET_TOKEN_EXPIRE_MINUTES = parseInt(process.env.RESET_TOKEN_EXPIRE_MINUTES || '60', 10);

const UserService = {
  register: async ({ first_name, last_name, email, password, address }) => {
    if (!email || !password) throw { status: 400, message: 'Email and password required' };
    const existing = await UserModel.findByEmail(email);
    if (existing) throw { status: 400, message: 'Email already in use' };

    const hashed = await hashString(password);
    const res = await UserModel.createUser({
      first_name: first_name || '',
      last_name: last_name || '',
      email,
      password: hashed,
      address: address || null,
      start_date: null,
      end_date: null,
      working: false,
      social_auth: false,
      unique_identifier: null,
    });
    const user = await UserModel.findById(res.insertId);
    delete user.password;
    const token = signJwt({ id: user.id, email: user.email });
    return { user, token };
  },

  login: async (email, password) => {
    if (!email || !password) throw { status: 400, message: 'Email and password required' };
    const user = await UserModel.findByEmail(email);
    if (!user) throw { status: 400, message: 'Invalid credentials' };
    if (!user.password) throw { status: 400, message: 'Please login using social provider' };

    const ok = await compareHash(password, user.password);
    if (!ok) throw { status: 400, message: 'Invalid credentials' };

    delete user.password;
    const token = signJwt({ id: user.id, email: user.email });
    return { user, token };
  },

  // Social login: Google
  socialLoginWithGoogle: async (idToken) => {
    // verify token
    const payload = await verifyGoogleIdToken(idToken);
    // expected fields: sub (id), email, email_verified, given_name, family_name
    const providerId = payload.sub;
    const email = payload.email;
    if (!email) throw { status: 400, message: 'Google account has no email' };

    const uniqueIdentifier = `google|${providerId}`;
    // find by unique identifier
    let user = await UserModel.findByUniqueIdentifier(uniqueIdentifier);
    if (user) {
      delete user.password;
      const token = signJwt({ id: user.id, email: user.email });
      return { user, token, created: false };
    }

    // else try by email
    user = await UserModel.findByEmail(email);
    if (user) {
      // link account
      await UserModel.updateUniqueIdentifier(user.id, uniqueIdentifier);
      const updated = await UserModel.findById(user.id);
      delete updated.password;
      const token = signJwt({ id: updated.id, email: updated.email });
      return { user: updated, token, created: false };
    }

    // create new user
    const nameParts = (payload.name || '').split(' ');
    const first_name = payload.given_name || nameParts[0] || '';
    const last_name = payload.family_name || nameParts.slice(1).join(' ') || '';

    const insert = await UserModel.createUser({
      first_name,
      last_name,
      email,
      password: null,
      address: null,
      start_date: null,
      end_date: null,
      working: false,
      social_auth: true,
      unique_identifier: uniqueIdentifier,
    });
    const newUser = await UserModel.findById(insert.insertId);
    delete newUser.password;
    const token = signJwt({ id: newUser.id, email: newUser.email });
    return { user: newUser, token, created: true };
  },

  // Social login: GitHub
  socialLoginWithGithub: async (accessToken) => {
    // verify access token by fetching user
    const gh = await verifyGithubAccessToken(accessToken);
    if (!gh || !gh.id) throw { status: 400, message: 'Invalid GitHub token' };
    if (!gh.email) throw { status: 400, message: 'GitHub account has no email (make sure user granted email scope)' };

    const uniqueIdentifier = `github|${gh.id}`;
    let user = await UserModel.findByUniqueIdentifier(uniqueIdentifier);
    if (user) {
      delete user.password;
      const token = signJwt({ id: user.id, email: user.email });
      return { user, token, created: false };
    }

    user = await UserModel.findByEmail(gh.email);
    if (user) {
      await UserModel.updateUniqueIdentifier(user.id, uniqueIdentifier);
      const updated = await UserModel.findById(user.id);
      delete updated.password;
      const token = signJwt({ id: updated.id, email: updated.email });
      return { user: updated, token, created: false };
    }

    // create
    const nameParts = (gh.name || '').split(' ');
    const first_name = nameParts[0] || gh.login || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const insert = await UserModel.createUser({
      first_name,
      last_name,
      email: gh.email,
      password: null,
      address: null,
      start_date: null,
      end_date: null,
      working: false,
      social_auth: true,
      unique_identifier: uniqueIdentifier,
    });
    const newUser = await UserModel.findById(insert.insertId);
    delete newUser.password;
    const token = signJwt({ id: newUser.id, email: newUser.email });
    return { user: newUser, token, created: true };
  },

  // forgot password: create token, store hashed token, send email
  forgotPassword: async (email) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Do not reveal whether email exists — respond success to caller (but do nothing)
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const rawToken = randomTokenHex(32);
    const tokenHash = await hashString(rawToken);

    await UserModel.insertPasswordReset(user.id, tokenHash);

    const resetUrl = `${process.env.FRONTEND_URL}/auth/forgotPassword/${rawToken}/${user.id}`;

    const subject = 'Password reset request';
    const html = `<p>Hi ${user.first_name || ''},</p>
      <p>We received a request to reset your password. Click the link below to reset it. This link is valid for ${RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>If you didn't request this, ignore this message.</p>`;

    try {
      await sendEmail({ to: user.email, subject, html, text: `Reset link: ${resetUrl}` });
    } catch (err) {
      // Log the error but don't reveal details to the client
      console.error('Failed to send reset email', err);
    }

    return { message: 'If the email exists, a reset link has been sent' };
  },

  // reset password: validate token expiry + hash compare, update password
  resetPassword: async (userId, token, newPassword) => {
    const pr = await UserModel.findPasswordResetByUserId(userId);
    if (!pr) throw { status: 400, message: 'Invalid or expired reset token' };

    // expiry check
    const created = new Date(pr.created_date);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / (1000 * 60));
    if (diffMinutes > RESET_TOKEN_EXPIRE_MINUTES) {
      // expired
      await UserModel.deletePasswordReset(pr.id).catch(() => {});
      throw { status: 400, message: 'Reset token expired' };
    }

    const match = await compareHash(token, pr.tokenHash);
    if (!match) throw { status: 400, message: 'Invalid reset token' };

    const hashed = await hashString(newPassword);
    await UserModel.updatePassword(userId, hashed);
    await UserModel.deletePasswordReset(pr.id).catch(() => {});

    return { message: 'Password updated successfully' };
  },
  // F & G: Add or Edit User Info (upsert)
  addOrEditUserInfo: async (userId, info) => {
    // basic sanitization/normalization
    if (!userId) throw { status: 400, message: 'userId required' };
    // Optionally: validate certain fields (email format, zip numeric etc.)
    await UserModel.upsertUserInfo(userId, info);
    const updated = await UserModel.getUserInfoByUserId(userId);
    return updated;
  },

  // H: Update user password (requires old password)
  updatePassword: async (userId, oldPassword, newPassword) => {
    if (!userId) throw { status: 400, message: 'userId required' };
    if (!oldPassword || !newPassword) throw { status: 400, message: 'oldPassword and newPassword required' };

    const user = await UserModel.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };

    if (!user.password) {
      // social-auth user
      throw { status: 400, message: 'Cannot update password for social-auth user' };
    }

    const ok = await compareHash(oldPassword, user.password);
    if (!ok) throw { status: 400, message: 'Old password incorrect' };

    const hashed = await hashString(newPassword);
    await UserModel.updatePassword(userId, hashed);
    return { message: 'Password updated' };
  },

  // I: Get user info by id (joined)
  getUserById: async (userId) => {
    if (!userId) throw { status: 400, message: 'userId required' };
    const data = await UserModel.getUserWithInfoById(userId);
    if (!data) throw { status: 404, message: 'User not found' };

    // normalize shape for client
    const user = {
      id: data.user_id,
      email: data.u_email,
      name: `${data.u_first_name || ''} ${data.u_last_name || ''}`.trim(),
      working: !!data.working,
      social_auth: !!data.social_auth,
      info: data.user_info_id ? {
        id: data.user_info_id,
        first_name: data.info_first_name,
        last_name: data.info_last_name,
        email: data.info_email,
        phone: data.phone,
        bio: data.bio,
        street_address: data.street_address,
        country_code: data.country_code,
        state: data.state,
        city: data.city,
        zip: data.zip,
        website: data.website,
        github: data.github,
        linkedin: data.linkedin,
        twitter: data.twitter,
        created_date: data.info_created_date,
      } : null,
    };

    return user;
  },
  getUserByEmail: async (userEmail) => {
    if (!userEmail) throw { status: 400, message: 'userEmail required' };
    const data = await UserModel.getUserWithInfoByEmail(userEmail);
    if (!data) throw { status: 404, message: 'User not found' };

    // normalize shape for client
    const user = {
      id: data.user_id,
      email: data.u_email,
      name: `${data.u_first_name || ''} ${data.u_last_name || ''}`.trim(),
      working: !!data.working,
      social_auth: !!data.social_auth,
      info: data.user_info_id ? {
        id: data.user_info_id,
        first_name: data.info_first_name,
        last_name: data.info_last_name,
        email: data.info_email,
        phone: data.phone,
        bio: data.bio,
        street_address: data.street_address,
        country_code: data.country_code,
        state: data.state,
        city: data.city,
        zip: data.zip,
        website: data.website,
        github: data.github,
        linkedin: data.linkedin,
        twitter: data.twitter,
        created_date: data.info_created_date,
      } : null,
    };

    return user;
  },
searchUser: async (keyword) => {
    if (!keyword) throw { status: 400, message: 'Keyword required' };
    return await UserModel.searchUser(keyword);
  },

  searchUserByEmailOrName: async (email, name) => {
    if (!email && !name) throw { status: 400, message: 'Email or name required' };
    return await UserModel.searchUserByEmailOrName(email, name);
  },

  getUsersByProjectBoard: async (projectId, boardId) => {
    if (!projectId && !boardId) throw { status: 400, message: 'projectId or boardId required' };
    return await UserModel.getUsersByProjectBoard(projectId, boardId);
  },

  getFullUserData: async (userId) => {
    if (!userId) throw { status: 400, message: 'userId required' };
    const data = await UserModel.getFullUserData(userId);
    if (!data) throw { status: 404, message: 'User not found' };
    return data;
  },
};
module.exports = UserService;
