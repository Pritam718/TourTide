const mongoose = require("mongoose");
const Joi = require("joi");

const itemSchemaValidation = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().optional(),
});

const foodSchemaValidation = Joi.object({
  breakfastItems: Joi.array().items(itemSchemaValidation).optional(),
  lunchItems: Joi.array().items(itemSchemaValidation).optional(),
  snackItems: Joi.array().items(itemSchemaValidation).optional(),
  dinnerItems: Joi.array().items(itemSchemaValidation).optional(),

  breakfastTotalPrice: Joi.number().optional(),
  lunchTotalPrice: Joi.number().optional(),
  snackTotalPrice: Joi.number().optional(),
  dinnerTotalPrice: Joi.number().optional(),
});

// const foodSchemaValidation = Joi.object({
//   breakfastItems: Joi.array().items(
//     Joi.string().required(),
//     Joi.number().required()
//   ),
//   lunchItems: Joi.array().items(
//     Joi.string().required(),
//     Joi.number().required()
//   ),
//   snackItems: Joi.array().items(
//     Joi.string().required(),
//     Joi.number().required()
//   ),
//   dinnerItems: Joi.array().items(
//     Joi.string().required(),
//     Joi.number().required()
//   ),
// });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const foodSchema = new mongoose.Schema(
  {
    breakfastItems: [itemSchema],
    lunchItems: [itemSchema],
    snackItems: [itemSchema],
    dinnerItems: [itemSchema],

    // Manually entered total prices
    breakfastTotalPrice: {
      type: Number,
    },
    lunchTotalPrice: {
      type: Number,
    },
    snackTotalPrice: {
      type: Number,
    },
    dinnerTotalPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);
module.exports = { Food, foodSchemaValidation };
