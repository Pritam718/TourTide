const statusCode = require("../../helper/httpsStatusCode");
const { Hotel, hotelValidationSchema } = require("../../models/hotelModel");
const { Tour } = require("../../models/tourModel");
const path = require("path");
const fs = require("fs");

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
  async hotelEditPage(req, res) {
    try {
      const id = req.params.id;
      const tours = await Tour.find({});
      const hotelData = await Hotel.findById(id);
      if (!hotelData) {
        console.log("Hotel data not found");
      }
      res.render("hotelEditForm", { data: hotelData, tours });
    } catch (error) {
      console.log(error);
    }
  }
  async hotelEdit(req, res) {
    try {
      const id = req.params.id;
      const existinData = await Hotel.findById(id);
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

      const data = {
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
      };
      const { error, value } = hotelValidationSchema.validate(data);
      if (error) {
        console.log(error);
      } else {
        const updateData = await Hotel.findByIdAndUpdate(
          id,
          {
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
  async deleteHotel(req, res) {
    try {
      const id = req.params.id;
      const hotelData = await Hotel.findById(id);
      if (!hotelData) {
        // req.flash("error_msg", "Product not found");
        res.json("Food not found");
      }
      if (hotelData.image) {
        hotelData.image.map((img) => {
          const imageFullPath = path.join(__dirname, "../../../", img);

          fs.unlink(imageFullPath, (err) => {
            if (err) res.json("Failed to delete image:", err);
          });
        });
      }
      await Hotel.findByIdAndDelete(id);
      res.status(200).json({
        message: "Delete Successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new HotelController();
