import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import ticketRoutes from "./routes/ticket.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Authentication routes
app.use("/api/auth", authRoutes);

// Event routes
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "eventhub is running",
  });
});

// Error handler - should be last
app.use(errorHandler);

export default app;