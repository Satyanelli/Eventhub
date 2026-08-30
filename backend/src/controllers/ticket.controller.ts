
import type { Request, Response } from "express";
import mongoose from "mongoose";

import { Ticket } from "../models/Ticket.js";
import { Event } from "../models/Event.js";

// ==============================
// CREATE TICKET
// ==============================

export const createTicket = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const eventId = req.params.eventId;

    // Make sure eventId exists
    if (!eventId || Array.isArray(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Make sure eventId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const {
      name,
      price,
      quantity,
    } = req.body;

    // Validate ticket name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Ticket name is required",
      });
    }

    // Validate price
    if (price === undefined || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be 0 or greater",
      });
    }

    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Only event organizer can create tickets
    if (
      event.organizer.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this event",
      });
    }

    // Create ticket
    const ticket = await Ticket.create({
      event: new mongoose.Types.ObjectId(eventId),
      name,
      price,
      quantity,
      availableQuantity: quantity,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create ticket",
    });
  }
};

// ==============================
// GET TICKETS BY EVENT
// ==============================

export const getTicketsByEvent = async (
  req: Request,
  res: Response
) => {
  try {
    const eventId = req.params.eventId;

    // Make sure eventId exists
    if (!eventId || Array.isArray(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Make sure eventId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const tickets = await Ticket.find({
      event: new mongoose.Types.ObjectId(eventId),
    }).sort({
      price: 1,
    });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};

