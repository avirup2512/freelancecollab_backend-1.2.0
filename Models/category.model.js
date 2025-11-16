// models/category.model.js
const connection = require("../DB/db");
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return  con.queryByArray(connectionObject,q,params)
}
const Category = {
    create: (name, createdBy) => {
        return query(
            `INSERT INTO categories (name, created_by) VALUES (?, ?)`,
            [name, createdBy]
        );
    },

    update: (id, name) => {
        return query(
            `UPDATE categories SET name = ? WHERE id = ?`,
            [name, id]
        );
    },

    delete: (id) => {
        return query(
            `DELETE FROM categories WHERE id = ?`,
            [id]
        );
    },

    findById: (id) => {
        return query(
            `SELECT * FROM categories WHERE id = ?`,
            [id]
        );
    },

    findAll: () => {
        return query(`SELECT * FROM categories ORDER BY id DESC`);
    }
};

module.exports = Category;
