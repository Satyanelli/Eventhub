import type { Request, Response } from "express";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import crypto from "crypto";

import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";
import { Booking } from "../models/Booking.js";
import User from "../models/User.js";

import { sendEmail } from "../utils/email.js";
import { generateTicketPdf } from "../utils/ticketPdf.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

export async function createPaymentOrder(
  req: Request,
  res: Response
) {
  try {
    const { eventId, tickets } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!eventId || !tickets || !Array.isArray(tickets)) {
      return res.status(400).json({
        success: false,
        message: "Event and tickets are required",
      });
    }

    const event = await Event.findOne({
      _id: eventId,
      status: "published",
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    let totalAmount = 0;

    const ticketDetails = [];

    for (const item of tickets) {
      const ticket = await Ticket.findOne({
        _id: item.ticketId,
        event: eventId,
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket quantity",
        });
      }

      if (ticket.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${ticket.availableQuantity} tickets available for ${ticket.name}`,
        });
      }

      const ticketTotal =
        ticket.price * item.quantity;

      totalAmount += ticketTotal;

      ticketDetails.push({
        ticket,
        quantity: item.quantity,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `eventhub_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,

        // Added Razorpay Key ID for frontend checkout
        keyId: process.env.RAZORPAY_KEY_ID,

        eventId: event._id,
        tickets: ticketDetails.map((item) => ({
          ticketId: item.ticket._id,
          name: item.ticket.name,
          quantity: item.quantity,
          price: item.ticket.price,
        })),
      },
    });
  } catch (error) {
    console.error(
      "Create payment order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
}

// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

export async function verifyPayment(
  req: Request,
  res: Response
) {
  const session =
    await mongoose.startSession();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      tickets,
    } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !eventId ||
      !tickets ||
      !Array.isArray(tickets)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    // =================================================
    // VERIFY RAZORPAY SIGNATURE
    // =================================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET!
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // =================================================
    // CHECK DUPLICATE PAYMENT
    // =================================================

    const existingBooking =
      await Booking.findOne({
        paymentId: razorpay_payment_id,
      });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Payment has already been processed",
      });
    }

    // =================================================
    // GET USER
    // =================================================

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // TRANSACTION
    // =================================================

    let createdBooking: any = null;
    let bookedEvent: any = null;

    session.startTransaction();

    const event = await Event.findOne(
      {
        _id: eventId,
        status: "published",
      },
      null,
      { session }
    );

    if (!event) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    bookedEvent = event;

    const bookingTickets = [];
    let totalAmount = 0;

    // =================================================
    // ATOMIC TICKET AVAILABILITY CHECK + DECREMENT
    // =================================================

    for (const item of tickets) {
      const quantity = Number(
        item.quantity
      );

      if (!quantity || quantity <= 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Invalid ticket quantity",
        });
      }

      const ticket =
        await Ticket.findOneAndUpdate(
          {
            _id: item.ticketId,
            event: eventId,
            availableQuantity: {
              $gte: quantity,
            },
          },
          {
            $inc: {
              availableQuantity: -quantity,
            },
          },
          {
            returnDocument: "after",
            session,
          }
        );

      if (!ticket) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Not enough tickets available",
        });
      }

      const ticketTotal =
        ticket.price * quantity;

      totalAmount += ticketTotal;

      bookingTickets.push({
        ticket: ticket._id,
        name: ticket.name,
        quantity,
        price: ticket.price,
      });
    }

    // =================================================
    // CREATE BOOKING
    // =================================================

    const booking =
      await Booking.create(
        [
          {
            user: req.user.userId,
            event: eventId,
            tickets: bookingTickets,
            totalAmount,
            status: "confirmed",
            paymentOrderId:
              razorpay_order_id,
            paymentId:
              razorpay_payment_id,
          },
        ],
        { session }
      );

    createdBooking =
      booking[0];

    // =================================================
    // COMMIT TRANSACTION
    // =================================================

    await session.commitTransaction();

    // =================================================
    // GENERATE PDF + SEND EMAIL
    // =================================================

    try {
      console.log(
        "🔥 BOOKING EMAIL CODE IS RUNNING"
      );

      const ticketPdf =
        await generateTicketPdf({
          bookingId:
            createdBooking._id.toString(),

          eventName:
            bookedEvent.title,

          date:
            new Date(
              bookedEvent.date
            ).toLocaleDateString(),

          time:
            bookedEvent.time,

          location:
            bookedEvent.location,

          tickets:
            createdBooking.tickets,

          totalAmount:
            createdBooking.totalAmount,
        });

      await sendEmail(
        user.email,

        "EventHub Booking Confirmation",

        `
          <h2>Booking Confirmed 🎉</h2>

          <p>Hello ${user.firstName},</p>

          <p>
            Your booking has been successfully confirmed.
          </p>

          <h3>Event Details</h3>

          <p>
            <strong>Event:</strong>
            ${bookedEvent.title}
          </p>

          <p>
            <strong>Date:</strong>
            ${new Date(
              bookedEvent.date
            ).toLocaleDateString()}
          </p>

          <p>
            <strong>Time:</strong>
            ${bookedEvent.time}
          </p>

          <p>
            <strong>Location:</strong>
            ${bookedEvent.location}
          </p>

          <h3>Ticket Details</h3>

          ${createdBooking.tickets
            .map(
              (ticket: any) => `
                <p>
                  ${ticket.name} ×
                  ${ticket.quantity}
                  — ₹${ticket.price *
                  ticket.quantity}
                </p>
              `
            )
            .join("")}

          <h3>Booking Information</h3>

          <p>
            <strong>Booking ID:</strong>
            ${createdBooking._id}
          </p>

          <p>
            <strong>Payment ID:</strong>
            ${createdBooking.paymentId}
          </p>

          <p>
            <strong>Total Paid:</strong>
            ₹${createdBooking.totalAmount}
          </p>

          <p>
            <strong>Status:</strong>
            Confirmed
          </p>

          <p>
            📄 Your ticket PDF is attached
            to this email.
          </p>

          <p>
            Thank you for booking with EventHub!
          </p>
        `,

        [
          {
            filename:
              `EventHub-Ticket-${createdBooking._id}.pdf`,

            content: ticketPdf,

            contentType:
              "application/pdf",
          },
        ]
      );

      console.log(
        "Booking confirmation email with PDF sent to:",
        user.email
      );
    } catch (emailError) {
      console.error(
        "❌ Booking confirmation email failed:",
        emailError
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Payment verified and booking confirmed",
      data: {
        booking: createdBooking,
      },
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Verify payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify payment",
    });
  } finally {
    await session.endSession();
  }
}