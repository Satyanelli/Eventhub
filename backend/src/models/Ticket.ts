
import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  event: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
}

const ticketSchema = new Schema<ITicket>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.model<ITicket>(
  "Ticket",
  ticketSchema
);

