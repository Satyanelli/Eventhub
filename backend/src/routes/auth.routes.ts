import { Router } from "express";

import validate from "../middleware/validate.js";

import { protect } from "../middleware/auth.js";

import { authorize } from "../middleware/authorize.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";

import {
  register,
  login,
  verifyEmailController,
  getMe,
  refreshToken,
  logout,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller.js";

const router = Router();

// =========================
// PUBLIC AUTH ROUTES
// =========================

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

// Forgot password
router.post(
  "/forgot-password",
  forgotPasswordController
);

// Reset password
router.post(
  "/reset-password",
  resetPasswordController
);

// Email verification
router.get(
  "/verify-email",
  verifyEmailController
);

// Refresh token
router.post(
  "/refresh-token",
  refreshToken
);

// Logout
router.post(
  "/logout",
  logout
);

// =========================
// PROTECTED ROUTES
// =========================

router.get(
  "/me",
  protect,
  getMe
);

router.get(
  "/organizer-test",
  protect,
  authorize("organizer"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Organizer access granted",
    });
  }
);

export default router;