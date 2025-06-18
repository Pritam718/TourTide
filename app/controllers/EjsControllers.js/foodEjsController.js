const statusCode = require("../../helper/httpsStatusCode");
const { Food, foodSchemaValidation } = require("../../models/foodModel");
const { Tour } = require("../../models/tourModel");
const path = require("path");
const fs = require("fs");
const { Hotel } = require("../../models/hotelModel");
const { log } = require("console");

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
      res.render("foodAddForm", { tours });
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
  async foodEditPage(req, res) {
    try {
      const id = req.params.id;
      const foods = await Food.findById(id);
      const tours = await Tour.find({});
      res.render("foodEditForm", { data: foods, tours });
    } catch (error) {
      console.log(error);
    }
  }
  async foodEdit(req, res) {
    try {
      const id = req.params.id;
      const existinData = await Food.findById(id);
      if (!existinData) {
        console.log("Data not found");
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

      const data = {
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
      };
      const { error, value } = foodSchemaValidation.validate(data);
      if (error) {
        console.log(error);
      } else {
        const updateData = await Food.findByIdAndUpdate(
          id,
          {
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
          },
          { new: true }
        );
        return res.status(200).json({
          message: "Update Successfully",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async deleteFood(req, res) {
    try {
      const id = req.params.id;
      const foodData = await Food.findById(id);
      if (!foodData) {
        // req.flash("error_msg", "Product not found");
        res.json("Food not found");
      }
      if (foodData.image) {
        foodData.image.map((img) => {
          const imageFullPath = path.join(__dirname, "../../", img);
          fs.unlink(imageFullPath, (err) => {
            if (err) console.error("Failed to delete image:", err);
          });
        });
      }
      await Food.findByIdAndDelete(id);
      res.status(200).json({
        message: "Delete Successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }
  async foodList(req,res){
    try {
      const data = await Food.find()
      //console.log(data);
      res.render("foodAllDataList",{
        title: "food list",
        data: data
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new FoodController();
