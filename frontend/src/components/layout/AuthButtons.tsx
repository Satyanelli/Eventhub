import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../store/store";
import { clearCredentials } from "../../store/slices/authSlice";
import { logoutUser } from "../../api/auth.api";

function AuthButtons() {
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = async () => {
    try {
      await logoutUser();

      dispatch(clearCredentials());
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">

        {/* Organizer Dashboard */}
        {user.role === "organizer" && (
          <Link
            to="/organizer/dashboard"
            className="whitespace-nowrap rounded-lg px-4 py-2
                       font-semibold text-brand-800
                       transition-colors hover:bg-brand-50"
          >
            Organizer Dashboard
          </Link>
        )}

        {/* My Bookings */}
        {user.role === "attendee" && (
          <Link
            to="/my-bookings"
            className="whitespace-nowrap rounded-lg px-4 py-2
                       font-semibold text-brand-800
                       transition-colors hover:bg-brand-50"
          >
            My Bookings
          </Link>
        )}

        {/* User */}
        <span className="font-semibold text-brand-900">
          Hi, {user.firstName}
        </span>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="whitespace-nowrap rounded-lg px-4 py-2
                     font-semibold text-brand-800
                     transition-colors hover:bg-brand-50"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">

      {/* Login */}
      <Link
        to="/login"
        className="whitespace-nowrap rounded-lg px-4 py-2
                   font-semibold text-brand-800
                   transition-colors hover:bg-brand-50"
      >
        Log In
      </Link>

      {/* Signup */}
      <Link
        to="/register"
        className="whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2
                   font-semibold text-white transition-colors
                   hover:bg-brand-600"
      >
        Sign Up
      </Link>

    </div>
  );
}

export default AuthButtons;