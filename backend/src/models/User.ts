import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["attendee", "organizer", "admin"],
      default: "attendee",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },

    companyName: {
      type: String,
      default: null,
    },

    website: {
      type: String,
      default: null,
    },

    address: {
      address1: {
        type: String,
        default: null,
      },

      address2: {
        type: String,
        default: null,
      },

      country: {
        type: String,
        default: null,
      },

      state: {
        type: String,
        default: null,
      },

      postalCode: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;