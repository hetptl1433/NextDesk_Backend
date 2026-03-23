const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const { requireFields } = require("../utils/validators");

const signup = asyncHandler(async (req, res) => {
  const missingFields = requireFields(req.body, ["name", "email", "password"]);

  if (missingFields.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const email = req.body.email.toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error("User already exists with this email");
  }

  const user = await User.create({
    name: req.body.name,
    email,
    password: req.body.password,
    role: "manager"
  });

  res.status(201).json({
    success: true,
    message: "Manager account created successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id)
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const missingFields = requireFields(req.body, ["email", "password"]);

  if (missingFields.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const email = req.body.email.toLowerCase();
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(req.body.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id)
    }
  });
});

module.exports = {
  signup,
  login
};
