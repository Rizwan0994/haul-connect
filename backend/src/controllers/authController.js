const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { user: User } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseUtils");

const register = async (req, res) => {
  try {
    const { username, password, email, category } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json(errorResponse("Username already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      category: category || "admin_user",
      role: "user",
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json(
      successResponse("User registered successfully", {
        user: { id: user.id, username: user.username, role: user.role },
        token,
      }),
    );
  } catch (error) {
    res.status(500).json(errorResponse("Error creating user", error.message));
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json(errorResponse("Invalid credentials"));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(errorResponse("Invalid credentials"));
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json(
      successResponse("Login successful", {
        user: { id: user.id, username: user.username, role: user.role },
        token,
      }),
    );
  } catch (error) {
    res.status(500).json(errorResponse("Error logging in", error.message));
  }
};

module.exports = {
  register,
  login,
};
