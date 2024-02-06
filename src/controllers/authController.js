// src/controllers/authController.js
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET_KEY,
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASSWORD,
} from "../config/index.js";
import passwordValidator from "password-validator";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

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
    const { name, email, password, dob, role, confirmPassword } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ error: "Invalid name. Please provide a valid name." });
    }

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

    const isPasswordValid = schema.validate(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Invalid password. Please follow the password policy.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!dob || !isValidDate(dob)) {
      return res
        .status(400)
        .json({ error: "Invalid date of birth. Please provide a valid date." });
    }

    const allowedRoles = ["admin", "car owner", "car rental"];
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "Invalid role. Please provide a valid role." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      dob,
      role,
    });

    let token = generateToken(newUser._id);

    const confirmationLink = `http://localhost:3001/api/auth/verify?token=${token}`;

    const text = {
      subject: "Confirmation Email",
      message: `Click <a href="${confirmationLink}">here</a> to confirm your email.`,
    };

    sendEmail(email, text);

    await newUser.save();

    res.json({ message: "Registration successful. Confirmation email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email. Please provide a valid email address.",
    });
  }

  const isPasswordValid = schema.validate(password);

  if (!isPasswordValid) {
    return res.status(400).json({
      error: "Invalid password. Please follow the password policy.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    if (!user.isConfirmed) {
      return res.status(401).json({
        error:
          "Email not verified. Please check your email for verification instructions.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    let token = generateToken(user._id);

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const profile = async (req, res) => {
  try {
    const userDocument = await User.findById(req.user.userId).select(
      "-password"
    );
    res.json({ message: "Profile route", userData: userDocument });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email. Please provide a valid email address.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found with the provided email" });
    }

    let token = generateToken(user._id);
    const resetLink = `http://localhost:3001/api/auth/reset-password?token=${token}`;
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const text = {
      subject: "Reset Password Email",
      message: `Click <a href="${resetLink}">here</a> to reset your password.`,
    };

    await sendEmail(email, text);
    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "Please enter new password." });
  }

  const isPasswordValid = schema.validate(newPassword);
  if (!isPasswordValid) {
    return res.status(400).json({
      error: "Invalid password. Please follow the password policy.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid user ID in the reset token" });
    }

    if (Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ error: "Expired reset token" });
    }

    // Update user password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid or expired reset token" });
  }
};

export const verify = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    await User.findByIdAndUpdate(decoded.userId, {
      $set: { isConfirmed: true },
    });

    res.json({ message: "Email confirmation successful." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid confirmation token." });
  }
};

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regex) !== null;
};

const sendEmail = async (email, text) => {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: text.subject,
    html: text.message,
  };

  await transporter.sendMail(mailOptions);
};

const generateToken = (user) => {
  return jwt.sign({ userId: user }, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
};
