const statusCode = require("../../helper/httpsStatusCode");
const { Food, foodSchemaValidation } = require("../../models/foodModel");

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
