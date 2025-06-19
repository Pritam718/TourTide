const mongoose = require("mongoose");
const Joi = require("joi");

const hotelValidationSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  bedRoom: Joi.number().integer().min(0).required(),
  hallRoom: Joi.number().integer().min(0).required(),
  kitchen: Joi.number().integer().min(0).required(),
  bathRoom: Joi.number().integer().min(0).required(),
  minPerson: Joi.number().integer().min(1).required(),
  maxPerson: Joi.number().integer().min(Joi.ref("minPerson")).required(),
  extraAdult: Joi.number().integer().min(0).optional(),
  extraChild: Joi.number().integer().min(0).optional(),
  price: Joi.number().min(0).required(),
  childPrice: Joi.number().min(0).optional(),
  total_capacity: Joi.number().min(0).required(),
  accommodation: Joi.string().required(),
  tour: Joi.string().required(),
});

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
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
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
    image: {
      type: [String],
      require: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
    total_capacity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);
module.exports = { Hotel, hotelValidationSchema };
