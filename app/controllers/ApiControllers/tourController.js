const statusCode = require("../../helper/httpsStatusCode");
const Tour = require("../../models/tourModel");

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
      const {
        place,
        fullAddress,
        city,
        district,
        state,
        pin,
        description,
        price,
        packageDays,
        day,
        daySummary,
      } = req.body;
      console.log(req.body);

      const packageSummary = day.map((d, i) => ({
        day: d,
        daySummary: daySummary[i],
      }));
      const tour = new Tour({
        place,
        address: { fullAddress, city, district, state, pin },
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
