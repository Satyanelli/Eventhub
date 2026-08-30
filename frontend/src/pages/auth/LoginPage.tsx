
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth.api";

import {
  loginSchema,
  type LoginFormData,
} from "../../validators/auth.validator";


import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { setCredentials } from "../../store/slices/authSlice";


function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

const dispatch = useDispatch<AppDispatch>();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

try {
  const response = await loginUser(result.data);

  dispatch(setCredentials(response.data));

  console.log("Login successful:", response);

  navigate("/");
} catch (error) {
  console.error("Login failed:", error);
}
  };

  return (
    <section className="min-h-[calc(100vh-64px)] bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-brand-900">
              Welcome back
            </h1>

            <p className="mt-2 text-brand-600">
              Sign in to continue to EventHub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-brand-100 px-4 py-3 pr-12
                             text-brand-900 outline-none
                             focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm
                             font-semibold text-brand-500 hover:text-brand-600"
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

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-500 px-4 py-3
                         font-semibold text-white
                         transition-colors hover:bg-brand-600"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-500 hover:text-brand-600"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;