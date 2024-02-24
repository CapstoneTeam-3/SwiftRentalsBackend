import { Router } from "express";
import { createBookingRequest } from "../controllers/booking.controller.js";

const router = Router();

router.post("/create", createBookingRequest);

export default router;
