const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    // tourPlace: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Tour",
    // },
    bedRoom: {
      type: Number,
      required: true,
    },
    hallRoom: {
      type: Number,
      required: true,
    },
    kitchen: {
      type: Number,
      required: true,
    },
    bathRoom: {
      type: Number,
      required: true,
    },
    occupancy: {
      minPerson: {
        type: Number,
        required: true,
      },
      maxPerson: {
        type: Number,
        required: true,
      },
      extraAdult: {
        type: Number,
      },
      extraChild: {
        type: Number,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    childPrice: {
      type: Number,
    },
    accommodation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);
module.exports = Hotel;
