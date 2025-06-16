const statusCode = require("../../helper/httpsStatusCode");
const { Food, foodSchemaValidation } = require("../../models/foodModel");
const { Tour } = require("../../models/tourModel");

class FoodController {
  async getFood(req, res) {
    try {
      const data = await Food.find({});
      res
        .status(statusCode.success)
        .json({ message: "Data fetch successfully done", data: data });
    } catch (error) {
      console.log(error);
    }
  }
  async addFoodForm(req, res) {
    try {
      const tours = await Tour.find({});
      res.render("foodAddForm",{tours});
    } catch (error) {
      console.log(error);
    }
  }
  async addFood(req, res) {
    try {
      const { error } = foodSchemaValidation.validate(req.body);
      if (error) {
        req.flash("error_msg", error.details[0].message);
        return res.redirect("/admin/foodaddform");
      }

      const {
        breakfastItems,
        lunchItems,
        snackItems,
        dinnerItems,
        breakfastTime,
        lunchTime,
        snackTime,
        dinnerTime,
        totalFoodPackage,
        tour,
      } = req.body;

      const food = new Food({
        breakfastItems,
        lunchItems,
        snackItems,
        dinnerItems,
        breakfastTime,
        lunchTime,
        snackTime,
        dinnerTime,
        totalFoodPackage,
        tour,
      });
      const data = await food.save();

      res
        .status(statusCode.create)
        .json({ message: "Food add successfull", data: data });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new FoodController();
