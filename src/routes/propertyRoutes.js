const express = require("express");

const {
  createProperty,
  getMyProperty,
  updateMyProperty
} = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createProperty);
router.get("/me", getMyProperty);
router.put("/me", updateMyProperty);

module.exports = router;
