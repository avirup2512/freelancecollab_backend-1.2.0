// initTables.js
const mysql = require("mysql");
const createQuery = require("./createQuery"); // your file
const connection = require('../DB/db');

function sqlquery(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return  con.queryByArray(connectionObject,q,params)
}
// Ordered tables based on FK dependencies
const orderedTables = [
  // 1) Core user system
  "createUsersTable",
  "createRoleTable",
  "createUserTypeTable",
  "createPriority",

  // 5) Teams + team roles
  "createTeams",
  "createTeamsMember",
  "createTeamInvites",

  // 2) Projects first
  "createTeamRole",
  "createProjectTable",

  // 3) Board base
  "createBoardTable",
  "createBoardRoles",

  // 4) User <-> Role <-> Project relations
  "createUserRoleTable",
  "createProjectUserTable",

  // 6) Team <-> Project mapping
  "createProjectTeam",
  "createProjectRoles",
  "createProjectTeamRoleMap",   // depends on project_roles + team_roles
  "createBoardTeamRoleMap",     // depends on board_roles + team_roles

  // 7) Board related
  "createBoardUserTable",
  "createBoardLabelTable",
  "createCoreLabelTable",
  "createBoardTagTable",

  // 8) Lists
  "createListTable2",  // latest list table
  "createListHistoryTable",
  "createListUserStateTable",
  "createListTemplate",
  "createTemplateCard",
  "createListGroup",
  "createListGroupList",
  "createListGroupListDefault",

  // 9) Cards
  "createCardsTable",
  "createCardUserTable",
  "createCardLabelTable",
  "createCardTagTable",

  // 10) Checklist
  "createCheckListItemTable",
  "createCheckListUserTable",
  "createChecklistTagTable",

  // 11) Activities & Comments
  "createCommentTable",
  "createCardActivityTable",
  "createCardActivityAddedUserTable",
  "createCardActivityAddedChecklistTable",

  // 12) Files
  "createUploadedFileTable",

  // 13) Clients & Client Projects
  "createClientTable",
  "createClientProjectTable",

  // 14) Password + Social Auth
  "createPasswordReset",
  "createUserSocialAuth",
  "createPasswordResets",

  // 15) Project–Board link
  "createProjectBoardTable",

  // 16) User Info
  "createUserInfoTable",

  // 17) Team Project link
  "createTeamProjectTable",

  // 18) Categories
  "createCategoryTable",

  // 19) Team Categories
  "createTeamCategoryTable"
];

async function initTables() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "25126631" ,
    database: "kanban_saas",
    multipleStatements: true
  });

  console.log("\n🚀 Initializing database tables...\n");

  for (const key of orderedTables) {
    const query = createQuery[key];

    if (!query) {
      console.warn(`⚠️  Missing query for key → ${key}`);
      continue;
    }

    try {
      console.log(`⏳ Creating table: ${key}`);
      await sqlquery(query,[]);
      console.log(`✅ ${key} created`);
    } catch (err) {
      console.error(`❌ Failed creating ${key}`);
      console.error(err.message);
      process.exit(1);
    }
  }

  console.log("\n🎉 All tables created successfully!\n");
  await connection.end();
}

// initTables();
module.exports = initTables;