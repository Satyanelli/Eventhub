
import type { Request, Response } from "express";
import mongoose from "mongoose";

import { Booking } from "../models/Booking.js";
import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";

// ==============================
// CREATE BOOKING
// ==============================

export const createBooking = async (
  req: Request,
  res: Response
) => {
  try {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { eventId, tickets } = req.body;

    // ==============================
    // VALIDATE EVENT ID
    // ==============================

    if (
      !eventId ||
      typeof eventId !== "string" ||
      !mongoose.Types.ObjectId.isValid(eventId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // ==============================
    // VALIDATE TICKETS
    // ==============================

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one ticket is required",
      });
    }

    // ==============================
    // FIND EVENT
    // ==============================

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This event is not available for booking",
      });
    }

    // ==============================
    // VALIDATE TICKETS & AVAILABILITY
    // ==============================

    const bookingTickets = [];
    let totalAmount = 0;

    for (const selectedTicket of tickets) {
      const { ticketId, quantity } = selectedTicket;

      if (
        !ticketId ||
        typeof ticketId !== "string" ||
        !mongoose.Types.ObjectId.isValid(ticketId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket ID",
        });
      }

      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Ticket quantity must be at least 1",
        });
      }

      const ticket = await Ticket.findOne({
        _id: ticketId,
        event: eventId,
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found for this event",
        });
      }

      // Prevent overbooking
      if (ticket.availableQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${ticket.availableQuantity} ${ticket.name} tickets are available`,
        });
      }

      const ticketTotal = ticket.price * quantity;

      totalAmount += ticketTotal;

      bookingTickets.push({
        ticket: ticket._id,
        name: ticket.name,
        quantity,
        price: ticket.price,
      });
    }

    // ==============================
    // REDUCE AVAILABLE TICKETS
    // ==============================

    for (const selectedTicket of tickets) {
      await Ticket.findByIdAndUpdate(
        selectedTicket.ticketId,
        {
          $inc: {
            availableQuantity: -selectedTicket.quantity,
          },
        }
      );
    }

    // ==============================
    // CREATE BOOKING
    // ==============================

    const booking = await Booking.create({
      user: req.user.userId,
      event: eventId,
      tickets: bookingTickets,
      totalAmount,
      status: "confirmed",
    });

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

// ==============================
// GET MY BOOKINGS
// ==============================

export const getMyBookings = async (
  req: Request,
  res: Response
) => {
  try {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const bookings = await Booking.find({
      user: req.user.userId,
    })
      .populate(
        "event",
        "title date time location image"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ==============================
// CANCEL BOOKING
// ==============================

export const cancelBooking = async (
  req: Request,
  res: Response
) => {
  try {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const bookingId = req.params.id;

    // Validate booking ID
    if (
      !bookingId ||
      Array.isArray(bookingId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Find booking belonging to current user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // ==============================
    // RETURN TICKETS
    // ==============================

    for (const bookingTicket of booking.tickets) {
      await Ticket.findByIdAndUpdate(
        bookingTicket.ticket,
        {
          $inc: {
            availableQuantity: bookingTicket.quantity,
          },
        }
      );
    }

    // ==============================
    // UPDATE BOOKING STATUS
    // ==============================

    booking.status = "cancelled";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

