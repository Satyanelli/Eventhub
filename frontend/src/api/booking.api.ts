
import axios from "axios";

const BOOKINGS_API_URL = "http://localhost:5000/api/bookings";
const PAYMENT_API_URL = "http://localhost:5000/api/payment";

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
// RAZORPAY PAYMENT TYPES
// ==============================

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// ==============================
// CREATE RAZORPAY ORDER
// ==============================

export const createPaymentOrder = async (
  eventId: string,
  tickets: {
    ticketId: string;
    quantity: number;
  }[]
): Promise<PaymentOrder> => {
  const response = await axios.post(
    `${PAYMENT_API_URL}/create-order`,
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
// VERIFY RAZORPAY PAYMENT
// ==============================

export const verifyPayment = async (
  eventId: string,
  tickets: {
    ticketId: string;
    quantity: number;
  }[],
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<Booking> => {
  const response = await axios.post(
    `${PAYMENT_API_URL}/verify`,
    {
      eventId,
      tickets,

      // Backend expects these exact Razorpay field names
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    },
    {
      withCredentials: true,
    }
  );

  return response.data.data.booking;
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

