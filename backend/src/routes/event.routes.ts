import { Router } from "express";

import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// Public routes
router.get("/", getEvents);

// Organizer only
router.get(
  "/my-events",
  protect,
  authorize("organizer"),
  getMyEvents
);

// Public single event
router.get("/:id", getEventById);

// Organizer only
router.post(
  "/",
  protect,
  authorize("organizer"),
  createEvent
);

router.patch(
  "/:id",
  protect,
  authorize("organizer"),
  updateEvent
);

router.delete(
  "/:id",
  protect,
  authorize("organizer"),
  deleteEvent
);

export default router;