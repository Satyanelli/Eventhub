import { useState } from "react";

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

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
            A
          </span>
        </div>

        {/* User Name */}
        <span className="text-sm font-medium">
          ajay@example.com
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
          <div className="border-b border-brand-100 px-3 py-3">
            <p className="font-semibold text-brand-900">
              Ajay Sharma
            </p>

            <p className="text-sm text-brand-500">
              ajay@example.com
            </p>
          </div>

          <div className="py-2">
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-brand-900 hover:bg-brand-50">
              Browse Events
            </button>

            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-brand-900 hover:bg-brand-50">
              Create an Event
            </button>

            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-brand-900 hover:bg-brand-50">
              My Tickets
            </button>

            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-brand-900 hover:bg-brand-50">
              Get Help
            </button>

            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-brand-900 hover:bg-brand-50">
              Account Settings
            </button>
          </div>

          <div className="border-t border-brand-100 pt-2">
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;