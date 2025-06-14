const Joi = require("joi");
const mongoose = require("mongoose");

const tourValidationSchema = Joi.object({
  place: Joi.string().required(),
  fullAddress: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  state: Joi.string().required(),
  pin: Joi.number().required(),
  country: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  packageDays: Joi.number().required(),
  packageSummary: Joi.array()
    .items(
      Joi.object({
        day: Joi.array().items(Joi.string().required()).required(),
        daySummary: Joi.array().items(Joi.string().required()).required(),
      })
    )
    .required(),
});

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
    image: {
      type: [String],
      require: true,
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
module.exports = { Tour, tourValidationSchema };
