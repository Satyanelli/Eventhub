
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  createTicket,
  getTicketsByEvent,
  updateTicket,
  type Ticket,
} from "../../api/event.api";

function ManageTicketsPage() {
  const { id } = useParams<{ id: string }>();

  // ==============================
  // CREATE TICKET FORM
  // ==============================

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // ==============================
  // EXISTING TICKETS
  // ==============================

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] =
    useState(true);

  // ==============================
  // EDIT TICKET
  // ==============================

  const [editingTicketId, setEditingTicketId] =
    useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // FETCH EXISTING TICKETS
  // ==============================

  const fetchTickets = async () => {
    if (!id) {
      setError("Event ID is missing");
      setIsTicketsLoading(false);
      return;
    }

    try {
      setIsTicketsLoading(true);
      setError("");

      const response = await getTicketsByEvent(id);

      setTickets(response.data?.tickets || []);
    } catch (error) {
      console.error(
        "Failed to fetch tickets:",
        error
      );

      setError("Failed to load tickets");
    } finally {
      setIsTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [id]);

  // ==============================
  // CREATE TICKET
  // ==============================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id) {
      setError("Event ID is missing");
      return;
    }

    if (!name || !price || !quantity) {
      setError("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      const newTicket = await createTicket(id, {
        name,
        price: Number(price),
        quantity: Number(quantity),
      });

      setTickets((currentTickets) => [
        ...currentTickets,
        newTicket,
      ]);

      setMessage("Ticket created successfully!");

      setName("");
      setPrice("");
      setQuantity("");
    } catch (error) {
      console.error(
        "Create ticket error:",
        error
      );

      setError("Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // START EDITING
  // ==============================

  const handleEdit = (ticket: Ticket) => {
    setEditingTicketId(ticket._id);

    setEditName(ticket.name);
    setEditPrice(String(ticket.price));
    setEditQuantity(String(ticket.quantity));

    setError("");
    setMessage("");
  };

  // ==============================
  // CANCEL EDIT
  // ==============================

  const handleCancelEdit = () => {
    setEditingTicketId(null);

    setEditName("");
    setEditPrice("");
    setEditQuantity("");
  };

  // ==============================
  // UPDATE TICKET
  // ==============================

  const handleUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingTicketId) {
      return;
    }

    if (!editName || !editPrice || !editQuantity) {
      setError("Please fill all fields");
      return;
    }

    try {
      setIsUpdating(true);
      setError("");
      setMessage("");

      const updatedTicket = await updateTicket(
        editingTicketId,
        {
          name: editName,
          price: Number(editPrice),
          quantity: Number(editQuantity),
        }
      );

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket._id === editingTicketId
            ? updatedTicket
            : ticket
        )
      );

      setMessage("Ticket updated successfully!");

      handleCancelEdit();
    } catch (error: any) {
      console.error(
        "Update ticket error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to update ticket"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Back */}

      <Link
        to="/organizer/dashboard"
        className="font-semibold text-brand-500 hover:text-brand-600"
      >
        ← Back to Dashboard
      </Link>

      {/* ==============================
          CREATE TICKET
      ============================== */}

      <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-brand-900">
          Manage Tickets
        </h1>

        <p className="mt-2 text-text-secondary">
          Add a ticket type for this event.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* Ticket Name */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-brand-900"
            >
              Ticket Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Example: General"
              className="w-full rounded-lg border border-brand-100 px-4 py-3
              outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Price */}

          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-semibold text-brand-900"
            >
              Price
            </label>

            <input
              id="price"
              type="number"
              min="0"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              placeholder="Example: 500"
              className="w-full rounded-lg border border-brand-100 px-4 py-3
              outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Quantity */}

          <div>
            <label
              htmlFor="quantity"
              className="mb-2 block text-sm font-semibold text-brand-900"
            >
              Capacity
            </label>

            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              placeholder="Example: 100"
              className="w-full rounded-lg border border-brand-100 px-4 py-3
              outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-brand-500 px-5 py-3
            font-semibold text-white hover:bg-brand-600
            disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Creating..."
              : "Create Ticket"}
          </button>
        </form>
      </div>

      {/* ==============================
          EXISTING TICKETS
      ============================== */}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-brand-900">
          Existing Tickets
        </h2>

        {isTicketsLoading ? (
          <div className="mt-4 rounded-xl bg-brand-50 p-6">
            <p className="text-brand-600">
              Loading tickets...
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="mt-4 rounded-xl bg-brand-50 p-6">
            <p className="text-text-secondary">
              No tickets have been created yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">

            {tickets.map((ticket) => (

              <div
                key={ticket._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                {editingTicketId === ticket._id ? (

                  /* ==============================
                     EDIT FORM
                  ============================== */

                  <form
                    onSubmit={handleUpdate}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold text-brand-900">
                      Edit Ticket
                    </h3>

                    {/* Edit Name */}

                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-brand-900"
                      >
                        Ticket Name
                      </label>

                      <input
                        type="text"
                        value={editName}
                        onChange={(e) =>
                          setEditName(e.target.value)
                        }
                        className="w-full rounded-lg border border-brand-100 px-4 py-3
                        outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    {/* Edit Price */}

                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-brand-900"
                      >
                        Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={editPrice}
                        onChange={(e) =>
                          setEditPrice(e.target.value)
                        }
                        className="w-full rounded-lg border border-brand-100 px-4 py-3
                        outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    {/* Edit Quantity */}

                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-brand-900"
                      >
                        Capacity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={editQuantity}
                        onChange={(e) =>
                          setEditQuantity(e.target.value)
                        }
                        className="w-full rounded-lg border border-brand-100 px-4 py-3
                        outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div className="flex gap-3">

                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="rounded-lg bg-brand-500 px-5 py-2
                        font-semibold text-white hover:bg-brand-600
                        disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating
                          ? "Saving..."
                          : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-lg border border-brand-200 px-5 py-2
                        font-semibold text-brand-600 hover:bg-brand-50"
                      >
                        Cancel
                      </button>

                    </div>
                  </form>

                ) : (

                  /* ==============================
                     TICKET DISPLAY
                  ============================== */

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-xl font-bold text-brand-900">
                        {ticket.name}
                      </h3>

                      <p className="mt-1 text-lg font-semibold text-brand-500">
                        ₹{ticket.price}
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
                        {ticket.availableQuantity} available
                        {" · "}
                        {ticket.quantity} total
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(ticket)
                      }
                      className="rounded-lg border border-brand-200 px-5 py-2
                      font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      Edit
                    </button>

                  </div>
                )}

              </div>

            ))}

          </div>
        )}
      </div>

    </section>
  );
}

export default ManageTicketsPage;

