
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import AuthButtons from "./AuthButtons";
import type { RootState } from "../../store/store";

function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  const navigate = useNavigate();

  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const categories = [
    "Technology",
    "Music",
    "Dance",
    "Entertainment",
    "Sports",
    "Arts & Culture",
    "Business",
    "Education",
    "Food & Drink",
    "Festivals",
    "Health & Wellness",
  ];

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

  const handleCategoryClick = (category: string) => {
    navigate(
      `/events?category=${encodeURIComponent(category)}`
    );

    setShowCategories(false);
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

        {/* Categories */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowCategories((previous) => !previous)
            }
            className="whitespace-nowrap font-semibold text-brand-900
                       transition-colors hover:text-brand-600"
          >
            Categories ▾
          </button>

          {showCategories && (
            <div
              className="absolute right-0 top-10 z-50 w-56
                         rounded-xl border border-brand-100
                         bg-white p-2 shadow-lg"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    handleCategoryClick(category)
                  }
                  className="block w-full rounded-lg px-4 py-2
                             text-left text-sm text-brand-900
                             transition-colors hover:bg-brand-50"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Event - Organizer Only */}
        {!isLoading &&
          isAuthenticated &&
          user?.role === "organizer" && (
            <Link
              to="/events/create"
              className="whitespace-nowrap rounded-lg bg-brand-300 px-4 py-2
                         font-semibold text-brand-900
                         transition-colors hover:bg-brand-400"
            >
              + Create Event
            </Link>
          )}

        {/* Authentication */}
        <AuthButtons />

      </nav>
    </header>
  );
}

export default Navbar;

