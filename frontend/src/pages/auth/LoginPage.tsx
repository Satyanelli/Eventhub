
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { loginUser } from "../../api/auth.api";
import { setCredentials } from "../../store/slices/authSlice";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrors({});

    // Basic validation
    if (!email.trim()) {
      setErrors({
        email: "Please enter your email address.",
      });
      return;
    }

    if (!password.trim()) {
      setErrors({
        password: "Please enter your password.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: email.trim(),
        password,
      });

      dispatch(
        setCredentials( response.data.user,
        )
      );

      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);

      setErrors({
        general:
          error.response?.data?.message ||
          "Login failed. Please check your email and password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-brand-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-brand-600">
              Login to your EventHub account
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                           text-brand-900 outline-none
                           focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-brand-100 px-4 py-3
                             pr-20 text-brand-900 outline-none
                             focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-sm font-semibold text-brand-500
                             hover:text-brand-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-brand-500 hover:text-brand-600"
              >
                Forgot Password?
              </Link>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 px-4 py-3
                         font-semibold text-white
                         transition-colors hover:bg-brand-600
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Signup Link */}
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


