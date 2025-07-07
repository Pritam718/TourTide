const { default: mongoose } = require("mongoose");
const { Hotel } = require("../../models/hotelModel");
const { User } = require("../../models/userModel");
const booking = require("../../models/bookingModel");
const bookingSms = require("../../helper/booking.Sms");
const { Tour } = require("../../models/tourModel");
const crypto = require("crypto");

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
      const userId = req.user ? req.user.userId : null;
      const user = await User.findById(userId);

      const tourId = req.params.tourId;
      const scheduleIndex = req.query.scheduleIndex;

      if (!tourId || scheduleIndex === undefined) {
        return res.status(400).send("Missing tour ID or schedule index");
      }

      const tour = await Tour.findById(tourId);
      if (!tour) return res.status(404).send("Tour not found");

      const schedule = tour.schedules[scheduleIndex];
      const summary = tour.packageSummary[scheduleIndex];

      if (!schedule) return res.status(400).send("Invalid schedule index");

      res.render("bookingPage", {
        isAuthenticated: req.isAuthenticated,
        user,
        tour,
        schedule,
        summary,
        scheduleIndex,
      });
    } catch (error) {
      console.error("bookingPage error:", error);
      res.status(500).send("Internal server error");
    }
  }

  async book(req, res) {
    try {
      const userId = req.user ? req.user.userId : null;
      const tourId = req.params.tourId;
      const scheduleIndex = req.query.scheduleIndex;

      const {
        personNumber,
        childNumber,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;
      if (!isAuthentic) {
        return res.status(400).send("Payment verification failed");
      }

      if (!tourId || scheduleIndex === undefined) {
        return res.status(400).send("Missing tourId or scheduleIndex");
      }

      const tourData = await Tour.findById(tourId);
      if (!tourData) {
        return res.status(404).send("Tour not found");
      }
      const hotelData = await Hotel.find({ tour: tourId });

      const schedule = tourData.schedules[scheduleIndex];
      if (!schedule) {
        return res.status(400).send("Invalid schedule index");
      }

      const availableSlots = schedule.availableSlots - schedule.bookedSlots;

      if (availableSlots < parseInt(personNumber) + parseInt(childNumber)) {
        return res
          .status(400)
          .send("Not enough slots available for selected schedule");
      }

      const bookingId = generateBookingId(
        tourData.place,
        schedule.startDate,
        schedule.endDate
      );

      const newBooking = new booking({
        bookingId,
        personNumber,
        childNumber,
        startingDate: schedule.startDate,
        endingDate: schedule.endDate,
        tourId: tourId,
        userId: userId,
        hotelId: hotelData[0]._id,
        roomsBooked: hotelData[0].roomsBooked,
        schedule: {
          groupName: schedule.groupName,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
        },
      });

      await newBooking.save();

      // Update bookedSlots in the tour's selected schedule
      tourData.schedules[scheduleIndex].bookedSlots +=
        parseInt(personNumber) + parseInt(childNumber);
      await tourData.save();

      const user = await User.findById(userId);
      await bookingSms(req, user);

      res.render("bookingConfirmed", {
        user,
        booking: {
          tourPlace: tourData.place,
          startingDate: schedule.startDate,
          endingDate: schedule.endDate,
          personNumber,
          childNumber,
          totalPrice:
            tourData.price * (parseInt(personNumber) + parseInt(childNumber)), // Simplified pricing
          bookingId,
          groupName: schedule.groupName,
          hotelName: hotelData[0].name,
          roomsBooked: hotelData[0].roomsBooked,
        },
      });
    } catch (error) {
      console.error("Booking Error:", error);
      res.status(500).send("Something went wrong while booking");
    }
  }
}

module.exports = new BookingEjs();
