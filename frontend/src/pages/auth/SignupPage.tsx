import { useState } from "react";
import { registerUser } from "../../api/auth.api";

import {
  signupSchema,
  type SignupFormData,
} from "../../validators/auth.validator";

function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "attendee",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});

  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setServerError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrors({});
    setServerError("");
    setSuccessMessage("");

    // Validate using Zod
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof SignupFormData, string>
      > = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignupFormData;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    try {
      // confirmPassword is only for frontend validation.
      // It should NOT be sent to the backend.
      const { confirmPassword, ...registrationData } = result.data;

      const response = await registerUser(registrationData);

      console.log("Registration successful:", response);

      setSuccessMessage(
        response.message || "Registration successful!"
      );

      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "attendee",
      });

      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error("Registration failed:", error);

      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      setServerError(message);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-brand-900">
              Create your account
            </h1>

            <p className="mt-2 text-brand-600">
              Join EventHub and discover amazing events
            </p>
          </div>

          {/* Success message */}
          {successMessage && (
            <p className="mb-4 text-center text-sm font-semibold text-green-600">
              {successMessage}
            </p>
          )}

          {/* Server error */}
          {serverError && (
            <p className="mb-4 text-center text-sm font-semibold text-red-500">
              {serverError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                First Name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />

              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Last Name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />

              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Account Type
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-brand-100 bg-white px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="attendee">
                  Attendee
                </option>

                <option value="organizer">
                  Organizer
                </option>
              </select>

              {errors.role && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full rounded-lg border border-brand-100 px-4 py-3 pr-12
                  text-brand-900 outline-none
                  focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2
                  text-sm font-semibold text-brand-500
                  hover:text-brand-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full rounded-lg border border-brand-100 px-4 py-3 pr-12
                  text-brand-900 outline-none
                  focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2
                  text-sm font-semibold text-brand-500
                  hover:text-brand-600"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-500 px-4 py-3
              font-semibold text-white
              transition-colors hover:bg-brand-600"
            >
              Sign Up
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-brand-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-brand-500 hover:text-brand-600"
            >
              Log In
            </a>
          </p>

        </div>
      </div>
    </section>
  );
}

export default SignupPage;