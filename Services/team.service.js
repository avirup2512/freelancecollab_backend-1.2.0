const db = require('../DB/db');

exports.createTeam = async (body, creatorId) => {
  const { name, description, category, members } = body;
  if (!name) throw { status: 400, message: 'Name is required' };
  const [team] = await db.query(
    "INSERT INTO teams (name, description, category, created_by) VALUES (?, ?, ?, ?)",
    [name, description, category, creatorId]
  );
  const teamId = team.insertId;
  if (members?.length) {
    const values = members.map(u => [teamId, u.id, u.role || 'member']);
    await db.query("INSERT INTO team_members (team_id, user_id, role) VALUES ?", [values]);
  }
  return { id: teamId, name };
};

exports.editTeam = async (teamId, body, creatorId) => {
  const { name, description, project_id } = body;
  await db.query(
    "UPDATE teams SET name=?, description=?, project_id=? WHERE id=? AND created_by=?",
    [name, description, project_id, teamId, creatorId]
  );
  return { id: teamId, name };
};

exports.manageTeamMembers = async (teamId, body) => {
  const { add = [], remove = [], edit = [] } = body;
  if (add.length) {
    const values = add.map(u => [teamId, u.id, u.role || 'member']);
    await db.query("INSERT INTO team_members (team_id, user_id, role) VALUES ?", [values]);
  }
  if (remove.length) {
    const ids = remove.map(u => u.id);
    await db.query("DELETE FROM team_members WHERE team_id=? AND user_id IN (?)", [teamId, ids]);
  }
  for (let u of edit) {
    await db.query("UPDATE team_members SET role=? WHERE team_id=? AND user_id=?", [u.role, teamId, u.id]);
  }
  return true;
};

exports.updateUserRole = async (teamId, userId, role) => {
  await db.query("UPDATE team_members SET role=? WHERE team_id=? AND user_id=?", [role, teamId, userId]);
  return true;
};

exports.deleteTeam = async (teamId) => {
  await db.query("DELETE FROM teams WHERE id=?", [teamId]);
  return true;
};

exports.toggleTeamActive = async (teamId) => {
  await db.query("UPDATE teams SET is_active = NOT is_active WHERE id=?", [teamId]);
  const [rows] = await db.query("SELECT * FROM teams WHERE id=?", [teamId]);
  return rows[0];
};

exports.getTeamsByCreator = async (creatorId) => {
  const [rows] = await db.query("SELECT * FROM teams WHERE created_by=?", [creatorId]);
  return rows;
};

exports.getTeamsByProject = async (projectId) => {
  const [rows] = await db.query("SELECT * FROM teams WHERE project_id=?", [projectId]);
  return rows;
};

exports.getTeamById = async (teamId) => {
  const [teamRows] = await db.query("SELECT * FROM teams WHERE id=?", [teamId]);
  const [members] = await db.query(
    `SELECT tm.user_id, u.name, u.email, tm.role
     FROM team_members tm
     JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id=?`, [teamId]);
  return { ...teamRows[0], members };
};
