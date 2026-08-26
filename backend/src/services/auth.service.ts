import bcrypt from "bcryptjs";

import User from "../models/User.js";

import AppError from "../utils/AppError.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

import jwt from "jsonwebtoken";


export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "attendee" | "organizer";
}) {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
    // note: 409 specifically means "Conflict", and an already-registered email
    // is a conflict with the current state of the database.
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    role: data.role,
  });

  return user;
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({ email: data.email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(
    user._id.toString(),
    user.role
  );

  const refreshToken = generateRefreshToken(
    user._id.toString()
  );

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(token: string) {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded.userId) {
      throw new AppError("Invalid refresh token", 401);
    }

    const accessToken = generateAccessToken(
      decoded.userId,
      decoded.role
    );

    return {
      accessToken,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired refresh token", 401);
  }
}