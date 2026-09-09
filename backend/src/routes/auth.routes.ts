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
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Email verification
router.get("/verify-email", verifyEmailController);

router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.get("/me", protect, getMe);

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