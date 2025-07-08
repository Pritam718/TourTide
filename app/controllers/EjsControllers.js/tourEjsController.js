const { default: mongoose } = require("mongoose");
const statusCode = require("../../helper/httpsStatusCode");
const { Tour, tourValidationSchema } = require("../../models/tourModel");
const path = require("path");
const fs = require("fs");
const { Review } = require("../../models/reviewModel");
const bucket = require("../../firebaseConfig/firebaseConfig");

class TourEjsController {
  async tourPackagePage(req, res) {
    try {
      const tourData = await Tour.find({});
      res.render("tourPackages", {
        tour: tourData,
        isAuthenticated: req.isAuthenticated,
        user: req.user,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async searchTour(req, res) {
    try {
      const city = req.query.city;
      const tourData = await Tour.aggregate([
        { $match: { "address.city": { $regex: city, $options: "i" } } },
      ]);
      res.render("tourPackages", {
        tour: tourData,
        isAuthenticated: req.isAuthenticated,
        user: req.user || null,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async searchCity(req, res) {
    try {
      const city = req.params.city;
      const tourData = await Tour.aggregate([
        { $match: { "address.city": { $regex: city, $options: "i" } } },
      ]);
      res.render("tourPackages", {
        tour: tourData,
        isAuthenticated: req.isAuthenticated,
        user: req.user || null,
      });
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
        {
          $lookup: {
            from: "hotels",
            localField: "_id",
            foreignField: "tour",
            as: "hotels",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "_id",
            foreignField: "tour",
            as: "foods",
          },
        },
      ]);
      const reviews = await Review.aggregate([
        {
          $match: { tour: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $project: {
            _id: 1,
            rating: 1,
            comment: 1,
            createdAt: 1,
            "userData.name": 1,
          },
        },
      ]);
      // res.json(result);
      res.render("tourDetails", {
        tour: result[0],
        isAuthenticated: req.isAuthenticated,
        user: req.user,
        hotels: 0,
        reviews,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async tourAddForm(req, res) {
    try {
      res.render("tourAddForm", { user: req.user || null });
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
        scheduleDuration,
        scheduleGroup,
        scheduleStart,
        scheduleEnd,
        scheduleSlots,
        amenities,
      } = req.body;

      // 1. Handle packageSummary and schedules based on durations
      let packageSummary = [];
      let schedules = [];

      let dayIndex = 0;
      for (let i = 0; i < scheduleDuration.length; i++) {
        const duration = parseInt(scheduleDuration[i]);

        const dayItems = [];
        const daySummaries = [];

        for (let j = 0; j < duration; j++) {
          dayItems.push(day[dayIndex]);
          daySummaries.push(daySummary[dayIndex]);
          dayIndex++;
        }

        packageSummary.push({
          day: dayItems,
          daySummary: daySummaries,
        });

        schedules.push({
          duration,
          groupName: scheduleGroup[i],
          startDate: new Date(scheduleStart[i]),
          endDate: new Date(scheduleEnd[i]),
          availableSlots: parseInt(scheduleSlots[i]),
          bookedSlots: 0,
        });
      }

      // 2. Create the new tour object
      const tour = new Tour({
        place,
        address: { fullAddress, city, district, state, pin, country },
        description,
        price,
        packageDays,
        packageSummary,
        schedules,
        amenities: Array.isArray(amenities) ? amenities : [amenities],
      });

      // 3. Save images if uploaded
      if (req.files && req.files.length > 0) {
        // const imagePaths = req.files.map((file) => file.path);
        console.log(req.files);
        const imagePaths = await Promise.all(
          req.files.map(async (file) => {
            const firebasepath = `tours/${Date.now()}_${file.originalname}`;
            await bucket.file(firebasepath).save(file.buffer, {
              public: true,
              metadata: { contentType: file.mimetype },
            });
            return `https://storage.googleapis.com/${bucket.name}/${firebasepath}`;
          })
        );
        tour.image = imagePaths;
      }

      // 4. Save to database
      await tour.save();

      req.flash("success_msg", "Tour place added successfully");
      return res.redirect("/admin/tourtable");
    } catch (error) {
      console.error("Add Place Error:", error);
      req.flash("error_msg", "Something went wrong. Please try again.");
      return res.redirect("/admin/touraddform");
    }
  }

  async tourEditPage(req, res) {
    try {
      const id = req.params.id;
      const existinData = await Tour.findById(id);
      if (!existinData) {
        console.log("Tour not found");
      }
      res.render("tourEditForm", { data: existinData, user: req.user || null });
    } catch (error) {
      console.log(error);
    }
  }
  async tourEdit(req, res) {
    try {
      const id = req.params.id;
      console.log(req.body);
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
        day,
        daySummary,
        scheduleDuration,
        scheduleGroup,
        scheduleStart,
        scheduleEnd,
        scheduleSlots,
        amenities,
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
        day,
        daySummary,
      };

      req.body.scheduleDuration = req.body.scheduleDuration.map(Number);
      req.body.scheduleSlots = req.body.scheduleSlots.map(Number);
      req.body.scheduleStart = req.body.scheduleStart.map(
        (date) => new Date(date)
      );
      req.body.scheduleEnd = req.body.scheduleEnd.map((date) => new Date(date));
      req.body.day = req.body.day.map((val) => val.toString());
      req.body.daySummary = req.body.daySummary.map((val) => val.toString());
      req.body.price = Number(req.body.price);
      req.body.pin = Number(req.body.pin);
      req.body.amenities = Array.isArray(amenities) ? amenities : [amenities];

      // Validate
      const { error } = tourValidationSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        console.log(error.details); // important
        return res.status(400).json({ error: error.details });
      }

      // Handle images
      const tour = await Tour.findById(id);
      const updateImagePaths = tour.image;

      // Ensure all fields are arrays
      const scheduleDurationArray = Array.isArray(scheduleDuration)
        ? scheduleDuration
        : [scheduleDuration];
      const scheduleGroupArray = Array.isArray(scheduleGroup)
        ? scheduleGroup
        : [scheduleGroup];
      const scheduleStartArray = Array.isArray(scheduleStart)
        ? scheduleStart
        : [scheduleStart];
      const scheduleEndArray = Array.isArray(scheduleEnd)
        ? scheduleEnd
        : [scheduleEnd];
      const scheduleSlotsArray = Array.isArray(scheduleSlots)
        ? scheduleSlots
        : [scheduleSlots];

      // Build schedules
      const schedules = scheduleDurationArray.map((duration, i) => ({
        duration: parseInt(duration),
        groupName: scheduleGroupArray[i],
        startDate: new Date(scheduleStartArray[i]),
        endDate: new Date(scheduleEndArray[i]),
        availableSlots: parseInt(scheduleSlotsArray[i]),
        bookedSlots: 0,
      }));

      await Tour.findByIdAndUpdate(
        id,
        {
          place,
          address: { fullAddress, city, district, state, pin, country },
          description,
          price,
          amenities: req.body.amenities,
          packageSummary: day.map((d, i) => ({
            day: d,
            daySummary: daySummary[i],
          })),
          schedules,
          image: updateImagePaths,
        },
        { new: true }
      );

      req.flash("success_msg", "Tour updated successfully");
      return res.redirect("/admin/tourtable");
    } catch (error) {
      console.error("Error in tourEdit:", error);
      req.flash("error_msg", "Something went wrong while updating the tour.");
      return res.redirect(`/admin/tourEditPage/${req.params.id}`);
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

      req.flash("delete_msg", "Delete Successfully");
      return res.redirect("/admin/tourtable");
      // res.status(200).json({
      //   message: "Tour deleted successfully",
      // });
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
