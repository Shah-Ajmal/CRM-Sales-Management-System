import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
      minlength: [2, "Deal title must be at least 2 characters"],
      maxlength: [150, "Deal title cannot exceed 150 characters"],
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned user is required"],
    },

    amount: {
      type: Number,
      required: [true, "Deal amount is required"],
      min: [0, "Deal amount cannot be negative"],
    },

    stage: {
      type: String,
      enum: {
        values: ["qualification", "proposal", "negotiation", "won", "lost"],
        message: "Invalid deal stage",
      },
      default: "qualification",
    },

    expectedClosingDate: {
      type: Date,
      required: [true, "Expected closing date is required"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

dealSchema.index({ customer: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ createdAt: -1 });

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
