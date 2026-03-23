const RoomType = require("../models/RoomType");
const asyncHandler = require("../utils/asyncHandler");
const { requireFields, isValidObjectId } = require("../utils/validators");

const createRoomType = asyncHandler(async (req, res) => {
  const missingFields = requireFields(req.body, ["name", "bedType", "capacity", "basePrice"]);

  if (missingFields.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const roomType = await RoomType.create({
    propertyId: req.property._id,
    name: req.body.name,
    bedType: req.body.bedType,
    capacity: req.body.capacity,
    basePrice: req.body.basePrice,
    amenities: Array.isArray(req.body.amenities) ? req.body.amenities : []
  });

  res.status(201).json({
    success: true,
    message: "Room type created successfully",
    data: roomType
  });
});

const listRoomTypes = asyncHandler(async (req, res) => {
  const roomTypes = await RoomType.find({ propertyId: req.property._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: roomTypes
  });
});

const getRoomType = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid room type id");
  }

  const roomType = await RoomType.findOne({ _id: req.params.id, propertyId: req.property._id });

  if (!roomType) {
    res.status(404);
    throw new Error("Room type not found");
  }

  res.status(200).json({
    success: true,
    data: roomType
  });
});

const updateRoomType = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid room type id");
  }

  const roomType = await RoomType.findOne({ _id: req.params.id, propertyId: req.property._id });

  if (!roomType) {
    res.status(404);
    throw new Error("Room type not found");
  }

  Object.assign(roomType, req.body);

  if (req.body.amenities && !Array.isArray(req.body.amenities)) {
    res.status(400);
    throw new Error("Amenities must be an array");
  }

  await roomType.save();

  res.status(200).json({
    success: true,
    message: "Room type updated successfully",
    data: roomType
  });
});

const deleteRoomType = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid room type id");
  }

  const roomType = await RoomType.findOneAndDelete({ _id: req.params.id, propertyId: req.property._id });

  if (!roomType) {
    res.status(404);
    throw new Error("Room type not found");
  }

  res.status(200).json({
    success: true,
    message: "Room type deleted successfully"
  });
});

module.exports = {
  createRoomType,
  listRoomTypes,
  getRoomType,
  updateRoomType,
  deleteRoomType
};
