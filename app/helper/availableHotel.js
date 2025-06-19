const booking = require("../models/bookingModel");
const { Hotel } = require("../models/hotelModel");

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
  console.log(bookings);
  // Calculate total rooms booked during overlapping period
  let totalRoomsBooked = 0;
  bookings.forEach((b) => {
    totalRoomsBooked += b.roomsBooked;
  });

  return hotel.total_capacity - totalRoomsBooked >= roomsRequested;
};
