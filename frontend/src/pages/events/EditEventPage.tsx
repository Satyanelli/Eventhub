import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEventById,
  updateEvent,
} from "../../api/event.api";

function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    image: "",
    status: "published" as "draft" | "published",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==============================
  // LOAD EVENT
  // ==============================

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("Event ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const event = await getEventById(id);

        setFormData({
          title: event.title,
          description: event.description,
          category: event.category,
          date: event.date,
          time: event.time,
          location: event.location,
          image: event.image || "",
          status:
            event.status === "draft"
              ? "draft"
              : "published",
        });
      } catch (error: any) {
        console.error("Failed to fetch event:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load event"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // ==============================
  // HANDLE CHANGE
  // ==============================

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ==============================
  // UPDATE EVENT
  // ==============================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id) {
      setError("Event ID is missing");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateEvent(id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        image: formData.image || null,
        status: formData.status,
      });

      setSuccess("Event updated successfully!");

      setTimeout(() => {
        navigate("/organizer/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Update event error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update event"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (isLoading) {
    return (
      <section className="min-h-[calc(100vh-64px)] bg-brand-50 px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-brand-600">
            Loading event...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-64px)] bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <h1 className="text-3xl font-bold text-brand-900">
            Edit Event
          </h1>

          <p className="mt-2 text-brand-600">
            Update your event details.
          </p>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-600">
              {success}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Event Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Category
              </label>

              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Date
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Time */}
            <div>
              <label
                htmlFor="time"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Time
              </label>

              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Image */}
            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Image URL
              </label>

              <input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/event-image.jpg"
                className="w-full rounded-lg border border-brand-100 px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-brand-900"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-brand-100 bg-white px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/organizer/dashboard")
                }
                className="w-1/2 rounded-lg border border-brand-200 px-4 py-3
                font-semibold text-brand-700
                hover:bg-brand-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-1/2 rounded-lg bg-brand-500 px-4 py-3
                font-semibold text-white
                transition-colors hover:bg-brand-600
                disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Updating Event..."
                  : "Update Event"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </section>
  );
}

export default EditEventPage;