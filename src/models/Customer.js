import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },

    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    originalLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned user is required"],
    },

    // The assignment requires a customer status,
    // but it does not define specific status values.
    status: {
      type: String,
      default: "active",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

customerSchema.index({ email: 1 });
customerSchema.index({ originalLead: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
