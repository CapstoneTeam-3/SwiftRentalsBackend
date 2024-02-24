import { Schema, model } from "mongoose";
import Cars from "../models/CarModel.js";
import User from "../models/userModel.js";

const BookingSchema = new Schema({
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_booked: { type: Boolean, default: false },
  User: { type: Schema.Types.ObjectId, ref: "User", required: true },
  Car: { type: Schema.Types.ObjectId, ref: "Car", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Bookings = model("Bookings", BookingSchema);

export default Bookings;
