
import axios from "axios";

const BOOKINGS_API_URL = "http://localhost:5000/api/bookings";

// ==============================
// TYPES
// ==============================

export interface BookingTicket {
  ticket: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Booking {
  _id: string;
  user: string;
  event:
    | string
    | {
        _id: string;
        title: string;
        date: string;
        time: string;
        location: string;
        image?: string | null;
      };
  tickets: BookingTicket[];
  totalAmount: number;
  status: "confirmed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

// ==============================
// CREATE BOOKING
// ==============================

export const createBooking = async (
  eventId: string,
  tickets: {
    ticketId: string;
    quantity: number;
  }[]
): Promise<Booking> => {
  const response = await axios.post(
    BOOKINGS_API_URL,
    {
      eventId,
      tickets,
    },
    {
      withCredentials: true,
    }
  );

  return response.data.data;
};

// ==============================
// GET MY BOOKINGS
// ==============================

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await axios.get(
    `${BOOKINGS_API_URL}/my-bookings`,
    {
      withCredentials: true,
    }
  );

  return response.data.data;
};

// ==============================
// CANCEL BOOKING
// ==============================

export const cancelBooking = async (
  bookingId: string
): Promise<Booking> => {
  const response = await axios.patch(
    `${BOOKINGS_API_URL}/${bookingId}/cancel`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data.data;
};

