
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getEvents } from "../../api/event.api";

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image?: string | null;
}

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();

        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);

        setError("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ==============================
  // FILTER EVENTS
  // ==============================

  const filteredEvents = events.filter((event) => {
    const search = searchTerm.toLowerCase().trim();
    const selectedCategory = category.toLowerCase().trim();

    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search) ||
      event.description.toLowerCase().includes(search) ||
      event.category.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search);

    const matchesCategory =
      !selectedCategory ||
      event.category.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-brand-600">
          Loading events...
        </p>
      </section>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <p className="text-red-500">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-brand-900">
          Explore Events
        </h1>

        <p className="mt-2 text-text-secondary">
          {category
            ? `Events in "${category}"`
            : searchTerm
            ? `Search results for "${searchTerm}"`
            : "Find events worth experiencing."}
        </p>
      </div>

      {/* No events */}

      {events.length === 0 ? (

        <div className="mt-10 rounded-xl bg-brand-50 p-8 text-center">

          <h2 className="text-xl font-semibold text-brand-900">
            No events available
          </h2>

          <p className="mt-2 text-text-secondary">
            Check back later for upcoming events.
          </p>

        </div>

      ) : filteredEvents.length === 0 ? (

        /* No matching events */

        <div className="mt-10 rounded-xl bg-brand-50 p-8 text-center">

          <h2 className="text-xl font-semibold text-brand-900">
            No matching events
          </h2>

          <p className="mt-2 text-text-secondary">
            Try searching with a different title, category, or location.
          </p>

          <Link
            to="/events"
            className="mt-5 inline-block rounded-lg bg-brand-500 px-5 py-3
            font-semibold text-white hover:bg-brand-600"
          >
            Show All Events
          </Link>

        </div>

      ) : (

        /* Events */

        <>
          {(searchTerm || category) && (
            <p className="mt-6 text-sm text-text-secondary">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
            </p>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredEvents.map((event) => (

              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="block rounded-2xl bg-white p-6 shadow-sm
                transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Category */}

                <p className="text-sm font-semibold text-brand-500">
                  {event.category}
                </p>

                {/* Title */}

                <h2 className="mt-2 text-xl font-bold text-brand-900">
                  {event.title}
                </h2>

                {/* Description */}

                <p className="mt-2 line-clamp-3 text-text-secondary">
                  {event.description}
                </p>

                {/* Event information */}

                <div className="mt-4 space-y-2 text-sm text-text-secondary">

                  <p>
                    📅 {event.date}
                  </p>

                  <p>
                    ⏰ {event.time}
                  </p>

                  <p>
                    📍 {event.location}
                  </p>

                </div>

                {/* View details */}

                <div className="mt-5 font-semibold text-brand-500">
                  View Details →
                </div>

              </Link>

            ))}

          </div>
        </>

      )}

    </section>
  );
}

export default EventsPage;

