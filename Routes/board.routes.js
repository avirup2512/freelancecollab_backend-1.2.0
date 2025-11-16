const router = require("express").Router();
const BoardController = require("../Controllers/board.controller");
const auth = require("../MiddleWare/auth");
const boardPermission = require("../Middleware/board.middleware");

// CREATE
router.post("/", auth, BoardController.create);

// EDIT
router.put("/:boardId",
    auth,
    boardPermission(["owner", "admin"]),
    BoardController.edit
);

// ARCHIVE
router.put("/:boardId/archive",
    auth,
    boardPermission(["owner", "admin"]),
    BoardController.archive
);

// DELETE
router.delete("/:boardId",
    auth,
    boardPermission(["owner"]),
    BoardController.remove
);

// ASSIGN USERS
router.post("/:boardId/users",
    auth,
    boardPermission(["owner", "admin"]),
    BoardController.assignUsers
);

// ASSIGN TEAM
router.post("/:boardId/team",
    auth,
    boardPermission(["owner", "admin"]),
    BoardController.assignTeam
);

// GET BOARD + LISTS
router.get("/:boardId",
    auth,
    boardPermission(["any"]),
    BoardController.getBoardWithLists
);

// PAGINATION
router.get("/project/:projectId/active",
    auth,
    BoardController.getActiveBoards
);

router.get("/project/:projectId/archived",
    auth,
    BoardController.getArchiveBoards
);

module.exports = router;
