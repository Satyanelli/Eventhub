
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import {
  getMyBookings,
  cancelBooking,
  type Booking,
} from "../../api/booking.api";

import { generateTicketPdf } from "../../utils/ticketPdf";

function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState<string | null>(
    null
  );

  // ==============================
  // FETCH BOOKINGS
  // ==============================

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getMyBookings();

      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);

      setError("Failed to load your bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ==============================
  // CANCEL BOOKING
  // ==============================

  const handleCancelBooking = async (
    bookingId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");

      await cancelBooking(bookingId);

      await fetchBookings();
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to cancel booking"
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ==============================
  // DOWNLOAD TICKET PDF
  // ==============================

  const handleDownloadTicket = (booking: Booking) => {
    const event =
      typeof booking.event === "string"
        ? null
        : booking.event;

    if (!event) {
      setError(
        "Event details are not available for this booking."
      );
      return;
    }

    generateTicketPdf({
      bookingId: booking._id,
      eventName: event.title,
      date: new Date(event.date).toLocaleDateString(),
      time: event.time,
      location: event.location,
      tickets: booking.tickets,
      totalAmount: booking.totalAmount,
    });
  };

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-brand-600">
          Loading your bookings...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900">
          My Bookings
        </h1>

        <p className="mt-2 text-text-secondary">
          View and manage your event bookings.
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4">
          <p className="text-red-500">
            {error}
          </p>
        </div>
      )}

      {/* Empty state */}

      {bookings.length === 0 && !error && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-brand-900">
            No bookings yet
          </h2>

          <p className="mt-2 text-text-secondary">
            You haven't booked any events yet.
          </p>

          <Link
            to="/events"
            className="mt-6 inline-block rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
          >
            Browse Events
          </Link>
        </div>
      )}

      {/* Booking list */}

      {bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const event =
              typeof booking.event === "string"
                ? null
                : booking.event;

            return (
              <div
                key={booking._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                {/* Event */}

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-900">
                      {event?.title || "Event"}
                    </h2>

                    {event && (
                      <div className="mt-2 space-y-1 text-sm text-text-secondary">
                        <p>
                          📅{" "}
                          {new Date(
                            event.date
                          ).toLocaleDateString()}
                        </p>

                        <p>
                          🕐 {event.time}
                        </p>

                        <p>
                          📍 {event.location}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status */}

                  <div>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status === "confirmed"
                        ? "Confirmed"
                        : "Cancelled"}
                    </span>
                  </div>
                </div>

                {/* Tickets */}

                <div className="mt-6 border-t border-brand-100 pt-6">
                  <h3 className="font-semibold text-brand-900">
                    Tickets
                  </h3>

                  <div className="mt-3 space-y-2">
                    {booking.tickets.map(
                      (ticket, index) => (
                        <div
                          key={`${ticket.ticket}-${index}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-text-secondary">
                            {ticket.name} ×{" "}
                            {ticket.quantity}
                          </span>

                          <span className="font-semibold text-brand-900">
                            ₹
                            {ticket.price *
                              ticket.quantity}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* QR CODE */}

                {booking.status === "confirmed" && (
                  <div className="mt-6 border-t border-brand-100 pt-6">
                    <div className="flex flex-col items-center rounded-xl bg-gray-50 p-6">
                      <h3 className="text-lg font-bold text-brand-900">
                        Your Ticket QR Code
                      </h3>

                      <p className="mt-2 text-center text-sm text-text-secondary">
                        Show this QR code at the event entrance.
                      </p>

                      <div className="mt-5 rounded-xl bg-white p-4 shadow-sm">
                        <QRCodeSVG
                          value={booking._id}
                          size={220}
                          level="H"
                        />
                      </div>

                      <p className="mt-4 text-xs text-text-secondary">
                        Booking ID: {booking._id}
                      </p>
                    </div>
                  </div>
                )}

                {/* Total */}

                <div className="mt-6 flex flex-col gap-4 border-t border-brand-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">
                      Total Amount
                    </p>

                    <p className="text-2xl font-bold text-brand-500">
                      ₹{booking.totalAmount}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Download PDF */}

                    {booking.status === "confirmed" &&
                      event && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadTicket(
                              booking
                            )
                          }
                          className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
                        >
                          📄 Download Ticket PDF
                        </button>
                      )}

                    {/* Cancel */}

                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        disabled={
                          cancellingId === booking._id
                        }
                        onClick={() =>
                          handleCancelBooking(
                            booking._id
                          )
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancellingId === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyBookingsPage;

