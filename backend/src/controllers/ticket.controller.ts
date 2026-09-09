import type { Request, Response } from "express";
import mongoose from "mongoose";

import { Ticket } from "../models/Ticket.js";
import { Event } from "../models/Event.js";
import { Booking } from "../models/Booking.js";

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

    const eventObjectId =
      new mongoose.Types.ObjectId(eventId);

    // Get tickets for this event
    const tickets = await Ticket.find({
      event: eventObjectId,
    }).sort({
      price: 1,
    });

    // Calculate total tickets
    const totalTickets = tickets.reduce(
      (total, ticket) =>
        total + ticket.quantity,
      0
    );

    // Get confirmed bookings for this event
    const bookings = await Booking.find({
      event: eventObjectId,
      status: "confirmed",
    });

    // Calculate tickets sold
    const soldTickets = bookings.reduce(
      (total, booking) => {
        const bookingQuantity =
          booking.tickets.reduce(
            (ticketTotal, bookingTicket) =>
              ticketTotal + bookingTicket.quantity,
            0
          );

        return total + bookingQuantity;
      },
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        tickets,
        totalTickets,
        soldTickets,
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};

// ==============================
// UPDATE TICKET
// ==============================

export const updateTicket = async (
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

    const ticketId = req.params.ticketId;

    // Validate ticket ID
    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const {
      name,
      price,
      quantity,
    } = req.body;

    // Find ticket
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Find related event
    const event = await Event.findById(ticket.event);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Only event organizer can update ticket
    if (
      event.organizer.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this ticket",
      });
    }

    // ==============================
    // UPDATE NAME
    // ==============================

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Ticket name is required",
        });
      }

      ticket.name = name.trim();
    }

    // ==============================
    // UPDATE PRICE
    // ==============================

    if (price !== undefined) {
      if (
        typeof price !== "number" ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be 0 or greater",
        });
      }

      ticket.price = price;
    }

    // ==============================
    // UPDATE QUANTITY
    // ==============================

    if (quantity !== undefined) {
      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      // Calculate tickets already sold
      const soldQuantity =
        ticket.quantity -
        ticket.availableQuantity;

      // Do not allow quantity below tickets already sold
      if (quantity < soldQuantity) {
        return res.status(400).json({
          success: false,
          message:
            `Quantity cannot be less than tickets already sold (${soldQuantity})`,
        });
      }

      // Calculate quantity difference
      const additionalQuantity =
        quantity - ticket.quantity;

      ticket.quantity = quantity;

      ticket.availableQuantity +=
        additionalQuantity;
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Update ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket",
    });
  }
};