const mongoose = require("mongoose");
// validations/reviewValidation.js
const Joi = require("joi");

const reviewValidationSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
  tour: Joi.string().optional(),
  hotel: Joi.string().optional(),
  food: Joi.string().optional(),
});

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = { Review, reviewValidationSchema };
