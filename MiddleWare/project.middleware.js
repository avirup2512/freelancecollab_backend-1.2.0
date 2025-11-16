const db = require("../DB/db");

module.exports = function (allowedRoles = []) {
    return (req, res, next) => {
        const projectId = req.params.projectId || req.body.projectId;
        const userId = req.user.id;

        if (!projectId) return res.status(400).json({ error: "Project ID missing" });

        const sql = `
            SELECT pr.role_name
            FROM project_users pu
            JOIN project_roles pr ON pu.role_id = pr.id
            WHERE pu.project_id = ? AND pu.user_id = ?
        `;

        db.query(sql, [projectId, userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!rows.length)
                return res.status(403).json({ error: "Not part of this project" });

            const userRole = rows[0].role_name;

            if (allowedRoles.includes(userRole) || allowedRoles.includes("any"))
                return next();

            return res.status(403).json({ error: "Permission denied" });
        });
    };
};
