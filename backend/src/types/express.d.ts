import type { Request } from "express";

export interface AuthUser {
  userId: string;
  role: "attendee" | "organizer";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};