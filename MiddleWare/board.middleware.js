const db = require("../DB/db");

module.exports = function (allowedRoles = []) {

    return (req, res, next) => {
        const boardId = req.params.boardId || req.body.boardId;
        const userId = req.user.id;

        if (!boardId) return res.status(400).json({ error: "Board ID missing" });

        const sql = `
            SELECT br.role_name
            FROM board_users bu
            JOIN board_roles br ON bu.role_id = br.id
            WHERE bu.board_id = ? AND bu.user_id = ?
        `;

        db.query(sql, [boardId, userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!rows.length)
                return res.status(403).json({ error: "You are not a member of this board" });

            const role = rows[0].role_name;

            if (allowedRoles.includes(role) || allowedRoles.includes("any"))
                return next();

            return res.status(403).json({ error: "Permission denied" });
        });
    };
};
