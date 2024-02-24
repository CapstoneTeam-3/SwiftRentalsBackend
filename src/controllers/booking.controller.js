import { z } from "zod";
import { BookingStatus, mapValidationErrors } from "../constants.js";
import Bookings from "../models/BookingModel.js";
import Cars from "../models/CarModel.js";
import User from "../models/userModel.js";
import {
  BookingCreateSchema,
  BookingDeleteSchema,
} from "../models/validationSchemas.js";

//schema to server side validate data

export const createBookingRequest = async (req, res) => {
  const currentBooking = req.body;
  //run schema validation
  const validate = BookingCreateSchema.safeParse({ ...currentBooking });
  //if validation fail return map of error objects
  if (!validate.success) {
    const errors = mapValidationErrors(validate);
    return res.status(400).json({ errors });
  }
  try {
    //check if booking already exists
    const isBookingExist = await Bookings.findOne({
      User: currentBooking.user_id,
      Car: currentBooking.car_id,
    });
    //allow booking if its date is after the rejected request period
    if (isBookingExist && isBookingExist.is_booked === BookingStatus.Rejected) {
      if (
        new Date(isBookingExist.end_date) >= new Date(currentBooking.start_date)
      ) {
        return res.status(400).json({ error: "This request already exists" });
      }
    }

    //check if user is valid
    const isUserExist = await User.findById(currentBooking.user_id);
    if (!isUserExist) {
      return res.status(400).json({ error: "User with the id not found" });
    }
    //check if car is valid
    const isCarExist = await Cars.findById(currentBooking.car_id);
    if (!isCarExist) {
      return res.status(400).json({ error: "car with the id not found" });
    }
    //create booking
    const newBooking = await Bookings.create({
      ...currentBooking,
      User: currentBooking.user_id,
      Car: currentBooking.car_id,
    });

    if (newBooking) {
      //make car unavailable and return success
      await Cars.findByIdAndUpdate(currentBooking.car_id, {
        is_available: false,
      });
      return res.status(200).json({ message: "Booking saved Successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to create booking" });
    }
  } catch (e) {
    console.log("Booking Create Error: ", e);
    res.sendStatus(500);
  }
  res.sendStatus(200);
};

export const deleteBookingRequestById = async (req, res) => {
  const { booking_id } = req.body;
  //run schema validation
  const validate = BookingDeleteSchema.safeParse({ booking_id });
  //if validation fail return map of error objects
  if (!validate.success) {
    const errors = mapValidationErrors(validate);
    return res.status(400).json({ errors });
  }
  try {
    //check if booking already exists
    const isBookingExist = await Bookings.findById(booking_id);
    if (!isBookingExist) {
      return res.status(400).json({ error: "Requested booking dosen't exist" });
    }
    //delete booking
    const updateBooking = await Bookings.findByIdAndUpdate(
      { _id: booking_id },
      { is_booked: BookingStatus.Rejected }
    );
    if (updateBooking) {
      //make car available again and return success
      await Cars.findByIdAndUpdate(updateBooking.Car, {
        is_available: true,
      });
      // Booking was deleted successfully
      return res.status(200).json({ message: "Booking Rejected successfully" });
    } else {
      // No matching booking found
      return res.status(404).json({ error: "Booking not found" });
    }
  } catch (e) {
    console.log("Booking Create Error: ", e);
    res.sendStatus(500);
  }
  res.sendStatus(200);
};
