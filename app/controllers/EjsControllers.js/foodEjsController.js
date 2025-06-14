const statusCode = require("../../helper/httpsStatusCode");
const { Food, foodSchemaValidation } = require("../../models/foodModel");

class FoodController {
    async getHotel(req, res) {
        try {
            const data = await Food.find({});
            res
                .status(statusCode.success)
                .json({ message: "Data fetch successfully done", data: data });
        } catch (error) {
            console.log(error);
        }
    }
    async addHotel(req, res) {
        try {

            const { error } = foodSchemaValidation.validate(req.body);
            if (error) {
                console.log(error);
                req.flash("error_msg", error.details[0].message);
                return res.redirect("");
            }

            const {
                name,
                price,
               
            } = req.body;

            const hotel = new Food({
               
            });
            const data = await hotel.save();

            res
                .status(statusCode.create)
                .json({ message: "Food add successfull", data: data });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new FoodController();