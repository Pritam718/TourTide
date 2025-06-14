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

      const { breakfastItems, lunchItems, snackItems, dinnerItems } = req.body;

      const breakfastTotalPrice = breakfastItems.reduce(
        (accumulator, currentVal) => {
          return accumulator + Number(currentVal.price);
        },
        0
      );
      const lunchTotalPrice = lunchItems.reduce((accumulator, currentVal) => {
        return accumulator + Number(currentVal.price);
      }, 0);
      const snackTotalPrice = snackItems.reduce((accumulator, currentVal) => {
        return accumulator + Number(currentVal.price);
      }, 0);
      const dinnerTotalPrice = dinnerItems.reduce((accumulator, currentVal) => {
        return accumulator + Number(currentVal.price);
      }, 0);

      const food = new Food({
        breakfastItems,
        breakfastTotalPrice,
        lunchItems,
        lunchTotalPrice,
        snackItems,
        snackTotalPrice,
        dinnerItems,
        dinnerTotalPrice,
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
