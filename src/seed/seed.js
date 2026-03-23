require("dotenv").config();

const connectDB = require("../config/db");
const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const RoomType = require("../models/RoomType");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");

const seed = async () => {
  await connectDB();

  await Promise.all([
    Reservation.deleteMany({}),
    Room.deleteMany({}),
    RoomType.deleteMany({}),
    Property.deleteMany({}),
    User.deleteMany({})
  ]);

  const manager = await User.create({
    name: "Demo Manager",
    email: "manager@nextdesk.com",
    password: "password123",
    role: "manager"
  });

  const property = await Property.create({
    ownerId: manager._id,
    name: "Next Desk Motel",
    address: "123 Highway Lane, Indianapolis, IN 46201",
    phone: "+1-317-555-0100",
    email: "stay@nextdeskmotel.com",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    policies: "Valid ID required at check-in. No smoking. Pets allowed in selected rooms only."
  });

  const roomTypes = await RoomType.insertMany([
    {
      propertyId: property._id,
      name: "Standard Queen",
      bedType: "1 Queen Bed",
      capacity: 2,
      basePrice: 89,
      amenities: ["WiFi", "TV", "Mini Fridge"]
    },
    {
      propertyId: property._id,
      name: "Double Queen",
      bedType: "2 Queen Beds",
      capacity: 4,
      basePrice: 119,
      amenities: ["WiFi", "TV", "Mini Fridge", "Microwave"]
    },
    {
      propertyId: property._id,
      name: "King Suite",
      bedType: "1 King Bed",
      capacity: 3,
      basePrice: 149,
      amenities: ["WiFi", "TV", "Mini Fridge", "Microwave", "Sofa"]
    }
  ]);

  await Room.insertMany([
    { propertyId: property._id, roomTypeId: roomTypes[0]._id, roomNumber: "101", floor: 1, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[0]._id, roomNumber: "102", floor: 1, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[0]._id, roomNumber: "103", floor: 1, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[0]._id, roomNumber: "104", floor: 1, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[1]._id, roomNumber: "201", floor: 2, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[1]._id, roomNumber: "202", floor: 2, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[1]._id, roomNumber: "203", floor: 2, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[2]._id, roomNumber: "301", floor: 3, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[2]._id, roomNumber: "302", floor: 3, status: "available" },
    { propertyId: property._id, roomTypeId: roomTypes[2]._id, roomNumber: "303", floor: 3, status: "maintenance" }
  ]);

  console.log("Seed completed successfully");
  console.log("Manager login:");
  console.log("email: manager@nextdesk.com");
  console.log("password: password123");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
