const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
    },
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
    endingDate: {
      type: Date,
      required: true,
    },
    roomsBooked: {
      type: Number,
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
    schedule: {
      groupName: String, // optional but helpful for quick viewing
      startDate: Date,
      endDate: Date,
      bookedSlots: Number,
      availableSlots: Number,
    },
  },
  { timestamps: true }
);

const booking = mongoose.model("booking", bookingSchema);
module.exports = booking;
