const { required } = require("joi");
const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    place: {
      type: String,
      required: true,
    },
    address: {
      fullAddress: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pin: {
        type: Number,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    packageDays: {
      type: Number,
      required: true,
    },
    packageSummary: [
      {
        day: [
          {
            type: String,
            required: true,
          },
        ],
        daySummary: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
