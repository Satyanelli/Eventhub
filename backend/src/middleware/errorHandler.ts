import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export default errorHandler;