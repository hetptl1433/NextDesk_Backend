const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const RoomType = require("../models/RoomType");
const asyncHandler = require("../utils/asyncHandler");
const generateReservationCode = require("../utils/generateReservationCode");
const { requireFields, validateDateRange, isValidObjectId } = require("../utils/validators");

const ACTIVE_RESERVATION_STATUSES = ["confirmed", "checked_in", "checked_out"];

const getOwnedRoomType = async (roomTypeId, propertyId) => {
  return RoomType.findOne({ _id: roomTypeId, propertyId });
};

const getOwnedRoom = async (roomId, propertyId) => {
  return Room.findOne({ _id: roomId, propertyId });
};

const getReservedRoomIds = async ({ propertyId, roomTypeId, checkInDate, checkOutDate, excludeReservationId }) => {
  const query = {
    propertyId,
    roomTypeId,
    reservationStatus: { $in: ACTIVE_RESERVATION_STATUSES.filter((status) => status !== "checked_out") },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
    roomId: { $ne: null }
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const reservations = await Reservation.find(query).select("roomId");
  return reservations.map((reservation) => String(reservation.roomId));
};

const getAvailableRoomCount = async ({ propertyId, roomTypeId, checkInDate, checkOutDate, excludeReservationId }) => {
  const totalRooms = await Room.countDocuments({ propertyId, roomTypeId, status: "available" });
  const reservedRoomIds = await getReservedRoomIds({
    propertyId,
    roomTypeId,
    checkInDate,
    checkOutDate,
    excludeReservationId
  });

  return {
    totalRooms,
    reservedCount: reservedRoomIds.length,
    availableCount: Math.max(totalRooms - reservedRoomIds.length, 0),
    reservedRoomIds
  };
};

const createReservation = asyncHandler(async (req, res) => {
  const missingFields = requireFields(req.body, [
    "guestName",
    "guestEmail",
    "guestPhone",
    "roomTypeId",
    "checkInDate",
    "checkOutDate",
    "guestCount",
    "totalAmount"
  ]);

  if (missingFields.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  if (!isValidObjectId(req.body.roomTypeId)) {
    res.status(400);
    throw new Error("Invalid room type id");
  }

  const { valid, message, startDate, endDate } = validateDateRange(req.body.checkInDate, req.body.checkOutDate);

  if (!valid) {
    res.status(400);
    throw new Error(message);
  }

  const roomType = await getOwnedRoomType(req.body.roomTypeId, req.property._id);

  if (!roomType) {
    res.status(404);
    throw new Error("Room type not found for this property");
  }

  if (req.body.guestCount > roomType.capacity) {
    res.status(400);
    throw new Error("Guest count exceeds room type capacity");
  }

  let roomId = null;

  if (req.body.roomId) {
    if (!isValidObjectId(req.body.roomId)) {
      res.status(400);
      throw new Error("Invalid room id");
    }

    const room = await getOwnedRoom(req.body.roomId, req.property._id);

    if (!room || String(room.roomTypeId) !== String(req.body.roomTypeId)) {
      res.status(404);
      throw new Error("Assigned room not found for this room type");
    }

    const reservedRoomIds = await getReservedRoomIds({
      propertyId: req.property._id,
      roomTypeId: req.body.roomTypeId,
      checkInDate: startDate,
      checkOutDate: endDate
    });

    if (reservedRoomIds.includes(String(req.body.roomId))) {
      res.status(400);
      throw new Error("Assigned room is not available for the selected dates");
    }

    roomId = req.body.roomId;
  } else {
    const availability = await getAvailableRoomCount({
      propertyId: req.property._id,
      roomTypeId: req.body.roomTypeId,
      checkInDate: startDate,
      checkOutDate: endDate
    });

    if (availability.totalRooms === 0) {
      res.status(400);
      throw new Error("No rooms configured for this room type");
    }

    if (availability.availableCount <= 0) {
      res.status(400);
      throw new Error("No availability for the selected room type and dates");
    }
  }

  const reservation = await Reservation.create({
    propertyId: req.property._id,
    guestName: req.body.guestName,
    guestEmail: req.body.guestEmail.toLowerCase(),
    guestPhone: req.body.guestPhone,
    roomTypeId: req.body.roomTypeId,
    roomId,
    checkInDate: startDate,
    checkOutDate: endDate,
    guestCount: req.body.guestCount,
    totalAmount: req.body.totalAmount,
    paymentStatus: req.body.paymentStatus || "pending",
    reservationStatus: req.body.reservationStatus || "confirmed",
    reservationCode: await generateReservationCode()
  });

  res.status(201).json({
    success: true,
    message: "Reservation created successfully",
    data: reservation
  });
});

const listReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ propertyId: req.property._id })
    .populate("roomTypeId", "name bedType capacity")
    .populate("roomId", "roomNumber floor")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: reservations
  });
});

