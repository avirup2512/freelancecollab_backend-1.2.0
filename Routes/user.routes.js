// routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/user.controller');
const { createRateLimiter } = require('../Middleware/rateLimiter');
const authMiddleware = require('../Middleware/auth');
const checkJWT = require('../Middleware/JWT');
// config limiters
const loginLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5, message: 'Too many login attempts. Try again later.' });
const forgotLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 3, message: 'Too many password reset requests. Try again later.' });

// public routes
router.post('/register', UserController.register);
router.post('/login', loginLimiter, UserController.login);
router.post("/getUser",checkJWT, UserController.getUserByEmail);

// social endpoints
router.post('/social/google', UserController.socialGoogle);
router.post('/social/github', UserController.socialGithub);

// forgot/reset
router.post('/forgot-password', forgotLimiter, UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

// Protected profile routes
// Upsert (add/edit) user info — supports both POST (create) and PUT (edit)
router.post('/:userId?/info', authMiddleware, UserController.addOrEditUserInfo); // optional :userId for admin actions; if omitted, uses req.user.id
router.put('/me/info', authMiddleware, UserController.addOrEditUserInfo); // simpler route for current user

// Update password for logged-in user
router.put('/me/password', authMiddleware, UserController.updatePassword);

// Get user by id (requires auth)
router.get('/:userId', authMiddleware, UserController.getUserById);

// Search users
router.get('/search', authMiddleware, UserController.searchUser); // ?q=keyword
router.get('/filter', authMiddleware, UserController.searchUserByEmailOrName); // ?email=...&name=...

// Users by project/board
router.get('/by', authMiddleware, UserController.getUsersByProjectBoard); // ?projectId=.. or ?boardId=..

// Full joined data
router.get('/:userId/full', authMiddleware, UserController.getFullUserData);

module.exports = router;
