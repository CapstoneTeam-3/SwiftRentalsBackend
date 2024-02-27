import { Router } from "express";
import {
  createBookingRequest,
  getAllBookingRequestsWithFilter,
  rejectBookingRequestById,
  setBookingRequestResponse,
} from "../controllers/booking.controller.js";

const router = Router();

router.get("/list", getAllBookingRequestsWithFilter);
router.post("/create", createBookingRequest);
router.post("/reject", rejectBookingRequestById);
router.post("/respond", setBookingRequestResponse);

export default router;
