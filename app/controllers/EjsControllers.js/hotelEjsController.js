const statusCode = require("../../helper/httpsStatusCode");
const { Hotel, hotelValidationSchema } = require("../../models/hotelModel");
const { Tour } = require("../../models/tourModel");
const path = require("path");
const fs = require("fs");
const booking = require("../../models/bookingModel");
const { default: mongoose } = require("mongoose");
const { Review } = require("../../models/reviewModel");
// const isHotelAvailable = require("../../helper/availableHotel");

const isHotelAvailable = async (hotelId, checkIn, checkOut, roomsRequested) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  // Get bookings that overlap
  const overlappingBookings = await booking.find({
    hotelId,
    $or: [
      {
        startingDate: { $lt: new Date(checkOut) },
        endingDate: { $gt: new Date(checkIn) },
      },
    ],
  });

  // Calculate total rooms booked during overlapping period
  // let totalRoomsBooked = 0;
  // bookings.forEach((b) => {
  //   totalRoomsBooked += b.roomsBooked;
  // });
  const totalRoomsBooked = overlappingBookings.reduce(
    (sum, booking) => sum + (booking.roomsBooked || 1),
    0
  );

  return totalRoomsBooked + roomsRequested <= hotel.total_capacity;
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
  // async getHotelBooking(req, res) {
  //   try {
  //     const { hotelId, startDate, endDate } = req.query;

  //     if (!hotelId || !startDate || !endDate) {
  //       return res.status(400).json({ message: "Missing query parameters." });
  //     }

  //     const hotelObjectId = new mongoose.Types.ObjectId(hotelId);

  //     const bookings = await booking.aggregate([
  //       {
  //         $match: {
  //           hotelId: hotelObjectId,
  //           startingDate: { $lte: new Date(endDate) },
  //           endingDate: { $gte: new Date(startDate) },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "users", // collection name in MongoDB (usually lowercase plural)
  //           localField: "userId",
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       {
  //         $unwind: "$user",
  //       },
  //       {
  //         $lookup: {
  //           from: "tours",
  //           localField: "tourId",
  //           foreignField: "_id",
  //           as: "tour",
  //         },
  //       },
  //       {
  //         $unwind: "$tour",
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           bookingId: 1,
  //           startingDate: 1,
  //           endingDate: 1,
  //           roomsBooked: 1,
  //           personNumber: 1,
  //           childNumber: 1,
  //           "user.name": 1,
  //           "user.email": 1,
  //           "tour.place": 1,
  //         },
  //       },
  //     ]);
  //     console.log("booking", bookings);

  //     // Calculate total rooms booked
  //     const totalRoomsBooked = bookings.reduce(
  //       (sum, b) => sum + (b.roomsBooked || 1),
  //       0
  //     );

  //     res.status(200).json({
  //       totalBookings: bookings.length,
  //       totalRoomsBooked,
  //       bookings,
  //     });
  //   } catch (err) {
  //     console.error("Admin booking history aggregation error:", err);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // }

  async getHotelBooking(req, res) {
    try {
      const hotels = await Hotel.find({}, "_id name");

      const { hotelId, startDate, endDate } = req.query;

      if (!hotelId || !startDate || !endDate) {
        return res.render("bookinghistory", {
          hotels,
          bookings: null,
          totalRoomsBooked: 0,
          selectedHotelId: "",
          startDate: "",
          endDate: "",
          user: req.user || null,
        });
      }

      const bookings = await booking.aggregate([
        {
          $match: {
            hotelId: new mongoose.Types.ObjectId(hotelId),
            startingDate: { $lte: new Date(endDate) },
            endingDate: { $gte: new Date(startDate) },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "tours",
            localField: "tourId",
            foreignField: "_id",
            as: "tour",
          },
        },
        { $unwind: "$tour" },
        {
          $project: {
            bookingId: 1,
            startingDate: 1,
            endingDate: 1,
            roomsBooked: 1,
            personNumber: 1,
            childNumber: 1,
            user: { name: "$user.name", email: "$user.email" },
            tour: { place: "$tour.place" },
          },
        },
      ]);

      const totalRoomsBooked = bookings.reduce(
        (sum, b) => sum + (b.roomsBooked || 1),
        0
      );

      res.render("bookinghistory", {
        hotels,
        bookings,
        totalRoomsBooked,
        selectedHotelId: hotelId,
        startDate,
        endDate,
        user: req.user || null,
      });
    } catch (err) {
      console.error("Booking history view error:", err);
      res.status(500).send("Server error");
    }
  }

  async addHotelForm(req, res) {
    try {
      const tours = await Tour.find({});
      res.render("hotelAddForm", { tours, user: req.user || null });
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
      res.render("hotelEditForm", {
        data: hotelData,
        tours,
        user: req.user || null,
      });
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
    const id = req.params.id;
    const { checkIn, checkOut, rooms } = req.query;
    const allHotels = await Hotel.find({ tour: id, isAvailable: true });
    console.log(allHotels);
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
    res.render("tourDetails", {
      tour: result[0],
      isAuthenticated: req.isAuthenticated,
      user: req.user,
      hotels: availableHotels,
      checkIn,
      checkOut,
      rooms,
      reviews,
    });
  }
}

module.exports = new HotelController();
