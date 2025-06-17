const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    personNumber: {
      type: Number,
      required: true,
    },
    childNumber: {
      type: Number,
      default: 0,
    },
    startingDate: {
      type: Date,
      required: true,
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const booking = mongoose.model("booking", bookingSchema);
module.exports = booking;
