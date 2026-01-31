const connection = require("../DB/db");
const { verifyJwt } = require("../utils/utils");
const mysql = require("mysql");

function query(q, params = []) {
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    return con.queryByArray(connectionObject, q, params);
}

module.exports = function (allowedRoles = []) {
    return async (req, res, next) => {
        const projectId = req.params.projectId || req.body.projectId;
        const bearerToken = req.headers.authorization?.split(' ')[1];
        
        if (!projectId) return res.status(400).json({ error: "Project ID missing" });
        
        let userId;
        try {
            const decoded = bearerToken ? verifyJwt(bearerToken) : null;
            userId = decoded?.id || req?.user?.id;
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        
        if (!userId) return res.status(401).json({ error: "User ID not found" });

        const sql = `
            SELECT pr.role_name
            FROM project_user pu
            JOIN project_roles pr ON pu.role_id = pr.id
            WHERE pu.project_id = ? AND pu.user_id = ?
        `;

        try {
            const rows = await query(sql, [projectId, userId]);
            
            if (!rows || rows.length === 0)
                return res.status(403).json({ error: "Not part of this project" });

            const userRole = rows[0].role_name;

            if (allowedRoles.includes(userRole) || allowedRoles.includes("any"))
                return next();

            return res.status(403).json({ error: "Permission denied" });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
};
