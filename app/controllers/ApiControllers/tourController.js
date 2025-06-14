const statusCode = require("../../helper/httpsStatusCode");
const { Tour, tourValidationSchema } = require("../../models/tourModel");

class TourController {
  async getPlace(req, res) {
    try {
      const data = await Tour.find({});
      res
        .status(statusCode.success)
        .json({ message: "Data fetch successfully done", data: data });
    } catch (error) {
      console.log(error);
    }
  }
  async addPlace(req, res) {
    try {

      const { error } = tourValidationSchema.validate(req.body);
      if (error) {
        return res.status(statusCode.badRequest).json({
          message: error.details[0].message,
        });
      }

      const {
        place,
        fullAddress,
        city,
        district,
        state,
        pin,
        country,
        description,
        price,
        packageDays,
        day,
        daySummary,
      } = req.body;

      const packageSummary = day.map((d, i) => ({
        day: d,
        daySummary: daySummary[i],
      }));
      const tour = new Tour({
        place,
        address: { fullAddress, city, district, state, pin, country },
        description,
        price,
        packageDays,
        packageSummary,
      });
      const data = await tour.save();

      res
        .status(statusCode.create)
        .json({ message: "Tour place add successfull", data: data });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new TourController();
