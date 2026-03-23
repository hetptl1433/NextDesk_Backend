const express = require("express");

const { createRoom, listRooms, getRoom, updateRoom, deleteRoom } = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");
const { attachOwnedProperty } = require("../middleware/propertyAccess");

const router = express.Router();

router.use(protect, attachOwnedProperty);

router.route("/").post(createRoom).get(listRooms);
router.route("/:id").get(getRoom).put(updateRoom).delete(deleteRoom);

module.exports = router;
