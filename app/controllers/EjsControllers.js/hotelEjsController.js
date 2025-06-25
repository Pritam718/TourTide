const statusCode = require("../../helper/httpsStatusCode");
const { Hotel, hotelValidationSchema } = require("../../models/hotelModel");
const { Tour } = require("../../models/tourModel");
const path = require("path");
const fs = require("fs");
const booking = require("../../models/bookingModel");
const { default: mongoose } = require("mongoose");
// const isHotelAvailable = require("../../helper/availableHotel");

const isHotelAvailable = async (hotelId, checkIn, checkOut, roomsRequested) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  // Get bookings that overlap
  const bookings = await booking.find({
    hotelId,
    $or: [
      {
        startingDate: { $lt: new Date(checkOut) },
        endingDate: { $gt: new Date(checkIn) },
      },
    ],
  });

  // Calculate total rooms booked during overlapping period
  let totalRoomsBooked = 0;
  bookings.forEach((b) => {
    totalRoomsBooked += b.roomsBooked;
  });

  return hotel.total_capacity - totalRoomsBooked >= roomsRequested;
};

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
        total_capacity,
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
        total_capacity,
      });

      if (req.files) {
        const imagePaths = req.files.map((file) => file.path);
        hotel.image = imagePaths;
      }

      const data = await hotel.save();
      req.flash("success_msg", "Hotel add successfull");
      return res.redirect("/admin/hoteltable");
      // res
      //   .status(statusCode.create)
      //   .json({ message: "Hotel add successfull", data: data });
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
        total_capacity,
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
        total_capacity,
      };
      const { error, value } = hotelValidationSchema.validate(data);
      if (error) {
        req.flash("error_msg", error.details[0].message);
        return res.redirect(`/admin/hotelEditPage/${id}`);
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
            total_capacity,
            image: updateImagePaths,
          },
          { new: true }
        );
      }
      req.flash("success_msg", "Update Successfully");
      return res.redirect("/admin/hoteltable");
      // return res.status(200).json({
      //   message: "Update Successfully",
      // });
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
      req.flash("delete_msg", "Delete Successfully");
      return res.redirect("/admin/hoteltable");
      // res.status(200).json({
      //   message: "Delete Successfully",
      // });
    } catch (error) {
      console.log(error);
    }
  }
  async hotelList(req, res) {
    try {
      const data = await Hotel.find();
      res.render("hotelAllDataList", {
        title: "hotel list",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async getAvailableHotels(req, res) {
    const { checkIn, checkOut, rooms } = req.query;
    const allHotels = await Hotel.find({ isAvailable: true });
    const availableHotels = [];

    for (const hotel of allHotels) {
      const available = await isHotelAvailable(
        hotel._id,
        checkIn,
        checkOut,
        parseInt(rooms)
      );
      if (available) availableHotels.push(hotel);
    }

    const id = req.params.id;
    const result = await Tour.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
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
    res.render("tourDetails", {
      tour: result[0],
      isAuthenticated: req.isAuthenticated,
      hotels: availableHotels,
      checkIn,
      checkOut,
      rooms,
    });
  }
}

module.exports = new HotelController();
