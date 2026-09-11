import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { sendEmail } from "../utils/email.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

import jwt from "jsonwebtoken";

// =========================
// REGISTER USER
// =========================

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
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Generate secure verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Token expires after 24 hours
  const verificationExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    isVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  // Verification link
  const verificationUrl =
    `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  // Send verification email
  await sendEmail(
    user.email,
    "Verify your EventHub account",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to EventHub, ${user.firstName}! 🎉</h2>

        <p>
          Thank you for creating an EventHub account.
        </p>

        <p>
          Please verify your email address by clicking the button below:
        </p>

        <p>
          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Verify Email
          </a>
        </p>

        <p>
          This verification link will expire in <strong>24 hours</strong>.
        </p>

        <p>
          If you did not create an EventHub account, you can ignore this email.
        </p>

        <p>
          Thanks,<br />
          EventHub Team
        </p>
      </div>
    `
  );

  return user;
}

// =========================
// LOGIN USER
// =========================

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({ email: data.email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Email verification check
  if (!user.isVerified) {
    throw new AppError(
      "Please verify your email before logging in",
      403
    );
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

// =========================
// VERIFY EMAIL
// =========================

export async function verifyEmail(token: string) {
  if (!token) {
    throw new AppError("Verification token is required", 400);
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw new AppError(
      "Invalid or expired verification link",
      400
    );
  }

  user.isVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;

  await user.save();

  return user;
}

// =========================
// FORGOT PASSWORD
// =========================

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email });

  // Don't reveal whether an account exists
  if (!user) {
    return;
  }

  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before storing it in database
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expires after 15 minutes
  const resetExpires = new Date(
    Date.now() + 15 * 60 * 1000
  );

  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = resetExpires;

  await user.save();

  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await sendEmail(
    user.email,
    "Reset your EventHub password",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request 🔐</h2>

        <p>
          Hello ${user.firstName},
        </p>

        <p>
          We received a request to reset your EventHub password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This password reset link will expire in
          <strong>15 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>

        <p>
          Thanks,<br />
          EventHub Team
        </p>
      </div>
    `
  );
}

// =========================
// RESET PASSWORD
// =========================

export async function resetPassword(
  token: string,
  newPassword: string
) {
  if (!token) {
    throw new AppError(
      "Password reset token is required",
      400
    );
  }

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetExpires: {
      $gt: new Date(),
    },
  }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid or expired password reset link",
      400
    );
  }

  // Hash new password
  user.password = await bcrypt.hash(newPassword, 12);

  // Invalidate reset token
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();
}

// =========================
// REFRESH ACCESS TOKEN
// =========================

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

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.role
    );

    return {
      accessToken,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Invalid or expired refresh token",
      401
    );
  }
}