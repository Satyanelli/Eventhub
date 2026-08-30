import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: z.string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),

email: z
  .email("Please provide a valid email address")
  .trim()
  .toLowerCase(),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
//   .regex(/[A-Z]/, "Password must contain an uppercase letter")
//   .regex(/[a-z]/, "Password must contain a lowercase letter")
//   .regex(/[0-9]/, "Password must contain a number")
//   .regex(/[^A-Za-z0-9]/, "Password must contain a special character")  //keeping it simple 

  role: z
    .enum(["attendee", "organizer"])
    .default("attendee"),
});

export const loginSchema = z.object({
  email: z
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required"),
});