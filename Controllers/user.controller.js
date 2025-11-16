// controllers/user.controller.js
const UserService = require('../Services/user.service');

const UserController = {
  register: async (req, res) => {
    try {
      const { first_name, last_name, email, password, address } = req.body;
      const result = await UserService.register({ first_name, last_name, email, password, address });
      return res.json({ success: true, user: result.user, token: result.token });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      return res.json({ success: true, user: result.user, token: result.token, status:200 });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  // social google: expects { idToken } from client (client obtains id_token via Google Sign-In)
  socialGoogle: async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ success: false, message: 'idToken required' });

      const result = await UserService.socialLoginWithGoogle(idToken);
      return res.json({ success: true, user: result.user, token: result.token, created: result.created });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  // social github: expects { accessToken } from client (client obtains via GitHub OAuth flow server or client)
  socialGithub: async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken) return res.status(400).json({ success: false, message: 'accessToken required' });

      const result = await UserService.socialLoginWithGithub(accessToken);
      return res.json({ success: true, user: result.user, token: result.token, created: result.created });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await UserService.forgotPassword(email);
      return res.json({ success: true, message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { uid, token, newPassword } = req.body;
      if (!uid || !token || !newPassword) return res.status(400).json({ success: false, message: 'uid, token and newPassword required' });

      const result = await UserService.resetPassword(uid, token, newPassword);
      return res.json({ success: true, message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },
  // F/G: Add or Edit user info (protected) - upsert
  addOrEditUserInfo: async (req, res) => {
    try {
      const userId = parseInt(req.params.userId || req.user?.id, 10); // allow admin to pass userId or user edits own
      if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

      const info = req.body || {};
      const result = await UserService.addOrEditUserInfo(userId, info);
      return res.json({ success: true, userInfo: result });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  // H: Update password (protected)
  updatePassword: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { oldPassword, newPassword } = req.body;
      const result = await UserService.updatePassword(userId, oldPassword, newPassword);
      return res.json({ success: true, message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },

  // I: Get user by id (protected)
  getUserById: async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (!userId) return res.status(400).json({ success: false, message: 'userId required in params' });

      const user = await UserService.getUserById(userId);
      return res.json({ success: true, user });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },
  getUserByEmail: async (req, res) => {
    console.log(req.params);
    try {
      const userEmail = req.params.userEmail;      
      if (!userEmail) return res.status(400).json({ success: false, message: 'userEmail required in params' });

      const user = await UserService.getUserByEmail(userEmail);
      return res.json({ success: true, user, status:200 });
    } catch (err) {
      console.error(err);
      return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
  },
searchUser: async (req, res) => {
    try {
      const keyword = req.query.q;
      const users = await UserService.searchUser(keyword);
      res.json({ success: true, users });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  searchUserByEmailOrName: async (req, res) => {
    try {
      const { email, name } = req.query;
      const users = await UserService.searchUserByEmailOrName(email, name);
      res.json({ success: true, users });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  getUsersByProjectBoard: async (req, res) => {
    try {
      const { projectId, boardId } = req.query;
      const users = await UserService.getUsersByProjectBoard(projectId, boardId);
      res.json({ success: true, users });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  getFullUserData: async (req, res) => {
    try {
      const userId = req.params.userId;
      const data = await UserService.getFullUserData(userId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

module.exports = UserController;
