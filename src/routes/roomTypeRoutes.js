const express = require("express");

const {
  createRoomType,
  listRoomTypes,
  getRoomType,
  updateRoomType,
  deleteRoomType
} = require("../controllers/roomTypeController");
const { protect } = require("../middleware/authMiddleware");
const { attachOwnedProperty } = require("../middleware/propertyAccess");

const router = express.Router();

router.use(protect, attachOwnedProperty);

router.route("/").post(createRoomType).get(listRoomTypes);
router.route("/:id").get(getRoomType).put(updateRoomType).delete(deleteRoomType);

module.exports = router;
