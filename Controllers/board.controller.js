const BoardService = require("../Services/board.service");

class BoardController {

    static async create(req, res) {
        try {
            const created_by = req.user.id;
            req.body.created_by = created_by;
            const response = await BoardService.createBoard(req.body);
            res.json(response);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async edit(req, res) {
        try {
            const response = await BoardService.editBoard(req.params.boardId, req.body);
            res.json(response);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async archive(req, res) {
        try {
            const response = await BoardService.archiveBoard(
                req.params.boardId,
                req.body.archive
            );
            res.json(response);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async remove(req, res) {
        try {
            const response = await BoardService.deleteBoard(req.params.boardId);
            res.json(response);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async assignUsers(req, res) {
        try {
            const response = await BoardService.assignUsersToBoard(
                req.params.boardId,
                req.body.userIds,
                req.body.roleId
            );
            res.json(response);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async assignTeam(req, res) {
        try {
            const response = await BoardService.assignTeamToBoard(
                req.params.boardId,
                req.body.teamId
            );
            res.json(response);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async getBoardWithLists(req, res) {
        try {
            const data = await BoardService.getBoardWithLists(req.params.boardId);
            res.json(data);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async getActiveBoards(req, res) {
        try {            
            const data = await BoardService.getActiveBoards(
                req.params.projectId,
                req.params.limit,
                req.params.offset
            );
            res.json(data);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async getArchiveBoards(req, res) {
        try {
            const data = await BoardService.getArchivedBoards(
                req.params.projectId,
                req.query.limit,
                req.query.offset
            );
            res.json(data);
        } catch (e) { res.status(500).json({ error: e.message }); }
    }

    static async getAllBoardsByProjectId(req, res) {
        try {
            let projectId = req.params.projectId;
            const projectIdInt = parseInt(projectId, 10);
            if (isNaN(projectIdInt)) {
                throw new Error("Invalid project ID");
            }
            const userId = req.user.id;
            const isArchived = req.params.isArchived !== undefined ? (req.params.isArchived === '1' || req.params.isArchived === 'true') : null;
            const limit = req.params.limit || 20;
            const offset = req.params.offset || 0;
            const data = await BoardService.getAllBoardsByProjectId(projectIdInt, userId, isArchived, limit, offset);
            res.json(data);
        } catch (err) {
            res.status(err.status || 500).json({ 
                success: false, 
                message: err.message || 'Error fetching boards' 
            });
        }
    }
}

module.exports = BoardController;
