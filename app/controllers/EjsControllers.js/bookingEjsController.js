const { default: mongoose } = require("mongoose");
const { Hotel } = require("../../models/hotelModel");
const { User } = require("../../models/userModel");
const booking = require("../../models/bookingModel");
const bookingSms = require("../../helper/booking.Sms");

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
      const user = await User.find({ _id: userId });
      console.log(user);
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
      await bookingSms(req, user[0]);
      res.render("bookingConfirmed", { user: user[0] });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new BookingEjs();
