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

const router = Router();

// Public routes
router.get("/", getEvents);

// Protected organizer route
router.get("/my-events", protect, getMyEvents);

// Public single event
router.get("/:id", getEventById);

// Protected routes
router.post("/", protect, createEvent);

router.patch("/:id", protect, updateEvent);

router.delete("/:id", protect, deleteEvent);

export default router;