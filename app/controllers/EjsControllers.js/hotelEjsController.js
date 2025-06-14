const statusCode = require("../../helper/httpsStatusCode");
const { Hotel, hotelValidationSchema } = require("../../models/hotelModel");

class HotelController {
  async getHotel(req, res) {
    try {
      const data = await Hotel.find({});
      res
        .status(statusCode.success)
        .json({ message: "Data fetch successfully done", data: data });
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
