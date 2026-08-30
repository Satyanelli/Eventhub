import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  date: Date;
  time: string;
  location: string;
  image: string | null;
  organizer: mongoose.Types.ObjectId;
  status: "draft" | "published" | "cancelled";
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);