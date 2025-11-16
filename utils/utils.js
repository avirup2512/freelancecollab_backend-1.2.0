// utils.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function hashString(s) {
  return bcrypt.hash(s, 10);
}

async function compareHash(s, hash) {
  return bcrypt.compare(s, hash);
}

function randomTokenHex(len = 24) {
  return crypto.randomBytes(len).toString('hex');
}

// nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// sendEmail helper
async function sendEmail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
  return info;
}

// Google token verification using tokeninfo endpoint (id_token)
async function verifyGoogleIdToken(idToken) {
  // returns payload if successful
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  const resp = await axios.get(url);
  const payload = resp.data;
  // validate audience
  const aud = payload.aud || payload.audience;
  if (process.env.GOOGLE_CLIENT_ID && aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Invalid Google client id');
  }
  // payload contains: sub (id), email, email_verified, name, given_name, family_name, picture, aud...
  return payload;
}

// GitHub token verification: fetch user and (if needed) emails
async function verifyGithubAccessToken(accessToken) {
  // fetch user
  const userResp = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `token ${accessToken}`, 'User-Agent': 'kanban-app' },
  });
  const user = userResp.data;

  // try to get primary verified email (API /user may not contain email)
  let email = user.email || null;
  if (!email) {
    const emailsResp = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${accessToken}`, 'User-Agent': 'kanban-app' },
    });
    const emails = Array.isArray(emailsResp.data) ? emailsResp.data : [];
    // prefer primary & verified
    const primary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified) || emails[0];
    if (primary) email = primary.email;
  }

  return {
    id: String(user.id),
    login: user.login,
    name: user.name || '',
    email,
    avatar_url: user.avatar_url,
  };
}

module.exports = {
  signJwt,
  verifyJwt,
  hashString,
  compareHash,
  randomTokenHex,
  sendEmail,
  verifyGoogleIdToken,
  verifyGithubAccessToken,
  axios,
};
