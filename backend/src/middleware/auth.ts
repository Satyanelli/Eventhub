import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import AppError from "../utils/AppError.js";
import type { AuthUser } from "../types/express.js";

export function protect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("PAYMENT/PROTECT COOKIE:", req.cookies.accessToken);
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError("Not authenticated", 401);
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    const decoded = jwt.verify(token, secret) as AuthUser;

    console.log("PAYMENT AUTH USER:", decoded);

    if (!decoded.userId || !decoded.role) {
      throw new AppError("Invalid access token", 401);
    }

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
}