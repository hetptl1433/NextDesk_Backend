const Room = require("../models/Room");
const RoomType = require("../models/RoomType");
const asyncHandler = require("../utils/asyncHandler");
const { requireFields, isValidObjectId } = require("../utils/validators");

const getOwnedRoomType = async (roomTypeId, propertyId) => {
  return RoomType.findOne({ _id: roomTypeId, propertyId });
};

const createRoom = asyncHandler(async (req, res) => {
  const missingFields = requireFields(req.body, ["roomTypeId", "roomNumber", "floor"]);

  if (missingFields.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  if (!isValidObjectId(req.body.roomTypeId)) {
    res.status(400);
    throw new Error("Invalid room type id");
  }

  const roomType = await getOwnedRoomType(req.body.roomTypeId, req.property._id);

  if (!roomType) {
    res.status(404);
    throw new Error("Room type not found for this property");
  }

  const room = await Room.create({
    propertyId: req.property._id,
    roomTypeId: req.body.roomTypeId,
    roomNumber: req.body.roomNumber,
    floor: req.body.floor,
    status: req.body.status || "available"
  });

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room
  });
});

const listRooms = asyncHandler(async (req, res) => {
  const query = { propertyId: req.property._id };

  if (req.query.roomTypeId) {
    query.roomTypeId = req.query.roomTypeId;
  }

  const rooms = await Room.find(query).populate("roomTypeId", "name bedType capacity").sort({ roomNumber: 1 });

  res.status(200).json({
    success: true,
    data: rooms
  });
});

const getRoom = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid room id");
  }

  const room = await Room.findOne({ _id: req.params.id, propertyId: req.property._id }).populate(
    "roomTypeId",
    "name bedType capacity basePrice"
  );

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  res.status(200).json({
    success: true,
    data: room
  });
});

const updateRoom = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid room id");
  }

  const room = await Room.findOne({ _id: req.params.id, propertyId: req.property._id });

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  if (req.body.roomTypeId) {
    if (!isValidObjectId(req.body.roomTypeId)) {
      res.status(400);
      throw new Error("Invalid room type id");
    }

    const roomType = await getOwnedRoomType(req.body.roomTypeId, req.property._id);

    if (!roomType) {
      res.status(404);
      throw new Error("Room type not found for this property");
    }
  }

  Object.assign(room, req.body);
  await room.save();

  res.status(200).json({
    success: true,
    message: "Room updated successfully",
    data: room
  });
});

const deleteRoom = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid room id");
  }

  const room = await Room.findOneAndDelete({ _id: req.params.id, propertyId: req.property._id });

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  res.status(200).json({
    success: true,
    message: "Room deleted successfully"
  });
});

module.exports = {
  createRoom,
  listRooms,
  getRoom,
  updateRoom,
  deleteRoom
};
