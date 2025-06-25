const { default: mongoose } = require("mongoose");
const { Hotel } = require("../../models/hotelModel");
const { User } = require("../../models/userModel");
const booking = require("../../models/bookingModel");
const bookingSms = require("../../helper/booking.Sms");
const { Tour } = require("../../models/tourModel");

function calculateTotalPrice(pricePerRoom, childPrice, rooms, start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  return pricePerRoom * rooms * diffInDays + childPrice * rooms * diffInDays;
}

function generateBookingId(place, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const placeCode = place.toUpperCase().slice(0, 3);
  const startStr = start.getDate().toString().padStart(2, "0");
  const endStr = end.getDate().toString().padStart(2, "0");
  const monthStr = (start.getMonth() + 1).toString().padStart(2, "0");
  const yearStr = start.getFullYear();

  const random = Math.floor(Math.random() * 9000 + 1000); // random 4-digit

  return `BOOK-${placeCode}-${startStr}-${endStr}-${monthStr}${yearStr}-${random}`;
}

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
      const hotelId = req.params.id;
      const hotelData = await Hotel.findById(hotelId);
      const user = await User.find({ _id: userId });
      const {
        startingDate,
        endingDate,
        roomsBooked,
        personNumber,
        childNumber,
      } = req.body;

      const available = await isHotelAvailable(
        hotelId,
        startingDate,
        endingDate,
        roomsBooked
      );

      if (!available) {
        return res
          .status(400)
          .send("Hotel not available for the selected dates and room count");
      }
      const bookingId = generateBookingId(
        hotelData.name,
        startingDate,
        endingDate
      );
      const newBooking = new booking({
        bookingId,
        personNumber,
        childNumber,
        startingDate,
        endingDate,
        roomsBooked,
        tourId: hotelData.tour,
        hotelId,
        userId: userId,
      });

      await newBooking.save();
      const tourdata = await Tour.findById(hotelData.tour);
      // Optionally, you can increment hotel.bookingCount here:
      await Hotel.findByIdAndUpdate(hotelId, { $inc: { bookingCount: 1 } });

      await bookingSms(req, user[0]);
      res.render("bookingConfirmed", {
        user: user[0],
        booking: {
          tourPlace: tourdata.place || "Unknown", // or fetch from Tour if you store name separately
          hotelName: hotelData.name,
          startingDate,
          endingDate,
          personNumber,
          childNumber,
          roomsBooked,
          totalPrice: calculateTotalPrice(
            hotelData.price,
            hotelData.childPrice,
            roomsBooked,
            startingDate,
            endingDate
          ), // optional
          bookingId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new BookingEjs();
