import { Router } from "express";
import {
  createBookingRequest,
  deleteBookingRequestById as rejectBookingRequestById,
} from "../controllers/booking.controller.js";

const router = Router();

router.post("/create", createBookingRequest);
router.post("/reject", rejectBookingRequestById);

export default router;
