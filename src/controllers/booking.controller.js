import { z } from "zod";
import Bookings from "../models/BookingModel.js";
import Cars from "../models/CarModel.js";
import User from "../models/userModel.js";

const isValidObjectId = (value) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(value);
};
//schema to server side validate data
const BookingSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid start date format. Date must be in yyyy-mm-dd format.",
  }),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid end date format. Date must be in yyyy-mm-dd format.",
  }),
  user_id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid MongoDB ObjectId.",
  }),
  car_id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid MongoDB ObjectId.",
  }),
});

export const createBookingRequest = async (req, res) => {
  const currentBooking = req.body;
  //run schema validation
  const validate = BookingSchema.safeParse({ ...currentBooking });
  //if validation fail return map of error objects
  if (!validate.success) {
    const errors = validate.error.errors.reduce((acc, error) => {
      acc[error.path[0]] = error.message;
      return acc;
    }, {});
    return res.status(400).json({ errors });
  }
  try {
    //check if booking already exists
    const isBookingExist = await Bookings.findOne({
      User: currentBooking.user_id,
      Car: currentBooking.car_id,
    });
    if (isBookingExist) {
      return res
        .status(400)
        .json({ error: "User has already requested booking for this car" });
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
