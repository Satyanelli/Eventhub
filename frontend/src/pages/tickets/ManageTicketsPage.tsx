import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createTicket } from "../../api/event.api";

function ManageTicketsPage() {
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

      await createTicket(id, {
        name,
        price: Number(price),
        quantity: Number(quantity),
      });

      setMessage("Ticket created successfully!");

      setName("");
      setPrice("");
      setQuantity("");
    } catch (error) {
      console.error("Create ticket error:", error);
      setError("Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/organizer/dashboard"
        className="font-semibold text-brand-500 hover:text-brand-600"
      >
        ← Back to Dashboard
      </Link>

      <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-brand-900">
          Manage Tickets
        </h1>

        <p className="mt-2 text-text-secondary">
          Add a ticket type for this event.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setPrice(e.target.value)}
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
              onChange={(e) => setQuantity(e.target.value)}
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
            {isLoading ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ManageTicketsPage;