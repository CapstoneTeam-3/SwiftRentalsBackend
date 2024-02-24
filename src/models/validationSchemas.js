import { z } from "zod";

const isValidObjectId = (value) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(value);
};

export const BookingCreateSchema = z.object({
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

export const BookingDeleteSchema = z.object({
  booking_id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid MongoDB ObjectId.",
  }),
});

export const BookingListSchema = z.object({
  user_id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid MongoDB ObjectId.",
  }),
});
