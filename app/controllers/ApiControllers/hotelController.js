const statusCode = require("../../helper/httpsStatusCode");
const {Hotel,hotelValidationSchema} = require("../../models/hotelModel");

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
        return res.status(statusCode.badRequest).json({
          message: error.details[0].message,
        });
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
