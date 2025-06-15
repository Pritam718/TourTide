const statusCode = require("../../helper/httpsStatusCode");
const { Hotel, hotelValidationSchema } = require("../../models/hotelModel");
const { Tour } = require("../../models/tourModel");

class HotelController {
  async getHotel(req, res) {
    try {
      const data = await Hotel.aggregate([
        {
          $lookup: {
            from: "tours",
            localField: "tour",
            foreignField: "_id",
            as: "tourInfo",
          },
        },
      ]);
      res
        .status(statusCode.success)
        .json({ message: "Data fetch successfully done", data: data });
    } catch (error) {
      console.log(error);
    }
  }
  async addHotelForm(req, res) {
    try {
      const tours = await Tour.find({});
      res.render("hotelAddForm", { tours });
    } catch (error) {
      console.log(error);
    }
  }

  async addHotel(req, res) {
    try {
      const { error } = hotelValidationSchema.validate(req.body);
      if (error) {
        console.log(error);
        req.flash("error_msg", error.details[0].message);
        return res.redirect("/admin/hoteladdform");
      }

      const {
        name,
        location,
        bedRoom,
        hallRoom,
        kitchen,
        bathRoom,
        minPerson,
        maxPerson,
        extraAdult,
        extraChild,
        price,
        childPrice,
        accommodation,
        tour,
      } = req.body;

      const hotel = new Hotel({
        name,
        location,
        bedRoom,
        hallRoom,
        kitchen,
        bathRoom,
        occupancy: { minPerson, maxPerson, extraAdult, extraChild },
        price,
        childPrice,
        accommodation,
        tour,
      });

      if (req.files) {
        const imagePaths = req.files.map((file) => file.path);
        hotel.image = imagePaths;
      }

      const data = await hotel.save();

      res
        .status(statusCode.create)
        .json({ message: "Hotel add successfull", data: data });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new HotelController();
