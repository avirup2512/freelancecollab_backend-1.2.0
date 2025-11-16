// middlewares/auth.js
const { verifyJwt } = require('../utils/utils');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success:false, message: 'Authorization header missing' });
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ success:false, message: 'Invalid auth format' });
  const token = parts[1];
  try {
    const decoded = verifyJwt(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success:false, message: 'Invalid or expired token' });
  }
}
module.exports = authMiddleware;
