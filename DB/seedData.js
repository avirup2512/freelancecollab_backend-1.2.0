// seedData.js
const mysql = require("mysql");
const connection = require('./db');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params);
}

async function seedProjectRoles() {
    try {
        // Check if roles already exist
        const existing = await query(`SELECT COUNT(*) as count FROM project_roles`, []);
        if (existing[0].count > 0) {
            console.log("✅ Project roles already seeded");
            return;
        }

        const roles = [
            ['admin', 'Project Administrator with full control'],
            ['member', 'Project Member with edit permissions'],
            ['viewer', 'Project Viewer with read-only access']
        ];

        for (const [roleName, description] of roles) {
            await query(
                `INSERT INTO project_roles (role_name, description) VALUES (?, ?)`,
                [roleName, description]
            );
        }
        console.log("✅ Project roles seeded successfully");
    } catch (err) {
        console.error("❌ Error seeding project roles:", err.message);
        throw err;
    }
}

async function seedTeamRoles() {
    try {
        // Check if roles already exist
        const existing = await query(`SELECT COUNT(*) as count FROM team_role`, []);
        if (existing[0].count > 0) {
            console.log("✅ Team roles already seeded");
            return;
        }

        const roles = [
            ['owner', 'Team Owner with full control'],
            ['admin', 'Team Admin with management permissions'],
            ['member', 'Team Member with standard permissions']
        ];

        for (const [roleName, description] of roles) {
            await query(
                `INSERT INTO team_role (role_name) VALUES (?)`,
                [roleName]
            );
        }
        console.log("✅ Team roles seeded successfully");
    } catch (err) {
        console.error("❌ Error seeding team roles:", err.message);
        throw err;
    }
}

async function seedBoardRoles() {
    try {
        // Check if roles already exist
        const existing = await query(`SELECT COUNT(*) as count FROM board_roles`, []);
        if (existing[0].count > 0) {
            console.log("✅ Board roles already seeded");
            return;
        }

        const roles = [
            ['owner', 'Board Owner with full control'],
            ['editor', 'Board Editor with edit permissions'],
            ['viewer', 'Board Viewer with read-only access']
        ];

        for (const [roleName, description] of roles) {
            await query(
                `INSERT INTO board_roles (role_name, description) VALUES (?, ?)`,
                [roleName, description]
            );
        }
        console.log("✅ Board roles seeded successfully");
    } catch (err) {
        console.error("❌ Error seeding board roles:", err.message);
        throw err;
    }
}

async function seedAllData() {
    try {
        console.log("\n🌱 Seeding database with default data...\n");
        await seedProjectRoles();
        // await seedTeamRoles();
        await seedBoardRoles();
        console.log("\n✨ All data seeded successfully!\n");
    } catch (err) {
        console.error("Error during seeding:", err);
        throw err;
    }
}

module.exports = seedAllData;
