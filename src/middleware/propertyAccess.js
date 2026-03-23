const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");

const attachOwnedProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findOne({ ownerId: req.user._id });

  if (!property) {
    res.status(404);
    throw new Error("Property not found for this manager");
  }

  req.property = property;
  next();
});

module.exports = { attachOwnedProperty };
