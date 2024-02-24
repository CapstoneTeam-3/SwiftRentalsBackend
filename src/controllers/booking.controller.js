import { z } from "zod";
import { BookingStatus, UserRoles, mapValidationErrors } from "../constants.js";
import Bookings from "../models/BookingModel.js";
import Cars from "../models/CarModel.js";
import User from "../models/userModel.js";
import {
  BookingCreateSchema,
  BookingDeleteSchema,
  BookingListSchema,
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
      return res.status(201).json({ message: "Booking saved Successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to create booking" });
    }
  } catch (e) {
    //server error on failure
    console.log("Booking Create Error: ", e);
    res.sendStatus(500);
  }
  res.sendStatus(200);
};

export const rejectBookingRequestById = async (req, res) => {
  //get booking id from req
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
    //update reject booking status
    const updateBooking = await Bookings.findByIdAndUpdate(
      { _id: booking_id },
      { is_booked: BookingStatus.Rejected }
    );
    if (updateBooking) {
      //make car available again and return success
      await Cars.findByIdAndUpdate(updateBooking.Car, {
        is_available: true,
      });
      // Booking was rejected successfully
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
export const getAllBookingRequestsWithFilter = async (req, res) => {
  //get params from query
  const { active, user_id } = req.query;

  const validate = BookingListSchema.safeParse({ user_id });
  //if validation fail return map of error objects
  if (!validate.success) {
    const errors = mapValidationErrors(validate);
    return res.status(400).json({ errors });
  }
  //find user with given id
  const user = await User.findById(user_id);
  //return not found if doesnt exist
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  //check against constant of role
  if (user.role === UserRoles.carRental) {
    //if car renter
    //if active is given then include is_booked else get all by user
    var query = {};
    if (active == "true") {
      query = { User: user_id, is_booked: BookingStatus.Accepted };
    } else {
      query = { User: user_id };
    }
    console.log(active, query);
    //get booking and populate with required data only
    const bookings = await Bookings.find(query)
      .populate({
        path: "User",
        select: "_id name email role",
      })
      .populate({ path: "Car", select: "-availability" });
    if (!bookings)
      return req
        .status(200)
        .json({ message: "No booking exist for given user" });
    return res.status(200).json(bookings);
  } else {
    //if car owner
    //get all user cars
    const cars = await Cars.find({ User: user_id });
    if (!cars) {
      return req.status(200).json({ message: "No cars exist for given user" });
    }
    const carIds = cars.map((car) => car._id);
    const bookings = [];
    //for each of owners car get booking related to it
    for (const carId of carIds) {
      //if active is given then include is_booked else get all by user
      var query = {};
      if (active == "true") {
        query = { User: user_id, is_booked: BookingStatus.Accepted };
      } else {
        query = { User: user_id };
      }
      console.log(query);
      const currentBookings = await Bookings.find(query)
        .populate({
          path: "User",
          select: "_id name email role",
        })
        .populate({ path: "Car", select: "-availability" });
      bookings.push(currentBookings);
    }
    //if no booking return failure
    if (!bookings)
      return req
        .status(200)
        .json({ message: "No booking exist for given user" });
    return res.status(200).json(bookings);
  }
};
