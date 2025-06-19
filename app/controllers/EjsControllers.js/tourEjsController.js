const { default: mongoose } = require("mongoose");
const statusCode = require("../../helper/httpsStatusCode");
const { Tour, tourValidationSchema } = require("../../models/tourModel");
const path = require("path");
const fs = require("fs");
const { title } = require("process");

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
  async specificTourDetails(req, res) {
    try {
      const id = req.params.id;
      const result = await Tour.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        // {
        //   $lookup: {
        //     from: "hotels",
        //     localField: "_id",
        //     foreignField: "tour",
        //     as: "hotels",
        //   },
        // },
        {
          $lookup: {
            from: "foods",
            localField: "_id",
            foreignField: "tour",
            as: "foods",
          },
        },
      ]);
      // res.json(result);
      res.render("tourDetails", {
        tour: result[0],
        isAuthenticated: req.isAuthenticated,
        hotels: 0,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async tourAddForm(req, res) {
    try {
      res.render("tourAddForm");
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
  async tourEditPage(req, res) {
    try {
      const id = req.params.id;
      const existinData = await Tour.findById(id);
      if (!existinData) {
        console.log("Tour not found");
      }
      res.render("tourEditForm", { data: existinData });
    } catch (error) {
      console.log(error);
    }
  }
  async tourEdit(req, res) {
    try {
      const id = req.params.id;
      const existinData = await Tour.findById(id);
      if (!existinData) {
        console.log("Data not found");
      }
      let updateImagePaths = existinData.image;

      if (req.files && req.files.length > 0) {
        existinData.image.map((img) => {
          const imageFullPath = path.join(__dirname, "../../../", img);
          fs.unlink(imageFullPath, (err) => {
            if (err) console.error("Failed to delete image", err);
          });
        });
        updateImagePaths = req.files.map((file) => file.path);
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
      const data = {
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
      };
      const { error, value } = tourValidationSchema.validate(data);
      if (error) {
        console.log(error);
      } else {
        const updateData = await Tour.findByIdAndUpdate(
          id,
          {
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
            image: updateImagePaths,
          },
          { new: true }
        );
      }
      return res.status(200).json({
        message: "Update Successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteTour(req, res) {
    try {
      const id = req.params.id;
      const tourData = await Tour.findById(id);

      if (!tourData) {
        return res.status(404).json({ message: "Tour not found" });
      }

      if (tourData.image) {
        tourData.image.map((img) => {
          const imageFullPath = path.join(__dirname, "../../../", img);
          fs.unlink(imageFullPath, (err) => {
            if (err) console.error("Failed to delete image:", err);
          });
        });
      }

      // Delete tour data from DB
      await Tour.findByIdAndDelete(id);

      res.status(200).json({
        message: "Tour deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting tour:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async tourList(req, res) {
    try {
      const data = await Tour.find();
      res.render("tourAllDataList", {
        title: "tour list",
        data: data,
      });
    } catch (error) {
      console.log(err);
    }
  }
}

module.exports = new TourEjsController();
