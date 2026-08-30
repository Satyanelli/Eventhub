
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getEventById,
  getTicketsByEvent,
} from "../../api/event.api";

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image?: string | null;
  status: "draft" | "published" | "cancelled";
  organizer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Ticket {
  _id: string;
  event: string;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
}

function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);

  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");

  useEffect(() => {
    const fetchEventAndTickets = async () => {
      if (!id) {
        setError("Event ID is missing");
        setIsLoading(false);
        setIsTicketsLoading(false);
        return;
      }

      try {
        setError("");
        setTicketError("");

        const eventData = await getEventById(id);
        setEvent(eventData);

       const ticketResponse = await getTicketsByEvent(id);

        setTickets(ticketResponse);

      } catch (error) {
        console.error(
          "Failed to fetch event details:",
          error
        );

        setError("Failed to load event");
        setTicketError("Failed to load tickets");
      } finally {
        setIsLoading(false);
        setIsTicketsLoading(false);
      }
    };

    fetchEventAndTickets();
  }, [id]);

  // ==============================
  // SELECT TICKET QUANTITY
  // ==============================

  const increaseQuantity = (ticket: Ticket) => {
    setSelectedTickets((previous) => {
      const currentQuantity = previous[ticket._id] || 0;

      if (currentQuantity >= ticket.availableQuantity) {
        return previous;
      }

      return {
        ...previous,
        [ticket._id]: currentQuantity + 1,
      };
    });
  };

  const decreaseQuantity = (ticketId: string) => {
    setSelectedTickets((previous) => {
      const currentQuantity = previous[ticketId] || 0;

      if (currentQuantity <= 0) {
        return previous;
      }

      const updated = {
        ...previous,
        [ticketId]: currentQuantity - 1,
      };

      if (updated[ticketId] === 0) {
        delete updated[ticketId];
      }

      return updated;
    });
  };

  // ==============================
  // TOTAL PRICE
  // ==============================

  const totalAmount = tickets.reduce((total, ticket) => {
    const quantity = selectedTickets[ticket._id] || 0;

    return total + ticket.price * quantity;
  }, 0);

  const totalTickets = Object.values(selectedTickets).reduce(
    (total, quantity) => total + quantity,
    0
  );

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-brand-600">
          Loading event...
        </p>
      </section>
    );
  }

  // ==============================
  // EVENT ERROR
  // ==============================

  if (error) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-red-500">
          {error}
        </p>

        <Link
          to="/events"
          className="mt-4 inline-block font-semibold text-brand-500"
        >
          ← Back to Events
        </Link>
      </section>
    );
  }

  // ==============================
  // EVENT NOT FOUND
  // ==============================

  if (!event) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-text-secondary">
          Event not found.
        </p>

        <Link
          to="/events"
          className="mt-4 inline-block font-semibold text-brand-500"
        >
          ← Back to Events
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Back */}
      <Link
        to="/events"
        className="font-semibold text-brand-500 hover:text-brand-600"
      >
        ← Back to Events
      </Link>

      {/* ============================== */}
      {/* EVENT DETAILS */}
      {/* ============================== */}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">

        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="h-64 w-full object-cover"
          />
        )}

        <div className="p-8">

          <p className="text-sm font-semibold uppercase text-brand-500">
            {event.category}
          </p>

          <h1 className="mt-2 text-4xl font-bold text-brand-900">
            {event.title}
          </h1>

          <p className="mt-6 leading-7 text-text-secondary">
            {event.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-sm text-text-secondary">
                Date
              </p>

              <p className="mt-1 font-semibold text-brand-900">
                {event.date}
              </p>
            </div>

            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-sm text-text-secondary">
                Time
              </p>

              <p className="mt-1 font-semibold text-brand-900">
                {event.time}
              </p>
            </div>

            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-sm text-text-secondary">
                Location
              </p>

              <p className="mt-1 font-semibold text-brand-900">
                {event.location}
              </p>
            </div>

          </div>

          {event.organizer && (
            <div className="mt-8 border-t border-brand-100 pt-6">

              <p className="text-sm text-text-secondary">
                Organized by
              </p>

              <p className="mt-1 font-semibold text-brand-900">
                {event.organizer.firstName}{" "}
                {event.organizer.lastName}
              </p>

            </div>
          )}

        </div>
      </div>

      {/* ============================== */}
      {/* TICKETS */}
      {/* ============================== */}

      <div className="mt-8">

        <h2 className="text-2xl font-bold text-brand-900">
          Tickets
        </h2>

        <p className="mt-2 text-text-secondary">
          Choose your ticket quantity.
        </p>

        {/* Loading */}

        {isTicketsLoading && (
          <div className="mt-6 rounded-xl bg-brand-50 p-6">
            <p className="text-brand-600">
              Loading tickets...
            </p>
          </div>
        )}

        {/* Error */}

        {!isTicketsLoading && ticketError && (
          <div className="mt-6 rounded-xl bg-red-50 p-6">
            <p className="text-red-500">
              {ticketError}
            </p>
          </div>
        )}

        {/* No tickets */}

        {!isTicketsLoading &&
          !ticketError &&
          tickets.length === 0 && (
            <div className="mt-6 rounded-xl bg-brand-50 p-8 text-center">

              <h3 className="text-lg font-semibold text-brand-900">
                No tickets available
              </h3>

              <p className="mt-2 text-text-secondary">
                Tickets for this event haven't been added yet.
              </p>

            </div>
          )}

        {/* Ticket list */}

        {!isTicketsLoading &&
          !ticketError &&
          tickets.length > 0 && (
            <div className="mt-6 space-y-4">

              {tickets.map((ticket) => {
                const selectedQuantity =
                  selectedTickets[ticket._id] || 0;

                return (
                  <div
                    key={ticket._id}
                    className="flex flex-col gap-4 rounded-2xl
                    bg-white p-6 shadow-sm
                    sm:flex-row sm:items-center
                    sm:justify-between"
                  >

                    {/* Ticket information */}

                    <div>
                      <h3 className="text-xl font-bold text-brand-900">
                        {ticket.name}
                      </h3>

                      <p className="mt-1 text-2xl font-bold text-brand-500">
                        ₹{ticket.price}
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
                        {ticket.availableQuantity} tickets available
                      </p>
                    </div>

                    {/* Quantity controls */}

                    {ticket.availableQuantity > 0 ? (
                      <div className="flex items-center gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(ticket._id)
                          }
                          disabled={selectedQuantity === 0}
                          className="flex h-10 w-10 items-center
                          justify-center rounded-lg border
                          border-brand-200 text-lg font-bold
                          text-brand-600 hover:bg-brand-50
                          disabled:cursor-not-allowed
                          disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center text-lg font-semibold text-brand-900">
                          {selectedQuantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(ticket)
                          }
                          disabled={
                            selectedQuantity >=
                            ticket.availableQuantity
                          }
                          className="flex h-10 w-10 items-center
                          justify-center rounded-lg bg-brand-500
                          text-lg font-bold text-white
                          hover:bg-brand-600
                          disabled:cursor-not-allowed
                          disabled:opacity-40"
                        >
                          +
                        </button>

                      </div>
                    ) : (
                      <span className="rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-500">
                        Sold Out
                      </span>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        {/* ============================== */}
        {/* ORDER SUMMARY */}
        {/* ============================== */}

        {!isTicketsLoading &&
          !ticketError &&
          totalTickets > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-text-secondary">
                    Tickets selected
                  </p>

                  <p className="mt-1 text-xl font-bold text-brand-900">
                    {totalTickets}
                  </p>
                </div>

                <div className="text-right">

                  <p className="text-sm text-text-secondary">
                    Total amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-brand-500">
                    ₹{totalAmount}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-lg bg-brand-500
                px-6 py-3 font-semibold text-white
                hover:bg-brand-600"
              >
                Book / Checkout
              </button>

            </div>
          )}

      </div>

    </section>
  );
}

export default EventDetailsPage;

