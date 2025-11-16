// models/user.model.js
const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return  con.queryByArray(connectionObject,q,params)
}

const UserModel = {
  createUser: (user) => query(
    `INSERT INTO users (first_name, last_name, email, password, address, start_date, end_date, working, social_auth, unique_identifier)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.first_name, user.last_name, user.email, user.password, user.address || null, user.start_date || null, user.end_date || null, user.working ? 1 : 0, user.social_auth ? 1 : 0, user.unique_identifier || null]
  ),

  findByEmail: (email) => query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]).then(r => r[0] || null),

  findById: (id) => query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),

  findByUniqueIdentifier: (uid) => query(`SELECT * FROM users WHERE unique_identifier = ? LIMIT 1`, [uid]).then(r => r[0] || null),

  updateUniqueIdentifier: (id, uid) => query(`UPDATE users SET unique_identifier = ?, social_auth = 1 WHERE id = ?`, [uid, id]),

  updatePassword: (id, hashedPassword) => query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]),

  // password_reset operations
  insertPasswordReset: (userId, tokenHash) => query(`INSERT INTO password_reset (user_id, tokenHash) VALUES (?, ?)`, [userId, tokenHash]),
  findPasswordResetByUserId: (userId) => query(`SELECT * FROM password_reset WHERE user_id = ? ORDER BY created_date DESC LIMIT 1`, [userId]).then(r => r[0] || null),
  deletePasswordReset: (id) => query(`DELETE FROM password_reset WHERE id = ?`, [id]),

  // other helper queries you may reuse
  getUserInfoById: (id) => query(`SELECT u.*, ui.* FROM users u LEFT JOIN user_info ui ON ui.user_id = u.id WHERE u.id = ?`, [id]).then(r => r[0] || null),

  // -------- User Info CRUD --------
  getUserInfoByUserId: (userId) =>
    query(`SELECT * FROM user_info WHERE user_id = ? LIMIT 1`, [userId]).then(r => r[0] || null),

  insertUserInfo: (userId, info) =>
    query(
      `INSERT INTO user_info (user_id, first_name, last_name, email, phone, bio, street_address, country_code, state, city, zip, website, github, linkedin, twitter)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        info.first_name || null,
        info.last_name || null,
        info.email || null,
        info.phone || null,
        info.bio || null,
        info.street_address || null,
        info.country_code || null,
        info.state || null,
        info.city || null,
        info.zip || null,
        info.website || null,
        info.github || null,
        info.linkedin || null,
        info.twitter || null,
      ]
    ),

  updateUserInfo: (userId, info) =>
    query(
      `UPDATE user_info SET
         first_name = COALESCE(?, first_name),
         last_name  = COALESCE(?, last_name),
         email      = COALESCE(?, email),
         phone      = COALESCE(?, phone),
         bio        = COALESCE(?, bio),
         street_address = COALESCE(?, street_address),
         country_code = COALESCE(?, country_code),
         state = COALESCE(?, state),
         city = COALESCE(?, city),
         zip = COALESCE(?, zip),
         website = COALESCE(?, website),
         github = COALESCE(?, github),
         linkedin = COALESCE(?, linkedin),
         twitter = COALESCE(?, twitter)
       WHERE user_id = ?`,
      [
        info.first_name,
        info.last_name,
        info.email,
        info.phone,
        info.bio,
        info.street_address,
        info.country_code,
        info.state,
        info.city,
        info.zip,
        info.website,
        info.github,
        info.linkedin,
        info.twitter,
        userId,
      ]
    ),

  // Upsert helper: inserts if not exists, else updates
  upsertUserInfo: async (userId, info) => {
    const existing = await query(`SELECT id FROM user_info WHERE user_id = ? LIMIT 1`, [userId]);
    if (existing.length > 0) {
      return UserModel.updateUserInfo(userId, info);
    } else {
      return UserModel.insertUserInfo(userId, info);
    }
  },

  // Get public user data joined: user + user_info (used in getUserById)
  getUserWithInfoById: (userId) =>
    query(
      `SELECT u.id as user_id, u.first_name as u_first_name, u.last_name as u_last_name, u.email as u_email, u.working, u.social_auth,
              ui.id as user_info_id, ui.first_name as info_first_name, ui.last_name as info_last_name, ui.email as info_email,
              ui.phone, ui.bio, ui.street_address, ui.country_code, ui.state, ui.city, ui.zip, ui.website, ui.github, ui.linkedin, ui.twitter, ui.created_date as info_created_date
       FROM users u
       LEFT JOIN user_info ui ON ui.user_id = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
  ).then(r => r[0] || null),

  getUserWithInfoByEmail: (userEmail) =>
    query(
      `SELECT u.id as user_id, u.first_name as u_first_name, u.last_name as u_last_name, u.email as u_email, u.working, u.social_auth,
              ui.id as user_info_id, ui.first_name as info_first_name, ui.last_name as info_last_name, ui.email as info_email,
              ui.phone, ui.bio, ui.street_address, ui.country_code, ui.state, ui.city, ui.zip, ui.website, ui.github, ui.linkedin, ui.twitter, ui.created_date as info_created_date
       FROM users u
       LEFT JOIN user_info ui ON ui.user_id = u.id
       WHERE u.email = ?
       LIMIT 1`,
      [userEmail]
  ).then(r => r[0] || null),

  // Password update (already present but ensure it exists)
  updatePassword: (id, hashedPassword) => query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]),

  // get user raw by id (used in password update)
  findById: (id) => query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [id]).then(r => r[0] || null),
// --- SEARCH (J, K) ---
  searchUser: (keyword) => {
    const like = `%${keyword}%`;
    return query(
      `SELECT u.id, u.first_name, u.last_name, u.email, ui.bio, ui.city
       FROM users u
       LEFT JOIN user_info ui ON u.id = ui.user_id
       WHERE u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR ui.bio LIKE ? OR ui.city LIKE ?
       LIMIT 50`,
      [like, like, like, like, like]
    );
  },

  searchUserByEmailOrName: (email, name) => {
    let conditions = [];
    let params = [];

    if (email) {
      conditions.push('u.email LIKE ?');
      params.push(`%${email}%`);
    }
    if (name) {
      conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ?)');
      params.push(`%${name}%`, `%${name}%`);
    }

    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    return query(
      `SELECT u.id, u.first_name, u.last_name, u.email, ui.bio
       FROM users u
       LEFT JOIN user_info ui ON u.id = ui.user_id
       ${whereClause}
       LIMIT 50`,
      params
    );
  },

  // --- GET USERS BY PROJECT/BOARD (L) ---
  getUsersByProjectBoard: (projectId, boardId) => {
    let q;
    let params = [];

    if (boardId) {
      q = `SELECT u.id, u.first_name, u.last_name, u.email
           FROM users u
           INNER JOIN user_board ub ON u.id = ub.user_id
           WHERE ub.board_id = ?`;
      params = [boardId];
    } else if (projectId) {
      q = `SELECT u.id, u.first_name, u.last_name, u.email
           FROM users u
           INNER JOIN user_project up ON u.id = up.user_id
           WHERE up.project_id = ?`;
      params = [projectId];
    } else {
      return Promise.resolve([]);
    }

    return query(q, params);
  },

  // --- FULL USER DATA (M) ---
  getFullUserData: async (userId) => {
    const user = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, ui.bio, ui.city, ui.website
       FROM users u
       LEFT JOIN user_info ui ON u.id = ui.user_id
       WHERE u.id = ?`,
      [userId]
    ).then(r => r[0]);

    if (!user) return null;

    const boards = await query(
      `SELECT b.id, b.name, p.id AS project_id, p.name AS project_name
       FROM board b
       LEFT JOIN project p ON b.project_id = p.id
       INNER JOIN user_board ub ON ub.board_id = b.id
       WHERE ub.user_id = ?`,
      [userId]
    );

    const cards = await query(
      `SELECT c.id, c.title, c.description, b.id AS board_id, b.name AS board_name
       FROM card c
       LEFT JOIN board b ON b.id = c.board_id
       INNER JOIN user_card uc ON uc.card_id = c.id
       WHERE uc.user_id = ?`,
      [userId]
    );

    return { user, boards, cards };
  },
};

module.exports = UserModel;
