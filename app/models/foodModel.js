const mongoose = require("mongoose");
const Joi = require("joi");

const itemSchemaValidation = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().optional().allow(""),
});

const foodSchemaValidation = Joi.object({
  breakfastItems: Joi.array().items(itemSchemaValidation).optional(),
  lunchItems: Joi.array().items(itemSchemaValidation).optional(),
  snackItems: Joi.array().items(itemSchemaValidation).optional(),
  dinnerItems: Joi.array().items(itemSchemaValidation).optional(),

  breakfastTime: Joi.string().required(),
  lunchTime: Joi.string().required(),
  snackTime: Joi.string().required(),
  dinnerTime: Joi.string().required(),
  totalFoodPackage: Joi.string().required(),
  tour: Joi.string().required(),
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
  price: { type: Number },
});

const foodSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    breakfastItems: [itemSchema],
    lunchItems: [itemSchema],
    snackItems: [itemSchema],
    dinnerItems: [itemSchema],

    breakfastTime: { type: String, required: true },
    lunchTime: { type: String, required: true },
    snackTime: { type: String, required: true },
    dinnerTime: { type: String, required: true },

    totalFoodPackage: { type: Number, required: true },
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);
module.exports = { Food, foodSchemaValidation };
