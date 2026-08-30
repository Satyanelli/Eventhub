
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEvents, type Event } from "../../api/event.api";

function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const data = await getMyEvents();
        setEvents(data);
      } catch (error) {
        console.error(
          "Failed to fetch organizer events:",
          error
        );
        setError("Failed to load your events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-brand-600">
          Loading your events...
        </p>
      </section>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-red-500">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-brand-900">
            Organizer Dashboard
          </h1>

          <p className="mt-2 text-text-secondary">
            Manage your events and tickets.
          </p>
        </div>

        <Link
          to="/events/create"
          className="rounded-lg bg-brand-500 px-5 py-3 text-center
          font-semibold text-white hover:bg-brand-600"
        >
          + Create Event
        </Link>

      </div>

      {/* ============================== */}
      {/* EVENTS */}
      {/* ============================== */}

      {events.length === 0 ? (

        <div className="mt-10 rounded-xl bg-brand-50 p-8 text-center">

          <h2 className="text-xl font-semibold text-brand-900">
            You haven't created any events yet
          </h2>

          <p className="mt-2 text-text-secondary">
            Create your first event to get started.
          </p>

          <Link
            to="/events/create"
            className="mt-5 inline-block rounded-lg bg-brand-500 px-5 py-3
            font-semibold text-white hover:bg-brand-600"
          >
            Create Event
          </Link>

        </div>

      ) : (

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {events.map((event) => (

            <div
              key={event._id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >

              {/* Category */}

              <p className="text-sm font-semibold uppercase text-brand-500">
                {event.category}
              </p>

              {/* Title */}

              <h2 className="mt-2 text-xl font-bold text-brand-900">
                {event.title}
              </h2>

              {/* Description */}

              <p className="mt-3 line-clamp-2 text-text-secondary">
                {event.description}
              </p>

              {/* Event information */}

              <div className="mt-4 space-y-1 text-sm text-text-secondary">

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

              {/* Status */}

              <div className="mt-4">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  {event.status}
                </span>
              </div>

              {/* Actions */}

              <div className="mt-6 flex flex-wrap gap-3">

                {/* View Event */}

                <Link
                  to={`/events/${event._id}`}
                  className="rounded-lg border border-brand-200 px-4 py-2
                  text-sm font-semibold text-brand-600
                  hover:bg-brand-50"
                >
                  View
                </Link>

                {/* Manage Tickets */}

                <Link
                  to={`/events/${event._id}/tickets`}
                  className="rounded-lg bg-brand-500 px-4 py-2
                  text-sm font-semibold text-white
                  hover:bg-brand-600"
                >
                  Manage Tickets
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}

export default OrganizerDashboard;

