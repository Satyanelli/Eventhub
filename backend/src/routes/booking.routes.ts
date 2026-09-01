
import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/booking.controller.js";

import { protect } from "../middleware/auth.js";

const router = Router();

// ==============================
// CREATE BOOKING
// ==============================

router.post(
  "/",
  protect,
  createBooking
);

// ==============================
// GET MY BOOKINGS
// ==============================

router.get(
  "/my-bookings",
  protect,
  getMyBookings
);

// ==============================
// CANCEL BOOKING
// ==============================

router.patch(
  "/:id/cancel",
  protect,
  cancelBooking
);

export default router;

