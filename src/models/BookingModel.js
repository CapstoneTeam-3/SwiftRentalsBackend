import { Schema, model } from "mongoose";
import { BookingStatus } from "../constants.js";

const BookingSchema = new Schema({
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_booked: { type: String, default: BookingStatus.Pending },
  User: { type: Schema.Types.ObjectId, ref: "User", required: true },
  Car: { type: Schema.Types.ObjectId, ref: "Cars", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Bookings = model("Bookings", BookingSchema);

export default Bookings;
