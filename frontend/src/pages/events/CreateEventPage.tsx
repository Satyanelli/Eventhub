import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../../api/event.api";

function CreateEventPage() {
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await createEvent({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        image: formData.image || null,
        status: formData.status,
      });

      setSuccess("Event created successfully!");

      setTimeout(() => {
        navigate("/events");
      }, 1000);
    } catch (error: any) {
      console.error("Create event error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create event"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <h1 className="text-3xl font-bold text-brand-900">
            Create Event
          </h1>

          <p className="mt-2 text-brand-600">
            Create and publish your event on EventHub.
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
                placeholder="Enter event title"
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
                placeholder="Describe your event"
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

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 bg-white px-4 py-3
                text-brand-900 outline-none
                focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Dance">Dance</option>
                <option value="Sports">Sports</option>
                <option value="Arts & Culture">Arts & Culture</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="Festivals">Festivals</option>
                <option value="Health & Wellness">Health & Wellness</option>
              </select>
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
                placeholder="Event location"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-brand-500 px-4 py-3
              font-semibold text-white
              transition-colors hover:bg-brand-600
              disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Creating Event..." : "Create Event"}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}

export default CreateEventPage;