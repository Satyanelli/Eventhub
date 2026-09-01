import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthButtons from "./AuthButtons";

function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const search = searchTerm.trim();

    if (!search) {
      navigate("/events");
      return;
    }

    navigate(`/events?search=${encodeURIComponent(search)}`);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="border-b border-brand-100 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">

        {/* Logo */}
        <div className="shrink-0">
          <Link
            to="/"
            className="text-2xl font-bold text-brand-800"
          >
            EventHub
          </Link>
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Search events"
            className="w-full rounded-lg border border-brand-100 px-4 py-2
                       text-brand-900 outline-none
                       focus:border-brand-500"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-lg bg-brand-500 px-4 py-2 font-semibold
                       text-white transition-colors hover:bg-brand-600"
          >
            Search
          </button>
        </div>

        {/* Location */}
        <button
          type="button"
          className="whitespace-nowrap text-brand-900"
        >
          📍 Hyderabad
        </button>

        {/* Create Event */}
        <Link
          to="/events/create"
          className="whitespace-nowrap rounded-lg bg-brand-300 px-4 py-2
                     font-semibold text-brand-900
                     transition-colors hover:bg-brand-400"
        >
          + Create Event
        </Link>

        {/* Updates */}
        <button
          type="button"
          className="whitespace-nowrap text-brand-900"
        >
          Updates
        </button>

        {/* My Bookings */}
        <Link
          to="/my-bookings"
          className="whitespace-nowrap text-brand-900 hover:text-brand-500"
        >
          My Bookings
        </Link>

        {/* Authentication */}
        <AuthButtons />

      </nav>
    </header>
  );
}

export default Navbar;