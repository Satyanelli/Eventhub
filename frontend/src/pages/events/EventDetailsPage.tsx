
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getEventById,
  getTicketsByEvent,
  type Event,
  type Ticket,
} from "../../api/event.api";

import {
  createPaymentOrder,
  verifyPayment,
} from "../../api/booking.api";

// ==============================
// RAZORPAY TYPES
// ==============================

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  handler: (response: RazorpayResponse) => void;

  prefill?: {
    name?: string;
    email?: string;
  };

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
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

  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  // ==============================
  // LOAD RAZORPAY CHECKOUT SCRIPT
  // ==============================

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // ==============================
  // FETCH EVENT + TICKETS
  // ==============================

  useEffect(() => {
    const fetchEventAndTickets = async () => {
      if (!id) {
        setError("Event ID is missing");
        setIsLoading(false);
        setIsTicketsLoading(false);
        return;
      }

      try {
        const eventData = await getEventById(id);

        setEvent(eventData);
        setIsLoading(false);

        const ticketResponse = await getTicketsByEvent(id);

        setTickets(ticketResponse.data?.tickets || []);
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
  // SELECT TICKET
  // ==============================

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTickets((current) => ({
      ...current,
      [ticket._id]: current[ticket._id] || 1,
    }));
  };

  // ==============================
  // INCREASE QUANTITY
  // ==============================

  const increaseQuantity = (ticket: Ticket) => {
    setSelectedTickets((current) => {
      const currentQuantity = current[ticket._id] || 0;

      if (currentQuantity >= ticket.availableQuantity) {
        return current;
      }

      return {
        ...current,
        [ticket._id]: currentQuantity + 1,
      };
    });
  };

  // ==============================
  // DECREASE QUANTITY
  // ==============================

  const decreaseQuantity = (ticketId: string) => {
    setSelectedTickets((current) => {
      const currentQuantity = current[ticketId] || 0;

      if (currentQuantity <= 1) {
        const updated = { ...current };

        delete updated[ticketId];

        return updated;
      }

      return {
        ...current,
        [ticketId]: currentQuantity - 1,
      };
    });
  };

  // ==============================
  // TOTAL AMOUNT
  // ==============================

  const totalAmount = tickets.reduce(
    (total, ticket) => {
      const quantity =
        selectedTickets[ticket._id] || 0;

      return total + ticket.price * quantity;
    },
    0
  );

  // ==============================
  // HANDLE BOOKING + PAYMENT
  // ==============================

  const handleBooking = async () => {
    if (!id) {
      return;
    }

    const bookingTickets = Object.entries(
      selectedTickets
    ).map(([ticketId, quantity]) => ({
      ticketId,
      quantity,
    }));

    if (bookingTickets.length === 0) {
      setTicketError(
        "Please select at least one ticket"
      );
      return;
    }

    try {
      setIsBooking(true);
      setTicketError("");
      setBookingSuccess("");

      // ==============================
      // LOAD RAZORPAY
      // ==============================

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setTicketError(
          "Failed to load Razorpay. Please check your internet connection."
        );
        return;
      }

      // ==============================
      // CREATE PAYMENT ORDER
      // ==============================

      const paymentOrder =
        await createPaymentOrder(
          id,
          bookingTickets
        );

      // ==============================
      // OPEN RAZORPAY CHECKOUT
      // ==============================

      const options: RazorpayOptions = {
        key: paymentOrder.keyId,

        amount: paymentOrder.amount,

        currency: paymentOrder.currency,

        name: "EventHub",

        description: `Tickets for ${event?.title || "Event"}`,

        order_id: paymentOrder.orderId,

        handler: async (
          response: RazorpayResponse
        ) => {
          try {
            setTicketError("");
            setBookingSuccess("");

            // ==============================
            // VERIFY PAYMENT
            // ==============================

            await verifyPayment(
              id,
              bookingTickets,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            // ==============================
            // PAYMENT SUCCESS
            // ==============================

            setBookingSuccess(
              "Payment successful! Your booking has been confirmed."
            );

            setSelectedTickets({});

            // Refresh ticket availability
            const ticketResponse =
              await getTicketsByEvent(id);

            setTickets(
              ticketResponse.data?.tickets || []
            );
          } catch (error: any) {
            console.error(
              "Payment verification failed:",
              error
            );

            setTicketError(
              error?.response?.data?.message ||
                "Payment verification failed. Please contact support if money was deducted."
            );
          } finally {
            setIsBooking(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsBooking(false);

            setTicketError(
              "Payment was cancelled."
            );
          },
        },

        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new window.Razorpay(
        options
      );

      razorpay.open();
    } catch (error: any) {
      console.error(
        "Payment order creation failed:",
        error
      );

      setTicketError(
        error?.response?.data?.message ||
          "Failed to start payment"
      );

      setIsBooking(false);
    }
  };

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
  // ERROR
  // ==============================

  if (error) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-red-500">{error}</p>

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

      {/* ==============================
          EVENT DETAILS
      ============================== */}

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

      {/* ==============================
          TICKETS
      ============================== */}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-brand-900">
          Tickets
        </h2>

        <p className="mt-2 text-text-secondary">
          Choose your tickets.
        </p>

        {/* Booking success */}

        {bookingSuccess && (
          <div className="mt-6 rounded-xl bg-green-50 p-6">
            <p className="font-semibold text-green-700">
              {bookingSuccess}
            </p>
          </div>
        )}

        {/* Ticket loading */}

        {isTicketsLoading && (
          <div className="mt-6 rounded-xl bg-brand-50 p-6">
            <p className="text-brand-600">
              Loading tickets...
            </p>
          </div>
        )}

        {/* Ticket error */}

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
          tickets.length > 0 && (
            <div className="mt-6 space-y-4">
              {tickets.map((ticket) => {
                const selectedQuantity =
                  selectedTickets[ticket._id] || 0;

                return (
                  <div
                    key={ticket._id}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-brand-900">
                        {ticket.name}
                      </h3>

                      <p className="mt-1 text-2xl font-bold text-brand-500">
                        ₹{ticket.price}
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
                        {ticket.availableQuantity}{" "}
                        tickets available
                      </p>
                    </div>

                    {/* Selection controls */}

                    {selectedQuantity === 0 ? (
                      <button
                        type="button"
                        disabled={
                          ticket.availableQuantity === 0
                        }
                        onClick={() =>
                          handleSelectTicket(ticket)
                        }
                        className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {ticket.availableQuantity === 0
                          ? "Sold Out"
                          : "Select"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(ticket._id)
                          }
                          className="h-10 w-10 rounded-lg bg-brand-100 text-lg font-bold text-brand-900 hover:bg-brand-200"
                        >
                          −
                        </button>

                        <span className="w-8 text-center font-bold">
                          {selectedQuantity}
                        </span>

                        <button
                          type="button"
                          disabled={
                            selectedQuantity >=
                            ticket.availableQuantity
                          }
                          onClick={() =>
                            increaseQuantity(ticket)
                          }
                          className="h-10 w-10 rounded-lg bg-brand-100 text-lg font-bold text-brand-900 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        {/* ==============================
            BOOKING SUMMARY
        ============================== */}

        {Object.keys(selectedTickets).length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-brand-900">
              Booking Summary
            </h3>

            <div className="mt-4 space-y-2">
              {tickets.map((ticket) => {
                const quantity =
                  selectedTickets[ticket._id] || 0;

                if (quantity === 0) {
                  return null;
                }

                return (
                  <div
                    key={ticket._id}
                    className="flex justify-between"
                  >
                    <span>
                      {ticket.name} × {quantity}
                    </span>

                    <span className="font-semibold">
                      ₹{ticket.price * quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-brand-100 pt-4">
              <div className="flex justify-between text-xl font-bold text-brand-900">
                <span>Total</span>

                <span>₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBooking}
              disabled={isBooking}
              className="mt-6 w-full rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBooking
                ? "Processing..."
                : "Pay & Book Tickets"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default EventDetailsPage;

