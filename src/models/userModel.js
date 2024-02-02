// src/models/userModel.js
import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  role: { type: String, required: true },
  isConfirmed: { type: Boolean, required: true, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

const User = model("User", userSchema);

export default User;
