import { Router } from "express";

import {
  createTicket,
  getTicketsByEvent,
  updateTicket,
} from "../controllers/ticket.controller.js";

import { protect } from "../middleware/auth.js";

const router = Router();

// ==============================
// GET TICKETS FOR AN EVENT
// ==============================

router.get(
  "/event/:eventId",
  getTicketsByEvent
);

// ==============================
// CREATE TICKET - ORGANIZER ONLY
// ==============================

router.post(
  "/event/:eventId",
  protect,
  createTicket
);

// ==============================
// UPDATE TICKET - ORGANIZER ONLY
// ==============================

router.patch(
  "/:ticketId",
  protect,
  updateTicket
);

export default router;