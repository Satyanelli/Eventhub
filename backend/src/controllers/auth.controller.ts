import type { Request, Response, NextFunction } from "express";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../services/auth.service.js";

import User from "../models/User.js";

import AppError from "../utils/AppError.js";

// =========================
// REGISTER
// =========================

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// =========================
// LOGIN
// =========================

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await loginUser(req.body);

    console.log("LOGIN SUCCESS");

    res
      .cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: result.user,
      });
  } catch (error) {
    next(error);
  }
}

// =========================
// GET CURRENT USER
// =========================

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// =========================
// REFRESH ACCESS TOKEN
// =========================

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new AppError("Refresh token is required", 401);
    }

    const result = await refreshAccessToken(token);

    res
      .cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Access token refreshed",
      });
  } catch (error) {
    next(error);
  }
}

// =========================
// LOGOUT
// =========================

export function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        message: "Logout successful",
      });
  } catch (error) {
    next(error);
  }
}