import { Router } from "express";
import {
  createBookingRequest,
  getAllBookingRequestsWithFilter,
  rejectBookingRequestById,
} from "../controllers/booking.controller.js";

const router = Router();

router.get("/list", getAllBookingRequestsWithFilter);
router.post("/create", createBookingRequest);
router.post("/reject", rejectBookingRequestById);

export default router;
