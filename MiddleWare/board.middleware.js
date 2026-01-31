const connection = require('../DB/db');
const mysql = require('mysql');

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params)
}


module.exports = function (allowedRoles = []) {

    return async (req, res, next) => {
        const boardId = req.params.boardId || req.body.boardId;
        const userId = req.user.id;

        if (!boardId) return res.status(400).json({ error: "Board ID missing" });

        const sql = `
            -- board_users does not store the role name directly; join to board_roles
            SELECT br.role_name AS role_name
            FROM board_users bu
            JOIN board_roles br ON bu.role_id = br.id
            WHERE bu.board_id = ? AND bu.user_id = ?
        `;
            const rows = await query(sql, [boardId, userId]);
            if (!rows.length)
                return res.status(403).json({ error: "You are not a member of this board" });

            const role = rows[0].role_name;

            if (allowedRoles.includes(role) || allowedRoles.includes("any"))
                return next();

            return res.status(403).json({ error: "Permission denied" });
    };
};
