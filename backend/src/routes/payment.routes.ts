
import { Router } from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

import { protect } from "../middleware/auth.js";

const router = Router();

// Create Razorpay order
router.post(
  "/create-order",
  protect,
  createPaymentOrder
);

// Verify Razorpay payment
router.post(
  "/verify",
  protect,
  verifyPayment
);

export default router;

