import AuthButtons from "./AuthButtons";
function Navbar() {
  return (
    <header className="bg-white border-b border-brand-100">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">

        {/* Logo */}
        <div className="shrink-0">
          <span className="text-2xl font-bold text-brand-800">
            EventHub
          </span>
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="Search events"
            className="w-full rounded-lg border border-brand-100 px-4 py-2
                       text-brand-900 outline-none
                       focus:border-brand-500"
          />

          <button
            className="rounded-lg bg-brand-500 px-4 py-2 font-semibold
                       text-white transition-colors hover:bg-brand-600"
          >
            Search
          </button>
        </div>

        {/* Location */}
        <button className="text-brand-900">
          📍 Bangalore
        </button>

        {/* Create Event */}
        <button
          className="whitespace-nowrap rounded-lg bg-brand-300 px-4 py-2
                     font-semibold text-brand-900
                     transition-colors hover:bg-brand-400"
        >
          + Create Event
        </button>

        {/* Updates */}
        <button className="whitespace-nowrap text-brand-900">
          Updates
        </button>

        {/* Tickets */}
        <button className="whitespace-nowrap text-brand-900">
          Tickets
        </button>

    {/* Authentication */}
<AuthButtons />

      </nav>
    </header>
  );
}

export default Navbar;


/*
We're not hardcoding colors like:

bg-[#0F8F78]

We're using:

bg-brand-500
text-brand-900
border-brand-100

because we already created our EventHub theme variables.
*/