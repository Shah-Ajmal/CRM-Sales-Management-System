import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Activity subject is required"],
      trim: true,
      minlength: [2, "Activity subject must be at least 2 characters"],
      maxlength: [150, "Activity subject cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Activity description cannot exceed 1000 characters"],
    },

    type: {
      type: String,
      required: [true, "Activity type is required"],
      enum: {
        values: ["call", "email", "meeting", "follow_up"],
        message: "Invalid activity type",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: "Invalid activity status",
      },
      default: "pending",
    },

    dueDate: {
      type: Date,
      required: [true, "Activity due date is required"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned user is required"],
    },

    relatedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    relatedDeal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
    },

    relatedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({ assignedTo: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ dueDate: 1 });
activitySchema.index({ relatedLead: 1 });
activitySchema.index({ relatedDeal: 1 });
activitySchema.index({ relatedCustomer: 1 });
activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