const getReservation = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid reservation id");
  }

  const reservation = await Reservation.findOne({ _id: req.params.id, propertyId: req.property._id })
    .populate("roomTypeId", "name bedType capacity basePrice")
    .populate("roomId", "roomNumber floor status");

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  res.status(200).json({
    success: true,
    data: reservation
  });
});

const updateReservation = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid reservation id");
  }

  const reservation = await Reservation.findOne({ _id: req.params.id, propertyId: req.property._id });

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  const roomTypeId = req.body.roomTypeId || reservation.roomTypeId;
  const roomId = req.body.roomId === undefined ? reservation.roomId : req.body.roomId;
  const checkInDateValue = req.body.checkInDate || reservation.checkInDate;
  const checkOutDateValue = req.body.checkOutDate || reservation.checkOutDate;

  const { valid, message, startDate, endDate } = validateDateRange(checkInDateValue, checkOutDateValue);

  if (!valid) {
    res.status(400);
    throw new Error(message);
  }

  if (!isValidObjectId(String(roomTypeId))) {
    res.status(400);
    throw new Error("Invalid room type id");
  }

  const roomType = await getOwnedRoomType(roomTypeId, req.property._id);

  if (!roomType) {
    res.status(404);
    throw new Error("Room type not found for this property");
  }

  const guestCount = req.body.guestCount || reservation.guestCount;

  if (guestCount > roomType.capacity) {
    res.status(400);
    throw new Error("Guest count exceeds room type capacity");
  }

  let nextRoomId = roomId || null;

  if (nextRoomId) {
    if (!isValidObjectId(String(nextRoomId))) {
      res.status(400);
      throw new Error("Invalid room id");
    }

    const room = await getOwnedRoom(nextRoomId, req.property._id);

    if (!room || String(room.roomTypeId) !== String(roomTypeId)) {
      res.status(404);
      throw new Error("Assigned room not found for this room type");
    }

    const reservedRoomIds = await getReservedRoomIds({
      propertyId: req.property._id,
      roomTypeId,
      checkInDate: startDate,
      checkOutDate: endDate,
      excludeReservationId: reservation._id
    });

    if (reservedRoomIds.includes(String(nextRoomId))) {
      res.status(400);
      throw new Error("Assigned room is not available for the selected dates");
    }
  } else {
    const availability = await getAvailableRoomCount({
      propertyId: req.property._id,
      roomTypeId,
      checkInDate: startDate,
      checkOutDate: endDate,
      excludeReservationId: reservation._id
    });

    if (availability.totalRooms === 0) {
      res.status(400);
      throw new Error("No rooms configured for this room type");
    }

    if (availability.availableCount <= 0) {
      res.status(400);
      throw new Error("No availability for the selected room type and dates");
    }
  }

  Object.assign(reservation, req.body);
  reservation.roomTypeId = roomTypeId;
  reservation.roomId = nextRoomId;
  reservation.checkInDate = startDate;
  reservation.checkOutDate = endDate;

  if (req.body.guestEmail) {
    reservation.guestEmail = req.body.guestEmail.toLowerCase();
  }

  await reservation.save();

  res.status(200).json({
    success: true,
    message: "Reservation updated successfully",
    data: reservation
  });
});

const cancelReservation = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid reservation id");
  }

  const reservation = await Reservation.findOne({ _id: req.params.id, propertyId: req.property._id });

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  reservation.reservationStatus = "cancelled";
  await reservation.save();

  res.status(200).json({
    success: true,
    message: "Reservation cancelled successfully",
    data: reservation
  });
});

const checkAvailability = asyncHandler(async (req, res) => {
  const missingFields = requireFields(req.query, ["roomTypeId", "checkInDate", "checkOutDate"]);

  if (missingFields.length) {
    res.status(400);
    throw new Error(`Missing required query params: ${missingFields.join(", ")}`);
  }

  if (!isValidObjectId(req.query.roomTypeId)) {
    res.status(400);
    throw new Error("Invalid room type id");
  }

  const { valid, message, startDate, endDate } = validateDateRange(req.query.checkInDate, req.query.checkOutDate);

  if (!valid) {
    res.status(400);
    throw new Error(message);
  }

  const roomType = await getOwnedRoomType(req.query.roomTypeId, req.property._id);

  if (!roomType) {
    res.status(404);
    throw new Error("Room type not found for this property");
  }

  const availability = await getAvailableRoomCount({
    propertyId: req.property._id,
    roomTypeId: req.query.roomTypeId,
    checkInDate: startDate,
    checkOutDate: endDate
  });

  res.status(200).json({
    success: true,
    data: {
      roomTypeId: roomType._id,
      roomTypeName: roomType.name,
      totalRooms: availability.totalRooms,
      availableRooms: availability.availableCount,
      isAvailable: availability.availableCount > 0,
      checkInDate: startDate,
      checkOutDate: endDate
    }
  });
});

module.exports = {
  createReservation,
  listReservations,
  getReservation,
  updateReservation,
  cancelReservation,
  checkAvailability
};
