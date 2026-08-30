import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-500">
          Discover what's happening
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
          Find events worth experiencing.
        </h1>

        <p className="mt-5 text-lg leading-8 text-text-secondary">
          Discover concerts, workshops, conferences and experiences happening
          around you.
        </p>

        <button
          onClick={() => navigate("/events")}
          className="mt-8 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Explore Events
        </button>
      </div>
    </section>
  );
}

export default Home;