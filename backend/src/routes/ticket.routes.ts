
import { Router } from "express";

import {
  createTicket,
  getTicketsByEvent,
} from "../controllers/ticket.controller.js";

import { protect } from "../middleware/auth.js";

const router = Router();

// Get tickets for an event
router.get(
  "/event/:eventId",
  getTicketsByEvent
);

// Create ticket - organizer only
router.post(
  "/event/:eventId",
  protect,
  createTicket
);

export default router;

