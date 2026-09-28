import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      minlength: [2, "Lead name must be at least 2 characters"],
      maxlength: [100, "Lead name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Lead email is required"],
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Lead phone is required"],
      trim: true,
    },

    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    source: {
      type: String,
      trim: true,
      maxlength: [50, "Source cannot exceed 50 characters"],
    },

    status: {
      type: String,
      enum: {
        values: ["new", "contacted", "qualified", "lost", "converted"],
        message: "Invalid lead status",
      },
      default: "new",
    },

    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Invalid lead priority",
      },
      default: "medium",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: {
      type: String,
      trim: true,
    },

    convertedToCustomer: {
      type: Boolean,
      default: false,
    },

    convertedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    convertedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
