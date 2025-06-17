const { default: mongoose } = require("mongoose");
const { Hotel } = require("../../models/hotelModel");
const { User } = require("../../models/userModel");
const booking = require("../../models/bookingModel");

class BookingEjs {
  async bookingPage(req, res) {
    try {
      const userId = req.user ? req.user.userId : "null";
      const user = await User.findById(userId);
      const id = req.params.id;
      const result = await Hotel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "tours",
            localField: "tour",
            foreignField: "_id",
            as: "tour",
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

      // res.json(result[0]);
      res.render("bookingPage", {
        data: result[0],
        isAuthenticated: req.isAuthenticated,
        user,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async book(req, res) {
    try {
      const userId = req.user ? req.user.userId : "null";
      const id = req.params.id;
      const hotelData = await Hotel.findById(id);
      const { personNumber, childNumber, startingDate } = req.body;
      const bookingData = new booking({
        personNumber,
        childNumber,
        startingDate,
        tourId: hotelData.tour,
        hotelId: id,
        userId: userId,
      });
      const data = await bookingData.save();
      res.status(200).json({
        message: "Booking suucessfull",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new BookingEjs();
