
import axios from "axios";

const EVENTS_API_URL = "http://localhost:5000/api/events";
const TICKETS_API_URL = "http://localhost:5000/api/tickets";

// ==============================
// EVENT TYPES
// ==============================

export interface Event {
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
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ==============================
// CREATE EVENT DATA
// ==============================

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image?: string | null;
  status?: "draft" | "published" | "cancelled";
}

// ==============================
// TICKET TYPES
// ==============================

export interface Ticket {
  _id: string;
  event: string;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
}

// ==============================
// GET ALL PUBLISHED EVENTS
// ==============================

export const getEvents = async (): Promise<Event[]> => {
  const response = await axios.get(EVENTS_API_URL);

  return response.data;
};

// ==============================
// GET ORGANIZER'S OWN EVENTS
// ==============================

export const getMyEvents = async (): Promise<Event[]> => {
  const response = await axios.get(
    `${EVENTS_API_URL}/my-events`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// ==============================
// GET SINGLE EVENT
// ==============================

export const getEventById = async (
  id: string
): Promise<Event> => {
  const response = await axios.get(
    `${EVENTS_API_URL}/${id}`
  );

  return response.data;
};

// ==============================
// CREATE EVENT
// ==============================

export const createEvent = async (
  eventData: CreateEventData
): Promise<Event> => {
  const response = await axios.post(
    EVENTS_API_URL,
    eventData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// ==============================
// UPDATE EVENT
// ==============================

export const updateEvent = async (
  id: string,
  eventData: Partial<CreateEventData>
): Promise<Event> => {
  const response = await axios.patch(
    `${EVENTS_API_URL}/${id}`,
    eventData,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// ==============================
// DELETE EVENT
// ==============================

export const deleteEvent = async (id: string) => {
  const response = await axios.delete(
    `${EVENTS_API_URL}/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

// ==============================
// GET TICKETS FOR EVENT
// ==============================

export const getTicketsByEvent = async (
  eventId: string
): Promise<Ticket[]> => {
  const response = await axios.get(
    `${TICKETS_API_URL}/event/${eventId}`
  );

  // Backend returns:
  // { success: true, data: [...] }

  return response.data.data;
};

// ==============================
// CREATE TICKET
// ==============================

export const createTicket = async (
  eventId: string,
  ticketData: {
    name: string;
    price: number;
    quantity: number;
  }
): Promise<Ticket> => {
  const response = await axios.post(
    `${TICKETS_API_URL}/event/${eventId}`,
    ticketData,
    {
      withCredentials: true,
    }
  );

  // Backend returns:
  // { success: true, data: ticket }

  return response.data.data;
};

