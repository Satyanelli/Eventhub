import type { Request, Response } from "express";
import { Event } from "../models/Event.js";

// Create Event
export const createEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      image,
      status,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      location,
      image,
      status,
      organizer: req.user.userId,
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      message: "Failed to create event",
    });
  }
};

// Get all published events
export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await Event.find({ status: "published" })
      .populate("organizer", "firstName lastName email")
      .sort({ date: 1 });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Get events error:", error);

    return res.status(500).json({
      message: "Failed to fetch events",
    });
  }
};

// Get organizer's own events
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const events = await Event.find({
      organizer: req.user.userId,
    })
      .populate("organizer", "firstName lastName email")
      .sort({ date: 1 });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Get my events error:", error);

    return res.status(500).json({
      message: "Failed to fetch your events",
    });
  }
};

// Get single event
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "firstName lastName email"
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Get event error:", error);

    return res.status(500).json({
      message: "Failed to fetch event",
    });
  }
};

// Update Event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this event",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      message: "Failed to update event",
    });
  }
};

// Delete Event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this event",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      message: "Failed to delete event",
    });
  }
};