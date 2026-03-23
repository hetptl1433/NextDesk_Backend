const express = require("express");

const {
  createReservation,
  listReservations,
  getReservation,
  updateReservation,
  cancelReservation,
  checkAvailability
} = require("../controllers/reservationController");
const { protect } = require("../middleware/authMiddleware");
const { attachOwnedProperty } = require("../middleware/propertyAccess");

const router = express.Router();

router.use(protect, attachOwnedProperty);

router.get("/availability", checkAvailability);
router.route("/").post(createReservation).get(listReservations);
router.route("/:id").get(getReservation).put(updateReservation);
router.patch("/:id/cancel", cancelReservation);

module.exports = router;
