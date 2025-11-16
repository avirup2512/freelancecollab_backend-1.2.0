const db = require("../db/db");

const ClientModel = {
    create: (data) => {
        return db.query(
            `INSERT INTO clients (name, email, phone, address, role, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [data.name, data.email, data.phone, data.address, data.role, data.created_by]
        );
    },

    update: (id, data) => {
        return db.query(
            `UPDATE clients SET name=?, email=?, phone=?, address=?, role=?
             WHERE id=?`,
            [data.name, data.email, data.phone, data.address, data.role, id]
        );
    },

    delete: (id) => {
        return db.query(`DELETE FROM clients WHERE id=?`, [id]);
    },

    changeRole: (id, role) => {
        return db.query(`UPDATE clients SET role=? WHERE id=?`, [role, id]);
    },

    getById: (id) => {
        return db.query(`SELECT * FROM clients WHERE id=?`, [id]);
    },

    getProjectsByClientId: (clientId) => {
        return db.query(
            `SELECT p.* 
             FROM projects p
             INNER JOIN client_projects cp ON cp.project_id = p.id
             WHERE cp.client_id=?`,
            [clientId]
        );
    }
};

module.exports = ClientModel;
