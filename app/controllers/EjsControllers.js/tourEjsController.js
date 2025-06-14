const statusCode = require("../../helper/httpsStatusCode");
const { Tour, tourValidationSchema } = require("../../models/tourModel");

class TourEjsController {
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
        console.log(error);
        req.flash("error_msg", error.details[0].message);
        return res.redirect("/admin/touraddform");
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

      if (req.files) {
        const imagePaths = req.files.map((file) => file.path);
        tour.image = imagePaths;
      }

      const data = await tour.save();

      res
        .status(statusCode.create)
        .json({ message: "Tour place add successfull", data: data });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new TourEjsController();
