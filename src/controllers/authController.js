// src/controllers/authController.js
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/index.js";
import passwordValidator from "password-validator";

const schema = new passwordValidator();
schema
  .is()
  .min(8)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces();

export const register = async (req, res) => {
  try {
    const { name, email, password, dob, role } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ error: "Invalid name. Please provide a valid name." });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email. Please provide a valid email address.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error:
          "User with this email already exists. Please choose a different email address.",
      });
    }

    // Validate password
    const isPasswordValid = schema.validate(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Invalid password. Please follow the password policy.",
      });
    }

    // Validate confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate dob (date of birth)
    if (!dob || !isValidDate(dob)) {
      return res
        .status(400)
        .json({ error: "Invalid date of birth. Please provide a valid date." });
    }

    // Validate role (assuming it should be a string)
    const allowedRoles = ["admin", "car owner", "car rental"];
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "Invalid role. Please provide a valid role." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      dob,
      role,
    });

    // Save the user to the database
    await newUser.save();

    // Create and sign a JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Respond with the token
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regex) !== null;
};
