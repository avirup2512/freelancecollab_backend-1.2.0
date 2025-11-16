const BoardModel = require("../Models/board.model");
const BoardUserModel = require("../Models/board.user.model");
const TeamMemberModel = require("../Models/team.member.model");

class BoardService {

    static async createBoard(data) {
        return await BoardModel.createBoard(data);
    }

    static async editBoard(boardId, data) {
        return await BoardModel.updateBoard(boardId, data);
    }

    static async archiveBoard(boardId, flag) {
        return await BoardModel.archiveBoard(boardId, flag);
    }

    static async deleteBoard(boardId) {
        return await BoardModel.deleteBoard(boardId);
    }

    static async assignUsersToBoard(boardId, userIds, roleId) {
        for (let uid of userIds) {
            await BoardUserModel.assignUser(boardId, uid, roleId);
        }
        return { success: true };
    }

    static async assignTeamToBoard(boardId, teamId) {
        const members = await TeamMemberModel.getTeamMembers(teamId);

        for (let m of members) {
            const mappedRole = await BoardUserModel.getMappedBoardRole(m.team_role_id);

            await BoardUserModel.assignUser(
                boardId,
                m.user_id,
                mappedRole || 4   // fallback: viewer
            );
        }

        return { success: true, message: "Team assigned to board with role mapping." };
    }

    static async removeUser(boardId, userId) {
        return await BoardUserModel.removeUser(boardId, userId);
    }

    static async getBoardWithLists(boardId) {
        return await BoardModel.getBoardWithLists(boardId);
    }

    static async getArchivedBoards(projectId, limit, offset) {
        return await BoardModel.getBoardsByArchive(projectId, 1, limit, offset);
    }

    static async getActiveBoards(projectId, limit, offset) {
        return await BoardModel.getBoardsByArchive(projectId, 0, limit, offset);
    }
}

module.exports = BoardService;
