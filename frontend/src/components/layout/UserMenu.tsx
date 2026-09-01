
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../store/store";
import { logoutUser } from "../../store/slices/authSlice";

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(
    (state: RootState) => state.auth.user
  );
console.log("Logged in user:", user);
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setIsOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return null;
  }

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="relative">

      {/* Profile Button */}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2
                   text-brand-900 transition-colors
                   hover:bg-brand-50"
      >

        {/* Profile Icon */}

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
          <span className="text-sm font-semibold text-brand-800">
            {initials || "U"}
          </span>
        </div>

        {/* User Name */}

        <span className="max-w-32 truncate text-sm font-medium">
          {user.firstName} {user.lastName}
        </span>

        {/* Dropdown Arrow */}

        <span className="text-xs">
          ▼
        </span>
      </button>

      {/* Dropdown */}

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl
                     border border-brand-100 bg-white p-2 shadow-lg"
        >

          {/* User Information */}

          <div className="border-b border-brand-100 px-3 py-3">
            <p className="font-semibold text-brand-900">
              {user.firstName} {user.lastName}
            </p>

            <p className="text-sm text-brand-500">
              {user.email}
            </p>

            <p className="mt-1 text-xs capitalize text-text-secondary">
              {user.role}
            </p>
          </div>

          <div className="py-2">

            {/* Browse Events */}

            <Link
              to="/events"
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-lg px-3 py-2 text-sm
                         text-brand-900 hover:bg-brand-50"
            >
              Browse Events
            </Link>

            {/* Attendee */}

            {user.role === "attendee" && (
              <Link
                to="/my-bookings"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg px-3 py-2 text-sm
                           text-brand-900 hover:bg-brand-50"
              >
                My Bookings
              </Link>
            )}

            {/* Organizer */}

            {user.role === "organizer" && (
              <>
                <Link
                  to="/organizer/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block w-full rounded-lg px-3 py-2 text-sm
                             text-brand-900 hover:bg-brand-50"
                >
                  Organizer Dashboard
                </Link>

                <Link
                  to="/events/create"
                  onClick={() => setIsOpen(false)}
                  className="block w-full rounded-lg px-3 py-2 text-sm
                             text-brand-900 hover:bg-brand-50"
                >
                  Create an Event
                </Link>
              </>
            )}

            {/* Account Settings */}

            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm
                         text-brand-900 hover:bg-brand-50"
            >
              Account Settings
            </button>

          </div>

          {/* Logout */}

          <div className="border-t border-brand-100 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm
                         text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default UserMenu;

