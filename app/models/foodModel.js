const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number },
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
module.exports = Food;
