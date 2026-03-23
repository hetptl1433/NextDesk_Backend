const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const { requireFields } = require("../utils/validators");

const createProperty = asyncHandler(async (req, res) => {
  const existingProperty = await Property.findOne({ ownerId: req.user._id });

  if (existingProperty) {
    res.status(409);
    throw new Error("Manager already has a property");
  }

  const missingFields = requireFields(req.body, [
    "name",
    "address",
    "phone",
    "email",
    "checkInTime",
    "checkOutTime"
  ]);

  if (missingFields.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const property = await Property.create({
    ownerId: req.user._id,
    ...req.body,
    email: req.body.email.toLowerCase()
  });

  res.status(201).json({
    success: true,
    message: "Property created successfully",
    data: property
  });
});

const getMyProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ ownerId: req.user._id });

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.status(200).json({
    success: true,
    data: property
  });
});

const updateMyProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ ownerId: req.user._id });

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  Object.assign(property, req.body);

  if (req.body.email) {
    property.email = req.body.email.toLowerCase();
  }

  await property.save();

  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    data: property
  });
});

module.exports = {
  createProperty,
  getMyProperty,
  updateMyProperty
};
